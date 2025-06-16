[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [tools/workflow/CreateWorkflowTool](../README.md) / CreateWorkflowTool

# Class: CreateWorkflowTool

Defined in: [src/tools/workflow/CreateWorkflowTool.ts:37](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/CreateWorkflowTool.ts#L37)

Tool for creating new workflows in n8n

## Extends

- [`BaseTool`](../../../base/Tool/classes/BaseTool.md)

## Constructors

### Constructor

> **new CreateWorkflowTool**(): `CreateWorkflowTool`

#### Returns

`CreateWorkflowTool`

#### Inherited from

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`constructor`](../../../base/Tool/classes/BaseTool.md#constructor)

## Properties

### description

> `readonly` **description**: `"Create a new workflow in n8n"` = `'Create a new workflow in n8n'`

Defined in: [src/tools/workflow/CreateWorkflowTool.ts:39](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/CreateWorkflowTool.ts#L39)

Human-readable description of what the tool does

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`description`](../../../base/Tool/classes/BaseTool.md#description)

***

### inputSchema

> `readonly` **inputSchema**: `ZodObject`\<\{ `active`: `ZodDefault`\<`ZodBoolean`\>; `connections`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodRecord`\<`ZodString`, `ZodArray`\<`ZodArray`\<`ZodObject`\<\{ `index`: `ZodNumber`; `node`: `ZodString`; `type`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `index`: `number`; `node`: `string`; `type`: `string`; \}, \{ `index`: `number`; `node`: `string`; `type`: `string`; \}\>, `"many"`\>, `"many"`\>\>\>\>; `name`: `ZodString`; `nodes`: `ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `parameters`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodUnknown`\>\>; `position`: `ZodArray`\<`ZodNumber`, `"many"`\>; `type`: `ZodString`; `typeVersion`: `ZodOptional`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `parameters?`: `Record`\<`string`, `unknown`\>; `position`: `number`[]; `type`: `string`; `typeVersion?`: `number`; \}, \{ `name`: `string`; `parameters?`: `Record`\<`string`, `unknown`\>; `position`: `number`[]; `type`: `string`; `typeVersion?`: `number`; \}\>, `"many"`\>; `settings`: `ZodOptional`\<`ZodObject`\<\{ `errorWorkflow`: `ZodOptional`\<`ZodString`\>; `executionOrder`: `ZodOptional`\<`ZodEnum`\<\[`"v0"`, `"v1"`\]\>\>; `saveManualExecutions`: `ZodOptional`\<`ZodBoolean`\>; `timezone`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `errorWorkflow?`: `string`; `executionOrder?`: `"v0"` \| `"v1"`; `saveManualExecutions?`: `boolean`; `timezone?`: `string`; \}, \{ `errorWorkflow?`: `string`; `executionOrder?`: `"v0"` \| `"v1"`; `saveManualExecutions?`: `boolean`; `timezone?`: `string`; \}\>\>; `tags`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `active`: `boolean`; `connections?`: `Record`\<`string`, `Record`\<`string`, `object`[][]\>\>; `name`: `string`; `nodes`: `object`[]; `settings?`: \{ `errorWorkflow?`: `string`; `executionOrder?`: `"v0"` \| `"v1"`; `saveManualExecutions?`: `boolean`; `timezone?`: `string`; \}; `tags?`: `string`[]; \}, \{ `active?`: `boolean`; `connections?`: `Record`\<`string`, `Record`\<`string`, `object`[][]\>\>; `name`: `string`; `nodes`: `object`[]; `settings?`: \{ `errorWorkflow?`: `string`; `executionOrder?`: `"v0"` \| `"v1"`; `saveManualExecutions?`: `boolean`; `timezone?`: `string`; \}; `tags?`: `string`[]; \}\> = `CreateWorkflowSchema`

Defined in: [src/tools/workflow/CreateWorkflowTool.ts:40](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/CreateWorkflowTool.ts#L40)

Zod schema for validating input parameters

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`inputSchema`](../../../base/Tool/classes/BaseTool.md#inputschema)

***

### name

> `readonly` **name**: `"workflow_create"` = `'workflow_create'`

Defined in: [src/tools/workflow/CreateWorkflowTool.ts:38](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/CreateWorkflowTool.ts#L38)

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

Defined in: [src/tools/workflow/CreateWorkflowTool.ts:42](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/CreateWorkflowTool.ts#L42)

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

Defined in: [src/tools/workflow/CreateWorkflowTool.ts:109](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/workflow/CreateWorkflowTool.ts#L109)

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
