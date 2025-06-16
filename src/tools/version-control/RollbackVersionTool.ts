import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { VersionControlService } from '../../services/VersionControlService.js';

export class RollbackVersionTool extends BaseTool {
  name = 'version_control_rollback';
  description = 'Rollback a workflow to a specific previous version with backup creation';
  
  inputSchema = z.object({
    workflowId: z.string().describe('The ID of the workflow to rollback'),
    targetVersionId: z.string().describe('The version ID to rollback to'),
    branchName: z.string().default('main').describe('Branch to perform rollback on'),
    commitMessage: z.string().optional().describe('Custom commit message for the rollback'),
    author: z.string().optional().describe('Author of the rollback'),
    createBackup: z.boolean().default(true).describe('Create backup of current state before rollback'),
    dryRun: z.boolean().default(false).describe('Preview rollback without making changes'),
  });

  private versionControlService = new VersionControlService();

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      // Get the target version to validate it exists
      const targetVersion = await this.versionControlService.getVersionHistory(
        input.workflowId, 
        { limit: 1000 }
      ).then(versions => versions.find(v => v.id === input.targetVersionId));

      if (!targetVersion) {
        throw new Error(`Target version ${input.targetVersionId} not found`);
      }

      // Get current version for comparison
      const currentVersions = await this.versionControlService.getVersionHistory(
        input.workflowId,
        { branchName: input.branchName, limit: 1 }
      );

      const currentVersion = currentVersions[0];

      if (input.dryRun) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              dryRun: true,
              rollback: {
                workflowId: input.workflowId,
                currentVersion: currentVersion ? {
                  id: currentVersion.id,
                  versionString: currentVersion.versionString,
                  createdAt: currentVersion.createdAt,
                } : null,
                targetVersion: {
                  id: targetVersion.id,
                  versionString: targetVersion.versionString,
                  createdAt: targetVersion.createdAt,
                  commitMessage: targetVersion.commitMessage,
                },
                branchName: input.branchName,
                willCreateBackup: input.createBackup,
              },
              message: 'Rollback preview completed - no changes made',
              impact: {
                description: `Will rollback from ${currentVersion?.versionString || 'current'} to ${targetVersion.versionString}`,
                changeCount: targetVersion.changes.length,
                timeDifference: currentVersion ? 
                  Math.round((new Date(currentVersion.createdAt).getTime() - new Date(targetVersion.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + ' days' :
                  'unknown',
              },
              nextSteps: [
                'Review the rollback details above',
                'Set dryRun=false to perform the actual rollback',
                input.createBackup ? 'A backup will be created automatically' : 'No backup will be created',
              ],
            }, null, 2),
          }],
        };
      }

      // Perform the actual rollback
      const rolledBackVersion = await this.versionControlService.rollbackToVersion(
        input.workflowId,
        input.targetVersionId,
        {
          branchName: input.branchName,
          commitMessage: input.commitMessage,
          author: input.author,
          createBackup: input.createBackup,
        }
      );

      // Update the workflow in n8n to the rolled-back state
      await context.apiClient.updateWorkflow(input.workflowId, rolledBackVersion.workflow);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            rollback: {
              newVersionId: rolledBackVersion.id,
              newVersionString: rolledBackVersion.versionString,
              workflowId: input.workflowId,
              targetVersion: {
                id: targetVersion.id,
                versionString: targetVersion.versionString,
                createdAt: targetVersion.createdAt,
              },
              branchName: input.branchName,
              backupCreated: input.createBackup,
              rolledBackAt: rolledBackVersion.createdAt,
            },
            message: `Successfully rolled back to version ${targetVersion.versionString}`,
            workflowUpdated: true,
            nextSteps: [
              'Workflow has been updated in n8n',
              'Test the rolled-back workflow to ensure it works as expected',
              'Create a new version if additional changes are needed',
            ],
          }, null, 2),
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to rollback version: ${errorMessage}`);
    }
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'version-control',
      isMutating: true,
      requirements: ['n8n API access'],
      tags: ['version-control', 'workflow', 'rollback', 'restore', 'backup'],
    };
  }
}