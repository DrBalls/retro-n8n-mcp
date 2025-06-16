[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [tools/workflow/UpdateWorkflowTool](../README.md) / UpdateWorkflowTool

# Class: UpdateWorkflowTool

Defined in: [src/tools/workflow/UpdateWorkflowTool.ts:7](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/UpdateWorkflowTool.ts#L7)

Tool for updating an existing workflow

## Extends

- [`BaseTool`](../../../base/Tool/classes/BaseTool.md)

## Constructors

### Constructor

> **new UpdateWorkflowTool**(): `UpdateWorkflowTool`

#### Returns

`UpdateWorkflowTool`

#### Inherited from

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`constructor`](../../../base/Tool/classes/BaseTool.md#constructor)

## Properties

### description

> **description**: `string` = `'Update an existing workflow configuration'`

Defined in: [src/tools/workflow/UpdateWorkflowTool.ts:9](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/UpdateWorkflowTool.ts#L9)

Human-readable description of what the tool does

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`description`](../../../base/Tool/classes/BaseTool.md#description)

***

### inputSchema

> **inputSchema**: `ZodObject`\<\{ `active`: `ZodOptional`\<`ZodBoolean`\>; `connections`: `ZodOptional`\<`ZodAny`\>; `id`: `ZodString`; `name`: `ZodOptional`\<`ZodString`\>; `nodes`: `ZodOptional`\<`ZodArray`\<`ZodAny`, `"many"`\>\>; `settings`: `ZodOptional`\<`ZodObject`\<\{ `callerIds`: `ZodOptional`\<`ZodString`\>; `callerPolicy`: `ZodOptional`\<`ZodEnum`\<\[`"any"`, `"none"`, `"workflowsFromAList"`, `"workflowsFromSameOwner"`\]\>\>; `errorWorkflow`: `ZodOptional`\<`ZodString`\>; `executionOrder`: `ZodOptional`\<`ZodEnum`\<\[`"v0"`, `"v1"`\]\>\>; `executionTimeout`: `ZodOptional`\<`ZodNumber`\>; `saveDataErrorExecution`: `ZodOptional`\<`ZodEnum`\<\[`"all"`, `"none"`\]\>\>; `saveDataSuccessExecution`: `ZodOptional`\<`ZodEnum`\<\[`"all"`, `"none"`\]\>\>; `saveExecutionProgress`: `ZodOptional`\<`ZodBoolean`\>; `saveManualExecutions`: `ZodOptional`\<`ZodBoolean`\>; `timezone`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `callerIds?`: `string`; `callerPolicy?`: `"none"` \| `"any"` \| `"workflowsFromAList"` \| `"workflowsFromSameOwner"`; `errorWorkflow?`: `string`; `executionOrder?`: `"v0"` \| `"v1"`; `executionTimeout?`: `number`; `saveDataErrorExecution?`: `"all"` \| `"none"`; `saveDataSuccessExecution?`: `"all"` \| `"none"`; `saveExecutionProgress?`: `boolean`; `saveManualExecutions?`: `boolean`; `timezone?`: `string`; \}, \{ `callerIds?`: `string`; `callerPolicy?`: `"none"` \| `"any"` \| `"workflowsFromAList"` \| `"workflowsFromSameOwner"`; `errorWorkflow?`: `string`; `executionOrder?`: `"v0"` \| `"v1"`; `executionTimeout?`: `number`; `saveDataErrorExecution?`: `"all"` \| `"none"`; `saveDataSuccessExecution?`: `"all"` \| `"none"`; `saveExecutionProgress?`: `boolean`; `saveManualExecutions?`: `boolean`; `timezone?`: `string`; \}\>\>; `staticData`: `ZodOptional`\<`ZodAny`\>; `tags`: `ZodOptional`\<`ZodArray`\<`ZodUnion`\<\[`ZodString`, `ZodObject`\<\{ `id`: `ZodOptional`\<`ZodString`\>; `name`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `id?`: `string`; `name`: `string`; \}, \{ `id?`: `string`; `name`: `string`; \}\>\]\>, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `active?`: `boolean`; `connections?`: `any`; `id`: `string`; `name?`: `string`; `nodes?`: `any`[]; `settings?`: \{ `callerIds?`: `string`; `callerPolicy?`: `"none"` \| `"any"` \| `"workflowsFromAList"` \| `"workflowsFromSameOwner"`; `errorWorkflow?`: `string`; `executionOrder?`: `"v0"` \| `"v1"`; `executionTimeout?`: `number`; `saveDataErrorExecution?`: `"all"` \| `"none"`; `saveDataSuccessExecution?`: `"all"` \| `"none"`; `saveExecutionProgress?`: `boolean`; `saveManualExecutions?`: `boolean`; `timezone?`: `string`; \}; `staticData?`: `any`; `tags?`: (`string` \| \{ `id?`: `string`; `name`: `string`; \})[]; \}, \{ `active?`: `boolean`; `connections?`: `any`; `id`: `string`; `name?`: `string`; `nodes?`: `any`[]; `settings?`: \{ `callerIds?`: `string`; `callerPolicy?`: `"none"` \| `"any"` \| `"workflowsFromAList"` \| `"workflowsFromSameOwner"`; `errorWorkflow?`: `string`; `executionOrder?`: `"v0"` \| `"v1"`; `executionTimeout?`: `number`; `saveDataErrorExecution?`: `"all"` \| `"none"`; `saveDataSuccessExecution?`: `"all"` \| `"none"`; `saveExecutionProgress?`: `boolean`; `saveManualExecutions?`: `boolean`; `timezone?`: `string`; \}; `staticData?`: `any`; `tags?`: (`string` \| \{ `id?`: `string`; `name`: `string`; \})[]; \}\>

Defined in: [src/tools/workflow/UpdateWorkflowTool.ts:11](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/UpdateWorkflowTool.ts#L11)

Zod schema for validating input parameters

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`inputSchema`](../../../base/Tool/classes/BaseTool.md#inputschema)

***

### name

> **name**: `string` = `'workflow_update'`

Defined in: [src/tools/workflow/UpdateWorkflowTool.ts:8](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/UpdateWorkflowTool.ts#L8)

Unique identifier for the tool

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`name`](../../../base/Tool/classes/BaseTool.md#name)

## Methods

### createErrorResponse()

> `protected` **createErrorResponse**(`error`, `metadata?`): [`IToolResponse`](../../../base/Tool/interfaces/IToolResponse.md)

Defined in: [src/tools/base/Tool.ts:189](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L189)

Create an error response with diagnostics

#### Parameters

##### error

`string` | `Error`

##### metadata?

`Record`\<`string`, `unknown`\>

#### Returns

[`IToolResponse`](../../../base/Tool/interfaces/IToolResponse.md)

#### Inherited from

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`createErrorResponse`](../../../base/Tool/classes/BaseTool.md#createerrorresponse)

***

### createTextResponse()

> `protected` **createTextResponse**(`text`, `metadata?`): [`IToolResponse`](../../../base/Tool/interfaces/IToolResponse.md)

Defined in: [src/tools/base/Tool.ts:179](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L179)

Create a standard text response

#### Parameters

##### text

`string`

##### metadata?

`Record`\<`string`, `unknown`\>

#### Returns

[`IToolResponse`](../../../base/Tool/interfaces/IToolResponse.md)

#### Inherited from

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`createTextResponse`](../../../base/Tool/classes/BaseTool.md#createtextresponse)

***

### execute()

> **execute**(`params`, `context`): `Promise`\<[`IToolResponse`](../../../base/Tool/interfaces/IToolResponse.md)\>

Defined in: [src/tools/workflow/UpdateWorkflowTool.ts:51](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/UpdateWorkflowTool.ts#L51)

Execute the tool with validated parameters

#### Parameters

##### params

`unknown`

##### context

[`IToolContext`](../../../base/Tool/interfaces/IToolContext.md)

#### Returns

`Promise`\<[`IToolResponse`](../../../base/Tool/interfaces/IToolResponse.md)\>

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`execute`](../../../base/Tool/classes/BaseTool.md#execute)

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

#### Inherited from

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`executeWithErrorHandling`](../../../base/Tool/classes/BaseTool.md#executewitherrorhandling)

***

### getMetadata()

> **getMetadata**(): [`IToolMetadata`](../../../base/Tool/interfaces/IToolMetadata.md)

Defined in: [src/tools/workflow/UpdateWorkflowTool.ts:95](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/UpdateWorkflowTool.ts#L95)

#### Returns

[`IToolMetadata`](../../../base/Tool/interfaces/IToolMetadata.md)

***

### toMcpTool()

> **toMcpTool**(): `object`

Defined in: [src/tools/base/Tool.ts:146](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L146)

Convert to MCP tool definition

#### Returns

`object`

#### Inherited from

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`toMcpTool`](../../../base/Tool/classes/BaseTool.md#tomcptool)

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

#### Inherited from

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`validateInput`](../../../base/Tool/classes/BaseTool.md#validateinput)
