export function createMockWorkflow(overrides?: any) {
  const baseWorkflow = {
    id: 'wf-123',
    name: 'Test Workflow',
    active: true,
    nodes: [],
    connections: {},
    settings: {},
    staticData: {},
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...baseWorkflow,
    ...overrides,
  };
}

export function createMockNode(overrides?: any) {
  return {
    id: 'node1',
    name: 'Node',
    type: 'n8n-nodes-base.function',
    typeVersion: 1,
    position: [100, 100],
    parameters: {},
    ...overrides,
  };
}

export function createMockConnection(targetNode: string, type = 'main', index = 0) {
  return {
    node: targetNode,
    type: type,
    index: index,
  };
}

function deepMerge(target: any, source: any): any {
  if (!source) return target;
  
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

export function createMockExecution(overrides?: any) {
  const baseExecution = {
    id: 'exec-123',
    workflowId: 'wf-123',
    mode: 'manual',
    finished: true,
    status: 'success',
    startedAt: new Date().toISOString(),
    stoppedAt: new Date().toISOString(),
    data: {
      executionData: {
        contextData: {},
        nodeExecutionStack: [],
      },
      resultData: {
        runData: {},
      },
    },
  };

  return deepMerge(baseExecution, overrides);
}