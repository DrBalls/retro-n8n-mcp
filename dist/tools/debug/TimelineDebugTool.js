import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class TimelineDebugTool extends BaseTool {
    name = 'debug_timeline';
    description = 'Generate execution timeline visualization showing the flow and timing of node executions';
    inputSchema = z.object({
        sessionId: z.string().describe('The ID of the debug session'),
        format: z.enum(['text', 'mermaid', 'json']).default('text').describe('Output format for the timeline'),
        timeRange: z.object({
            start: z.string().datetime().optional(),
            end: z.string().datetime().optional(),
        }).optional().describe('Optional time range filter'),
        includeData: z.boolean().default(false).describe('Include input/output data in timeline'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!global.debugSessionManager) {
            throw new Error('No debug sessions active. Use debug_start to create a session.');
        }
        const session = global.debugSessionManager.getSession(input.sessionId);
        if (!session) {
            throw new Error(`Debug session ${input.sessionId} not found`);
        }
        try {
            const timeline = input.timeRange
                ? session.getTimelineRange(input.timeRange.start ? new Date(input.timeRange.start) : undefined, input.timeRange.end ? new Date(input.timeRange.end) : undefined)
                : session.getTimeline();
            if (timeline.length === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                sessionId: input.sessionId,
                                format: input.format,
                                message: 'No timeline events recorded yet',
                                instructions: 'Execute some nodes in the workflow to see timeline events',
                            }, null, 2),
                        }],
                };
            }
            let output;
            switch (input.format) {
                case 'text':
                    output = this.generateTextTimeline(timeline, input.includeData);
                    break;
                case 'mermaid':
                    output = this.generateMermaidTimeline(timeline, session.getWorkflowId());
                    break;
                case 'json':
                    output = JSON.stringify({
                        success: true,
                        sessionId: input.sessionId,
                        workflowId: session.getWorkflowId(),
                        timeRange: {
                            start: timeline[0].timestamp,
                            end: timeline[timeline.length - 1].timestamp,
                            duration: timeline[timeline.length - 1].timestamp.getTime() - timeline[0].timestamp.getTime(),
                        },
                        events: timeline.map(event => ({
                            timestamp: event.timestamp,
                            nodeId: event.nodeId,
                            nodeName: event.nodeName,
                            nodeType: event.nodeType,
                            duration: event.duration,
                            hasError: !!event.error,
                            error: event.error,
                            memoryUsage: event.memoryUsage,
                            ...(input.includeData ? {
                                inputData: event.inputData,
                                outputData: event.outputData,
                            } : {}),
                        })),
                        statistics: this.calculateStatistics(timeline),
                    }, null, 2);
                    break;
            }
            return {
                content: [{
                        type: 'text',
                        text: output,
                    }],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                            sessionId: input.sessionId,
                            troubleshooting: {
                                sessionNotFound: 'Check if session is still active with debug_status',
                                noEvents: 'No execution events recorded yet',
                            },
                        }, null, 2),
                    }],
            };
        }
    }
    generateTextTimeline(timeline, includeData) {
        const lines = [];
        const startTime = timeline[0].timestamp.getTime();
        lines.push('=== EXECUTION TIMELINE ===');
        lines.push(`Start: ${timeline[0].timestamp.toISOString()}`);
        lines.push(`End: ${timeline[timeline.length - 1].timestamp.toISOString()}`);
        lines.push(`Total Duration: ${timeline[timeline.length - 1].timestamp.getTime() - startTime}ms`);
        lines.push('');
        lines.push('Timeline:');
        lines.push('─────────');
        timeline.forEach((event, index) => {
            const relativeTime = event.timestamp.getTime() - startTime;
            const marker = event.error ? '✗' : '✓';
            const duration = event.duration ? ` (${event.duration}ms)` : '';
            lines.push(`${marker} [${this.formatTime(relativeTime)}] ${event.nodeName} (${event.nodeType})${duration}`);
            if (event.error) {
                lines.push(`  └─ ERROR: ${event.error}`);
            }
            if (includeData) {
                if (Array.isArray(event.inputData) && event.inputData.length > 0) {
                    lines.push(`  └─ Input: ${event.inputData.length} item(s)`);
                }
                if (Array.isArray(event.outputData) && event.outputData.length > 0) {
                    lines.push(`  └─ Output: ${event.outputData.length} item(s)`);
                }
            }
            if (event.memoryUsage) {
                lines.push(`  └─ Memory: ${Math.round(event.memoryUsage / 1024 / 1024)}MB`);
            }
            // Add spacing between events
            if (index < timeline.length - 1) {
                const nextTime = timeline[index + 1].timestamp.getTime() - startTime;
                const gap = nextTime - relativeTime;
                if (gap > 1000) {
                    lines.push(`  │  ... ${Math.round(gap / 1000)}s ...`);
                }
                lines.push('  │');
            }
        });
        lines.push('');
        lines.push('Statistics:');
        lines.push('───────────');
        const stats = this.calculateStatistics(timeline);
        lines.push(`Total Nodes Executed: ${stats.totalNodes}`);
        lines.push(`Unique Nodes: ${stats.uniqueNodes}`);
        lines.push(`Successful: ${stats.successful}`);
        lines.push(`Failed: ${stats.failed}`);
        lines.push(`Average Duration: ${Math.round(stats.averageDuration)}ms`);
        lines.push(`Total Execution Time: ${stats.totalExecutionTime}ms`);
        return lines.join('\n');
    }
    generateMermaidTimeline(timeline, workflowId) {
        const lines = [];
        lines.push('```mermaid');
        lines.push('gantt');
        lines.push(`  title Execution Timeline - Workflow ${workflowId}`);
        lines.push('  dateFormat HH:mm:ss.SSS');
        lines.push('  axisFormat %H:%M:%S');
        lines.push('');
        // Group events by node
        const nodeGroups = new Map();
        timeline.forEach(event => {
            if (!nodeGroups.has(event.nodeId)) {
                nodeGroups.set(event.nodeId, []);
            }
            nodeGroups.get(event.nodeId).push(event);
        });
        // Create sections for each node
        nodeGroups.forEach((events, nodeId) => {
            const nodeName = events[0].nodeName;
            lines.push(`  section ${nodeName}`);
            events.forEach((event, index) => {
                const status = event.error ? 'crit' : 'active';
                const taskName = event.error ? `${nodeName} (Error)` : nodeName;
                const startTime = event.timestamp.toISOString().split('T')[1].replace('Z', '');
                const duration = event.duration || 100; // Default 100ms if no duration
                lines.push(`    ${taskName} :${status}, ${startTime}, ${duration}ms`);
            });
        });
        lines.push('```');
        return lines.join('\n');
    }
    calculateStatistics(timeline) {
        const uniqueNodeIds = new Set(timeline.map(e => e.nodeId));
        const durations = timeline.filter(e => e.duration).map(e => e.duration);
        return {
            totalNodes: timeline.length,
            uniqueNodes: uniqueNodeIds.size,
            successful: timeline.filter(e => !e.error).length,
            failed: timeline.filter(e => e.error).length,
            averageDuration: durations.length > 0
                ? durations.reduce((a, b) => a + b, 0) / durations.length
                : 0,
            totalExecutionTime: timeline[timeline.length - 1].timestamp.getTime() - timeline[0].timestamp.getTime(),
        };
    }
    formatTime(ms) {
        if (ms < 1000) {
            return `${ms}ms`;
        }
        else if (ms < 60000) {
            return `${(ms / 1000).toFixed(1)}s`;
        }
        else {
            const minutes = Math.floor(ms / 60000);
            const seconds = ((ms % 60000) / 1000).toFixed(1);
            return `${minutes}m ${seconds}s`;
        }
    }
    getMetadata() {
        return {
            category: 'debug',
            isMutating: false,
            requirements: ['Active debug session'],
            tags: ['debug', 'timeline', 'visualization', 'execution flow'],
        };
    }
}
//# sourceMappingURL=TimelineDebugTool.js.map