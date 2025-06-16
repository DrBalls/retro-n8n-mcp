[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [tools/base/Tool](../README.md) / BaseTool

# Class: `abstract` BaseTool

Defined in: [src/tools/base/Tool.ts:136](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L136)

Base abstract class for tools

## Extended by

- [`BatchOperationStatusTool`](../../../batch/BatchOperationStatusTool/classes/BatchOperationStatusTool.md)
- [`BatchWorkflowsActivateTool`](../../../batch/BatchWorkflowsActivateTool/classes/BatchWorkflowsActivateTool.md)
- [`BatchWorkflowsCreateTool`](../../../batch/BatchWorkflowsCreateTool/classes/BatchWorkflowsCreateTool.md)
- [`BatchWorkflowsDeactivateTool`](../../../batch/BatchWorkflowsDeactivateTool/classes/BatchWorkflowsDeactivateTool.md)
- [`BatchWorkflowsDeleteTool`](../../../batch/BatchWorkflowsDeleteTool/classes/BatchWorkflowsDeleteTool.md)
- [`BatchWorkflowsUpdateTool`](../../../batch/BatchWorkflowsUpdateTool/classes/BatchWorkflowsUpdateTool.md)
- [`CreateCredentialTool`](../../../credential/CreateCredentialTool/classes/CreateCredentialTool.md)
- [`DeleteCredentialTool`](../../../credential/DeleteCredentialTool/classes/DeleteCredentialTool.md)
- [`GetCredentialTool`](../../../credential/GetCredentialTool/classes/GetCredentialTool.md)
- [`ListCredentialsTool`](../../../credential/ListCredentialsTool/classes/ListCredentialsTool.md)
- [`TestCredentialTool`](../../../credential/TestCredentialTool/classes/TestCredentialTool.md)
- [`UpdateCredentialTool`](../../../credential/UpdateCredentialTool/classes/UpdateCredentialTool.md)
- [`BreakpointDebugTool`](../../../debug/BreakpointDebugTool/classes/BreakpointDebugTool.md)
- [`HistoryDebugTool`](../../../debug/HistoryDebugTool/classes/HistoryDebugTool.md)
- [`InspectDebugTool`](../../../debug/InspectDebugTool/classes/InspectDebugTool.md)
- [`PauseDebugTool`](../../../debug/PauseDebugTool/classes/PauseDebugTool.md)
- [`ResumeDebugTool`](../../../debug/ResumeDebugTool/classes/ResumeDebugTool.md)
- [`StartDebugSessionTool`](../../../debug/StartDebugSessionTool/classes/StartDebugSessionTool.md)
- [`StatusDebugTool`](../../../debug/StatusDebugTool/classes/StatusDebugTool.md)
- [`StepDebugTool`](../../../debug/StepDebugTool/classes/StepDebugTool.md)
- [`StopDebugTool`](../../../debug/StopDebugTool/classes/StopDebugTool.md)
- [`TimelineDebugTool`](../../../debug/TimelineDebugTool/classes/TimelineDebugTool.md)
- [`WatchDebugTool`](../../../debug/WatchDebugTool/classes/WatchDebugTool.md)
- [`GetExecutionTool`](../../../execution/GetExecutionTool/classes/GetExecutionTool.md)
- [`ListExecutionsTool`](../../../execution/ListExecutionsTool/classes/ListExecutionsTool.md)
- [`MonitorExecutionTool`](../../../execution/MonitorExecutionTool/classes/MonitorExecutionTool.md)
- [`ReplayExecutionTool`](../../../execution/ReplayExecutionTool/classes/ReplayExecutionTool.md)
- [`StopExecutionTool`](../../../execution/StopExecutionTool/classes/StopExecutionTool.md)
- [`TriggerExecutionTool`](../../../execution/TriggerExecutionTool/classes/TriggerExecutionTool.md)
- [`RealtimeExecutionMonitorTool`](../../../monitoring/RealtimeExecutionMonitorTool/classes/RealtimeExecutionMonitorTool.md)
- [`WorkflowMetricsMonitorTool`](../../../monitoring/WorkflowMetricsMonitorTool/classes/WorkflowMetricsMonitorTool.md)
- [`ServerHealthTool`](../../../system/ServerHealthTool/classes/ServerHealthTool.md)
- [`TestConnectionTool`](../../../system/TestConnectionTool/classes/TestConnectionTool.md)
- [`BranchCreateTool`](../../../version-control/BranchCreateTool/classes/BranchCreateTool.md)
- [`BranchMergeTool`](../../../version-control/BranchMergeTool/classes/BranchMergeTool.md)
- [`CompareVersionsTool`](../../../version-control/CompareVersionsTool/classes/CompareVersionsTool.md)
- [`CreateBranchTool`](../../../version-control/CreateBranchTool/classes/CreateBranchTool.md)
- [`CreateVersionTool`](../../../version-control/CreateVersionTool/classes/CreateVersionTool.md)
- [`ListVersionsTool`](../../../version-control/ListVersionsTool/classes/ListVersionsTool.md)
- [`MergeBranchTool`](../../../version-control/MergeBranchTool/classes/MergeBranchTool.md)
- [`RollbackVersionTool`](../../../version-control/RollbackVersionTool/classes/RollbackVersionTool.md)
- [`VersionCreateTool`](../../../version-control/VersionCreateTool/classes/VersionCreateTool.md)
- [`VersionDiffTool`](../../../version-control/VersionDiffTool/classes/VersionDiffTool.md)
- [`VersionHistoryTool`](../../../version-control/VersionHistoryTool/classes/VersionHistoryTool.md)
- [`VersionRollbackTool`](../../../version-control/VersionRollbackTool/classes/VersionRollbackTool.md)
- [`DependencyGraphTool`](../../../visualization/DependencyGraphTool/classes/DependencyGraphTool.md)
- [`MermaidDiagramTool`](../../../visualization/MermaidDiagramTool/classes/MermaidDiagramTool.md)
- [`WorkflowMapTool`](../../../visualization/WorkflowMapTool/classes/WorkflowMapTool.md)
- [`ActivateWorkflowTool`](../../../workflow/ActivateWorkflowTool/classes/ActivateWorkflowTool.md)
- [`CreateWorkflowTool`](../../../workflow/CreateWorkflowTool/classes/CreateWorkflowTool.md)
- [`DeactivateWorkflowTool`](../../../workflow/DeactivateWorkflowTool/classes/DeactivateWorkflowTool.md)
- [`DeleteWorkflowTool`](../../../workflow/DeleteWorkflowTool/classes/DeleteWorkflowTool.md)
- [`GetWorkflowTool`](../../../workflow/GetWorkflowTool/classes/GetWorkflowTool.md)
- [`ListWorkflowsTool`](../../../workflow/ListWorkflowsTool/classes/ListWorkflowsTool.md)
- [`UpdateWorkflowTool`](../../../workflow/UpdateWorkflowTool/classes/UpdateWorkflowTool.md)

## Implements

- [`ITool`](../interfaces/ITool.md)

## Constructors

### Constructor

> **new BaseTool**(): `BaseTool`

#### Returns

`BaseTool`

## Properties

### description

> `abstract` `readonly` **description**: `string`

Defined in: [src/tools/base/Tool.ts:138](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L138)

Human-readable description of what the tool does

#### Implementation of

[`ITool`](../interfaces/ITool.md).[`description`](../interfaces/ITool.md#description)

***

### inputSchema

> `abstract` `readonly` **inputSchema**: `ZodType`\<`any`\>

Defined in: [src/tools/base/Tool.ts:139](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L139)

Zod schema for validating input parameters

#### Implementation of

[`ITool`](../interfaces/ITool.md).[`inputSchema`](../interfaces/ITool.md#inputschema)

***

### name

> `abstract` `readonly` **name**: `string`

Defined in: [src/tools/base/Tool.ts:137](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L137)

Unique identifier for the tool

#### Implementation of

[`ITool`](../interfaces/ITool.md).[`name`](../interfaces/ITool.md#name)

## Methods

### createErrorResponse()

> `protected` **createErrorResponse**(`error`, `metadata?`): [`IToolResponse`](../interfaces/IToolResponse.md)

Defined in: [src/tools/base/Tool.ts:189](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L189)

Create an error response with diagnostics

#### Parameters

##### error

`string` | `Error`

##### metadata?

`Record`\<`string`, `unknown`\>

#### Returns

[`IToolResponse`](../interfaces/IToolResponse.md)

***

### createTextResponse()

> `protected` **createTextResponse**(`text`, `metadata?`): [`IToolResponse`](../interfaces/IToolResponse.md)

Defined in: [src/tools/base/Tool.ts:179](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L179)

Create a standard text response

#### Parameters

##### text

`string`

##### metadata?

`Record`\<`string`, `unknown`\>

#### Returns

[`IToolResponse`](../interfaces/IToolResponse.md)

***

### execute()

> `abstract` **execute**(`params`, `context`): `Promise`\<[`IToolResponse`](../interfaces/IToolResponse.md)\>

Defined in: [src/tools/base/Tool.ts:141](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L141)

Execute the tool with validated parameters

#### Parameters

##### params

`unknown`

##### context

[`IToolContext`](../interfaces/IToolContext.md)

#### Returns

`Promise`\<[`IToolResponse`](../interfaces/IToolResponse.md)\>

#### Implementation of

[`ITool`](../interfaces/ITool.md).[`execute`](../interfaces/ITool.md#execute)

***

### executeWithErrorHandling()

> `protected` **executeWithErrorHandling**\<`T`\>(`operation`, `context`): `Promise`\<`T`\>

Defined in: [src/tools/base/Tool.ts:218](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L218)

Execute with error handling and recovery

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `Promise`\<`T`\>

##### context

[`IErrorContext`](../../../../utils/ErrorHandler/interfaces/IErrorContext.md)

#### Returns

`Promise`\<`T`\>

***

### toMcpTool()

> **toMcpTool**(): `object`

Defined in: [src/tools/base/Tool.ts:146](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L146)

Convert to MCP tool definition

#### Returns

`object`

#### Implementation of

[`ITool`](../interfaces/ITool.md).[`toMcpTool`](../interfaces/ITool.md#tomcptool)

***

### validateInput()

> `protected` **validateInput**\<`T`\>(`params`): `T`

Defined in: [src/tools/base/Tool.ts:157](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L157)

Validate input parameters with enhanced error handling

#### Type Parameters

##### T

`T`

#### Parameters

##### params

`unknown`

#### Returns

`T`
