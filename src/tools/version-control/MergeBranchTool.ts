import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { VersionControlService } from '../../services/VersionControlService.js';

export class MergeBranchTool extends BaseTool {
  name = 'version_control_merge_branch';
  description = 'Merge one branch into another with conflict detection and resolution strategies';
  
  inputSchema = z.object({
    workflowId: z.string().describe('The ID of the workflow'),
    sourceBranchName: z.string().describe('Name of the branch to merge from'),
    targetBranchName: z.string().default('main').describe('Name of the branch to merge into'),
    strategy: z.enum(['auto', 'manual', 'ours', 'theirs']).default('auto').describe('Merge strategy'),
    commitMessage: z.string().optional().describe('Custom commit message for the merge'),
    author: z.string().optional().describe('Author of the merge'),
    deleteSourceBranch: z.boolean().default(false).describe('Delete source branch after successful merge'),
    dryRun: z.boolean().default(false).describe('Preview merge conflicts without actually merging'),
  });

  private versionControlService = new VersionControlService();

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      // Perform the merge
      const mergeResult = await this.versionControlService.mergeBranch(
        input.workflowId,
        input.sourceBranchName,
        input.targetBranchName,
        {
          strategy: input.strategy,
          commitMessage: input.commitMessage,
          author: input.author,
          deleteSourceBranch: input.deleteSourceBranch && !input.dryRun,
        }
      );

      const response: any = {
        success: !mergeResult.hasConflicts || input.dryRun,
        mergeId: mergeResult.id,
        sourceBranch: input.sourceBranchName,
        targetBranch: input.targetBranchName,
        strategy: mergeResult.mergeStrategy,
        hasConflicts: mergeResult.hasConflicts,
        isAutoMergeable: mergeResult.isAutoMergeable,
        conflictCount: mergeResult.conflicts.length,
      };

      if (input.dryRun) {
        response.message = 'Dry run completed - no changes made';
        response.dryRun = true;
      } else if (mergeResult.hasConflicts) {
        response.message = 'Merge conflicts detected - manual resolution required';
        response.status = 'conflicts';
      } else if (mergeResult.mergedAt) {
        response.message = `Successfully merged '${input.sourceBranchName}' into '${input.targetBranchName}'`;
        response.status = 'merged';
        response.mergedAt = mergeResult.mergedAt;
      } else {
        response.message = 'Merge analysis completed - additional action required';
        response.status = 'pending';
      }

      // Include conflict details if any
      if (mergeResult.conflicts.length > 0) {
        response.conflicts = mergeResult.conflicts.map(conflict => ({
          id: conflict.id,
          path: conflict.path,
          type: conflict.conflictType,
          description: conflict.description,
          hasResolution: !!conflict.resolution,
        }));

        response.resolutionOptions = {
          auto: 'Attempt automatic resolution',
          manual: 'Manually resolve each conflict',
          ours: `Keep all changes from '${input.targetBranchName}'`,
          theirs: `Keep all changes from '${input.sourceBranchName}'`,
        };
      }

      // Include next steps
      response.nextSteps = [];
      if (mergeResult.hasConflicts && !input.dryRun) {
        response.nextSteps.push('Resolve conflicts using the merge conflict resolution tool');
        response.nextSteps.push('Re-run merge after conflicts are resolved');
      } else if (!mergeResult.hasConflicts && !input.dryRun) {
        response.nextSteps.push('Merge completed successfully');
        if (input.deleteSourceBranch) {
          response.nextSteps.push(`Branch '${input.sourceBranchName}' has been deleted`);
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2),
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to merge branch: ${errorMessage}`);
    }
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'version-control',
      isMutating: true,
      requirements: ['n8n API access'],
      tags: ['version-control', 'workflow', 'merge', 'branch', 'git'],
    };
  }
}