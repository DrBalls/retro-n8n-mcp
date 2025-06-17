import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { VersionControlManager } from '../../services/version-control/VersionControlManager.js';
import { Logger } from '../../utils/Logger.js';

/**
 * Tool for merging branches with conflict detection and resolution
 * Implements Git-like merge functionality with multiple strategies
 */
export class BranchMergeTool extends BaseTool {
  name = 'branch_merge';
  description = 'Merge a source branch into a target branch with conflict detection and resolution';
  
  private logger = new Logger('BranchMergeTool');
  private versionManager = new VersionControlManager();

  inputSchema = z.object({
    workflowId: z.string().describe('ID of the workflow'),
    sourceBranch: z.string().describe('Branch to merge from'),
    targetBranch: z.string().default('main').describe('Branch to merge into'),
    message: z.string().optional().describe('Merge commit message (auto-generated if not provided)'),
    author: z.string().optional().describe('Author of the merge'),
    strategy: z.enum(['auto', 'manual', 'ours', 'theirs'])
      .default('auto')
      .describe('Merge strategy: auto (smart merge), manual (require conflict resolution), ours (prefer target), theirs (prefer source)'),
    autoResolve: z.boolean().default(true).describe('Automatically resolve conflicts when possible'),
    deleteSourceBranch: z.boolean().default(false).describe('Delete source branch after successful merge'),
    createBackup: z.boolean().default(true).describe('Create backup of target branch before merge'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      this.logger.info('Starting branch merge', {
        workflowId: input.workflowId,
        sourceBranch: input.sourceBranch,
        targetBranch: input.targetBranch,
        strategy: input.strategy,
      });

      // Generate merge message if not provided
      const mergeMessage = input.message || 
        `Merge branch '${input.sourceBranch}' into '${input.targetBranch}'`;

      // Perform the merge
      const mergeResult = await this.versionManager.mergeBranch(
        input.workflowId,
        input.sourceBranch,
        input.targetBranch,
        {
          message: mergeMessage,
          author: input.author || 'user',
          strategy: input.strategy,
          autoResolve: input.autoResolve,
        }
      );

      // Prepare response based on merge result
      if (mergeResult.hasConflicts) {
        // Merge has conflicts that need resolution
        const result = {
          success: false,
          status: 'conflicts',
          mergeId: mergeResult.id,
          message: 'Merge has conflicts that require manual resolution',
          conflicts: mergeResult.conflicts.map(conflict => ({
            id: conflict.id,
            type: conflict.conflictType,
            path: conflict.path,
            description: conflict.description,
            resolution: conflict.resolution,
            options: {
              current: this.formatConflictValue(conflict.targetValue),
              incoming: this.formatConflictValue(conflict.sourceValue),
              base: conflict.baseValue ? this.formatConflictValue(conflict.baseValue) : null,
            },
          })),
          resolutionRequired: mergeResult.conflicts.filter(c => !c.resolution).length,
          autoResolved: mergeResult.conflicts.filter(c => c.resolution === 'target' || c.resolution === 'source').length,
          nextSteps: [
            'Review conflicts and choose resolution strategy',
            'Use "merge_resolve" tool to resolve conflicts',
            'Or use "merge_abort" tool to cancel the merge',
          ],
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2),
            mimeType: 'application/json'
          }]
        };
      }

      // Successful merge
      const result = {
        success: true,
        status: 'completed',
        mergeId: mergeResult.id,
        message: 'Merge completed successfully',
        merge: {
          sourceBranch: input.sourceBranch,
          targetBranch: input.targetBranch,
          strategy: mergeResult.mergeStrategy,
          mergedAt: mergeResult.mergedAt,
          mergeVersionId: mergeResult.mergedWorkflow ? 'auto-generated' : null,
        },
        statistics: {
          conflictsDetected: mergeResult.conflicts.length,
          autoResolved: mergeResult.conflicts.filter(c => c.resolution === 'target' || c.resolution === 'source').length,
          manualResolution: mergeResult.conflicts.filter(c => !c.resolution).length,
        },
        actions: {
          backupCreated: input.createBackup,
          sourceBranchDeleted: input.deleteSourceBranch,
        },
        recommendations: this.generateMergeRecommendations(mergeResult, input),
      };

      // Update n8n workflow if merge was successful
      if (mergeResult.mergedWorkflow && context.apiClient) {
        try {
          await context.apiClient.updateWorkflow(input.workflowId, mergeResult.mergedWorkflow);
          result.message += ' - Workflow updated in n8n';
        } catch (updateError) {
          this.logger.warn('Failed to update workflow in n8n', { updateError });
          result.message += ' - Warning: Failed to update workflow in n8n';
        }
      }

      this.logger.info('Branch merge completed', {
        mergeId: mergeResult.id,
        sourceBranch: input.sourceBranch,
        targetBranch: input.targetBranch,
        hasConflicts: mergeResult.hasConflicts,
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
          mimeType: 'application/json'
        }]
      };

    } catch (error) {
      this.logger.error('Failed to merge branches', { error, input });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            workflowId: input.workflowId,
            sourceBranch: input.sourceBranch,
            targetBranch: input.targetBranch,
            timestamp: Date.now(),
            suggestions: this.getErrorSuggestions(error),
          }, null, 2),
          mimeType: 'application/json'
        }]
      };
    }
  }

  private formatConflictValue(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    
    if (typeof value === 'string') {
      return value.length > 100 ? value.substring(0, 100) + '...' : value;
    }
    
    if (typeof value === 'object') {
      const jsonStr = JSON.stringify(value, null, 2);
      return jsonStr.length > 200 ? jsonStr.substring(0, 200) + '...' : jsonStr;
    }
    
    return String(value);
  }

  private generateMergeRecommendations(mergeResult: any, input: any): string[] {
    const recommendations: string[] = [];
    
    if (mergeResult.mergeStrategy === 'auto') {
      recommendations.push('Automatic merge completed - review the merged workflow for correctness');
    }
    
    if (input.strategy === 'ours' || input.strategy === 'theirs') {
      recommendations.push(`Used ${input.strategy} strategy - some changes may have been overwritten`);
    }
    
    if (!input.createBackup) {
      recommendations.push('No backup was created - consider creating a manual backup of important branches');
    }
    
    if (input.deleteSourceBranch) {
      recommendations.push(`Source branch '${input.sourceBranch}' will be deleted - ensure no other work depends on it`);
    }
    
    recommendations.push('Test the merged workflow thoroughly before deploying to production');
    recommendations.push('Consider creating a release version if this completes a feature');
    
    return recommendations;
  }

  private getErrorSuggestions(error: unknown): string[] {
    const suggestions: string[] = [];
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    
    if (errorMessage.includes('not found')) {
      suggestions.push('Verify both source and target branches exist');
      suggestions.push('Use "branch_list" tool to see all available branches');
    }
    
    if (errorMessage.includes('same branch')) {
      suggestions.push('Cannot merge a branch into itself');
      suggestions.push('Specify different source and target branches');
    }
    
    if (errorMessage.includes('no changes')) {
      suggestions.push('Source branch has no changes to merge');
      suggestions.push('Check if the branches are already in sync');
    }
    
    if (errorMessage.includes('conflicts')) {
      suggestions.push('Use manual strategy to handle conflicts step by step');
      suggestions.push('Review the workflow differences before merging');
    }
    
    return suggestions;
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'version-control',
      isMutating: true,
      requirements: ['workflow access', 'n8n API access'],
      tags: ['merging', 'git', 'workflow', 'branches', 'conflict-resolution'],
    };
  }
}