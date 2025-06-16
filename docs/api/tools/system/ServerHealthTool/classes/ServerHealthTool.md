[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [tools/system/ServerHealthTool](../README.md) / ServerHealthTool

# Class: ServerHealthTool

Defined in: [src/tools/system/ServerHealthTool.ts:17](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/system/ServerHealthTool.ts#L17)

Tool for checking MCP server health

## Extends

- [`BaseTool`](../../../base/Tool/classes/BaseTool.md)

## Constructors

### Constructor

> **new ServerHealthTool**(): `ServerHealthTool`

#### Returns

`ServerHealthTool`

#### Inherited from

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`constructor`](../../../base/Tool/classes/BaseTool.md#constructor)

## Properties

### description

> `readonly` **description**: `"Get the health status and statistics of the MCP server"` = `'Get the health status and statistics of the MCP server'`

Defined in: [src/tools/system/ServerHealthTool.ts:19](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/system/ServerHealthTool.ts#L19)

Human-readable description of what the tool does

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`description`](../../../base/Tool/classes/BaseTool.md#description)

***

### inputSchema

> `readonly` **inputSchema**: `ZodObject`\<\{ `includeStats`: `ZodDefault`\<`ZodBoolean`\>; \}, `"strip"`, `ZodTypeAny`, \{ `includeStats`: `boolean`; \}, \{ `includeStats?`: `boolean`; \}\> = `ServerHealthSchema`

Defined in: [src/tools/system/ServerHealthTool.ts:20](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/system/ServerHealthTool.ts#L20)

Zod schema for validating input parameters

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`inputSchema`](../../../base/Tool/classes/BaseTool.md#inputschema)

***

### name

> `readonly` **name**: `"server_health"` = `'server_health'`

Defined in: [src/tools/system/ServerHealthTool.ts:18](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/system/ServerHealthTool.ts#L18)

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

Defined in: [src/tools/system/ServerHealthTool.ts:22](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/system/ServerHealthTool.ts#L22)

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

Defined in: [src/tools/system/ServerHealthTool.ts:108](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/system/ServerHealthTool.ts#L108)

#### Returns

[`IToolMetadata`](../../../base/Tool/interfaces/IToolMetadata.md)

***

### isAvailable()

> **isAvailable**(): `boolean`

Defined in: [src/tools/system/ServerHealthTool.ts:103](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/system/ServerHealthTool.ts#L103)

#### Returns

`boolean`

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
