[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [tools/debug/HistoryDebugTool](../README.md) / HistoryDebugTool

# Class: HistoryDebugTool

Defined in: [src/tools/debug/HistoryDebugTool.ts:4](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/debug/HistoryDebugTool.ts#L4)

Base abstract class for tools

## Extends

- [`BaseTool`](../../../base/Tool/classes/BaseTool.md)

## Constructors

### Constructor

> **new HistoryDebugTool**(): `HistoryDebugTool`

#### Returns

`HistoryDebugTool`

#### Inherited from

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`constructor`](../../../base/Tool/classes/BaseTool.md#constructor)

## Properties

### description

> **description**: `string` = `'View history of past debug sessions'`

Defined in: [src/tools/debug/HistoryDebugTool.ts:6](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/debug/HistoryDebugTool.ts#L6)

Human-readable description of what the tool does

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`description`](../../../base/Tool/classes/BaseTool.md#description)

***

### inputSchema

> **inputSchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `workflowId`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `limit`: `number`; `workflowId?`: `string`; \}, \{ `limit?`: `number`; `workflowId?`: `string`; \}\>

Defined in: [src/tools/debug/HistoryDebugTool.ts:8](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/debug/HistoryDebugTool.ts#L8)

Zod schema for validating input parameters

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`inputSchema`](../../../base/Tool/classes/BaseTool.md#inputschema)

***

### name

> **name**: `string` = `'debug_history'`

Defined in: [src/tools/debug/HistoryDebugTool.ts:5](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/debug/HistoryDebugTool.ts#L5)

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

Defined in: [src/tools/debug/HistoryDebugTool.ts:13](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/debug/HistoryDebugTool.ts#L13)

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

Defined in: [src/tools/debug/HistoryDebugTool.ts:110](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/debug/HistoryDebugTool.ts#L110)

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
