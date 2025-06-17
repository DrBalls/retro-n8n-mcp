/**
 * WorkflowDiffer
 * Generates diffs between workflow versions and provides visualization
 */
export class WorkflowDiffer {
    /**
     * Generate a comprehensive diff between two workflows
     */
    async generateDiff(fromWorkflow, toWorkflow) {
        const operations = this.generateJsonPatch(fromWorkflow, toWorkflow);
        const summary = this.generateSummary(operations, fromWorkflow, toWorkflow);
        return {
            fromVersionId: fromWorkflow.id || 'unknown',
            toVersionId: toWorkflow.id || 'unknown',
            operations: operations.map(this.convertToVersionDiffOperation),
            summary,
            generatedAt: new Date().toISOString(),
        };
    }
    /**
     * Generate human-readable diff description
     */
    generateDiffDescription(diff) {
        const descriptions = [];
        if (diff.summary.nodesAdded > 0) {
            descriptions.push(`Added ${diff.summary.nodesAdded} node(s)`);
        }
        if (diff.summary.nodesRemoved > 0) {
            descriptions.push(`Removed ${diff.summary.nodesRemoved} node(s)`);
        }
        if (diff.summary.nodesModified > 0) {
            descriptions.push(`Modified ${diff.summary.nodesModified} node(s)`);
        }
        if (diff.summary.connectionsAdded > 0) {
            descriptions.push(`Added ${diff.summary.connectionsAdded} connection(s)`);
        }
        if (diff.summary.connectionsRemoved > 0) {
            descriptions.push(`Removed ${diff.summary.connectionsRemoved} connection(s)`);
        }
        if (diff.summary.parametersChanged > 0) {
            descriptions.push(`Changed ${diff.summary.parametersChanged} parameter(s)`);
        }
        return descriptions;
    }
    /**
     * Check if two workflows are identical
     */
    areWorkflowsIdentical(workflow1, workflow2) {
        // Compare essential workflow properties, excluding metadata like updatedAt
        const normalize = (workflow) => ({
            name: workflow.name,
            nodes: workflow.nodes,
            connections: workflow.connections,
            active: workflow.active,
            settings: workflow.settings,
            tags: workflow.tags,
        });
        return JSON.stringify(normalize(workflow1)) === JSON.stringify(normalize(workflow2));
    }
    /**
     * Get nodes that were added between versions
     */
    getAddedNodes(fromWorkflow, toWorkflow) {
        const fromNodeIds = new Set((fromWorkflow.nodes || []).map(n => n.id));
        return (toWorkflow.nodes || []).filter(n => !fromNodeIds.has(n.id));
    }
    /**
     * Get nodes that were removed between versions
     */
    getRemovedNodes(fromWorkflow, toWorkflow) {
        const toNodeIds = new Set((toWorkflow.nodes || []).map(n => n.id));
        return (fromWorkflow.nodes || []).filter(n => !toNodeIds.has(n.id));
    }
    /**
     * Get nodes that were modified between versions
     */
    getModifiedNodes(fromWorkflow, toWorkflow) {
        const fromNodesMap = new Map((fromWorkflow.nodes || []).map(n => [n.id, n]));
        const toNodesMap = new Map((toWorkflow.nodes || []).map(n => [n.id, n]));
        const modified = [];
        for (const [nodeId, fromNode] of fromNodesMap) {
            const toNode = toNodesMap.get(nodeId);
            if (toNode) {
                const changes = this.getNodeChanges(fromNode, toNode);
                if (changes.length > 0) {
                    modified.push({ nodeId, changes });
                }
            }
        }
        return modified;
    }
    /**
     * Get connection changes between workflows
     */
    getConnectionChanges(fromWorkflow, toWorkflow) {
        const fromConnections = this.normalizeConnections(fromWorkflow.connections || {});
        const toConnections = this.normalizeConnections(toWorkflow.connections || {});
        const fromConnectionStrings = new Set(fromConnections.map(c => JSON.stringify(c)));
        const toConnectionStrings = new Set(toConnections.map(c => JSON.stringify(c)));
        const added = toConnections.filter(c => !fromConnectionStrings.has(JSON.stringify(c)));
        const removed = fromConnections.filter(c => !toConnectionStrings.has(JSON.stringify(c)));
        return { added, removed };
    }
    /**
     * Generate visual diff for display purposes
     */
    generateVisualDiff(diff) {
        const lines = [];
        lines.push('=== Workflow Changes ===');
        lines.push(`Summary: ${this.generateDiffDescription(diff).join(', ')}`);
        lines.push('');
        for (const operation of diff.operations) {
            switch (operation.operation) {
                case 'add':
                    lines.push(`+ ${operation.path}: ${this.formatValue(operation.value)}`);
                    break;
                case 'remove':
                    lines.push(`- ${operation.path}: ${this.formatValue(operation.oldValue)}`);
                    break;
                case 'replace':
                    lines.push(`~ ${operation.path}:`);
                    lines.push(`  - ${this.formatValue(operation.oldValue)}`);
                    lines.push(`  + ${this.formatValue(operation.value)}`);
                    break;
                case 'move':
                    lines.push(`→ ${operation.from} → ${operation.path}`);
                    break;
            }
        }
        return {
            type: 'unified',
            content: lines.join('\n'),
        };
    }
    // Private helper methods
    generateJsonPatch(from, to, path = '') {
        const operations = [];
        // Handle null/undefined cases
        if (from === null || from === undefined) {
            if (to !== null && to !== undefined) {
                operations.push({ op: 'add', path: path || '/', value: to });
            }
            return operations;
        }
        if (to === null || to === undefined) {
            operations.push({ op: 'remove', path: path || '/' });
            return operations;
        }
        // Handle primitive values
        if (typeof from !== 'object' || typeof to !== 'object') {
            if (from !== to) {
                operations.push({ op: 'replace', path: path || '/', value: to });
            }
            return operations;
        }
        // Handle arrays
        if (Array.isArray(from) && Array.isArray(to)) {
            return this.generateArrayPatch(from, to, path);
        }
        // Handle objects
        if (!Array.isArray(from) && !Array.isArray(to)) {
            return this.generateObjectPatch(from, to, path);
        }
        // Type mismatch
        operations.push({ op: 'replace', path: path || '/', value: to });
        return operations;
    }
    generateArrayPatch(from, to, path) {
        const operations = [];
        const maxLength = Math.max(from.length, to.length);
        for (let i = 0; i < maxLength; i++) {
            const currentPath = `${path}/${i}`;
            if (i >= from.length) {
                // Added item
                operations.push({ op: 'add', path: currentPath, value: to[i] });
            }
            else if (i >= to.length) {
                // Removed item (remove from end to avoid index shifts)
                operations.unshift({ op: 'remove', path: `${path}/${from.length - 1 - (maxLength - 1 - i)}` });
            }
            else {
                // Compare items
                operations.push(...this.generateJsonPatch(from[i], to[i], currentPath));
            }
        }
        return operations;
    }
    generateObjectPatch(from, to, path) {
        const operations = [];
        const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
        for (const key of allKeys) {
            const currentPath = `${path}/${this.escapeJsonPointer(key)}`;
            if (!(key in from)) {
                // Added property
                operations.push({ op: 'add', path: currentPath, value: to[key] });
            }
            else if (!(key in to)) {
                // Removed property
                operations.push({ op: 'remove', path: currentPath });
            }
            else {
                // Compare values
                operations.push(...this.generateJsonPatch(from[key], to[key], currentPath));
            }
        }
        return operations;
    }
    escapeJsonPointer(str) {
        return str.replace(/~/g, '~0').replace(/\//g, '~1');
    }
    convertToVersionDiffOperation(op) {
        // Filter out 'test' operations which are not part of our DiffOperation type
        if (op.op === 'test') {
            return {
                operation: 'add', // Convert test to add for compatibility
                path: op.path,
                value: op.value,
                oldValue: undefined,
                from: undefined,
            };
        }
        return {
            operation: op.op,
            path: op.path,
            value: op.value,
            oldValue: op.op === 'replace' ? undefined : op.value,
            from: op.from,
        };
    }
    generateSummary(operations, fromWorkflow, toWorkflow) {
        let nodesAdded = 0;
        let nodesRemoved = 0;
        let nodesModified = 0;
        let connectionsAdded = 0;
        let connectionsRemoved = 0;
        let parametersChanged = 0;
        for (const op of operations) {
            if (op.path.startsWith('/nodes/')) {
                const pathParts = op.path.split('/');
                if (pathParts.length === 3) { // /nodes/{index}
                    switch (op.op) {
                        case 'add':
                            nodesAdded++;
                            break;
                        case 'remove':
                            nodesRemoved++;
                            break;
                    }
                }
                else if (pathParts.length > 3) { // /nodes/{index}/property
                    nodesModified++;
                    if (pathParts[3] === 'parameters') {
                        parametersChanged++;
                    }
                }
            }
            else if (op.path.startsWith('/connections/')) {
                switch (op.op) {
                    case 'add':
                        connectionsAdded++;
                        break;
                    case 'remove':
                        connectionsRemoved++;
                        break;
                }
            }
        }
        return {
            nodesAdded,
            nodesRemoved,
            nodesModified,
            connectionsAdded,
            connectionsRemoved,
            parametersChanged,
        };
    }
    getNodeChanges(fromNode, toNode) {
        const changes = [];
        if (fromNode.name !== toNode.name) {
            changes.push('name');
        }
        if (fromNode.type !== toNode.type) {
            changes.push('type');
        }
        if (JSON.stringify(fromNode.parameters || {}) !== JSON.stringify(toNode.parameters || {})) {
            changes.push('parameters');
        }
        if (JSON.stringify(fromNode.position) !== JSON.stringify(toNode.position)) {
            changes.push('position');
        }
        if (fromNode.disabled !== toNode.disabled) {
            changes.push('disabled');
        }
        return changes;
    }
    normalizeConnections(connections) {
        const normalized = [];
        for (const [sourceNode, outputs] of Object.entries(connections)) {
            if (outputs && typeof outputs === 'object') {
                for (const [outputIndex, targets] of Object.entries(outputs)) {
                    if (Array.isArray(targets)) {
                        for (const target of targets) {
                            normalized.push({
                                source: sourceNode,
                                sourceOutput: outputIndex,
                                target: target.node,
                                targetInput: target.type,
                                targetIndex: target.index,
                            });
                        }
                    }
                }
            }
        }
        return normalized.sort((a, b) => a.source.localeCompare(b.source) ||
            a.sourceOutput.localeCompare(b.sourceOutput) ||
            a.target.localeCompare(b.target));
    }
    formatValue(value) {
        if (value === null || value === undefined) {
            return String(value);
        }
        if (typeof value === 'string') {
            return `"${value}"`;
        }
        if (typeof value === 'object') {
            return JSON.stringify(value).substring(0, 100) + (JSON.stringify(value).length > 100 ? '...' : '');
        }
        return String(value);
    }
}
//# sourceMappingURL=WorkflowDiffer.js.map