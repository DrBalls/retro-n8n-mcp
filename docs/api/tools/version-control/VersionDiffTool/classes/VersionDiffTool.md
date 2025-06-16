[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [tools/version-control/VersionDiffTool](../README.md) / VersionDiffTool

# Class: VersionDiffTool

Defined in: [src/tools/version-control/VersionDiffTool.ts:11](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/version-control/VersionDiffTool.ts#L11)

Tool for generating diffs between workflow versions
Provides detailed comparison with visualization options

## Extends

- [`BaseTool`](../../../base/Tool/classes/BaseTool.md)

## Constructors

### Constructor

> **new VersionDiffTool**(): `VersionDiffTool`

#### Returns

`VersionDiffTool`

#### Inherited from

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`constructor`](../../../base/Tool/classes/BaseTool.md#constructor)

## Properties

### description

> **description**: `string` = `'Generate detailed diff between two workflow versions with visualization options'`

Defined in: [src/tools/version-control/VersionDiffTool.ts:13](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/version-control/VersionDiffTool.ts#L13)

Human-readable description of what the tool does

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`description`](../../../base/Tool/classes/BaseTool.md#description)

***

### inputSchema

> **inputSchema**: `ZodObject`\<\{ `format`: `ZodDefault`\<`ZodEnum`\<\[`"detailed"`, `"summary"`, `"visual"`, `"json"`\]\>\>; `fromVersionId`: `ZodString`; `highlightChanges`: `ZodDefault`\<`ZodBoolean`\>; `includeContext`: `ZodDefault`\<`ZodBoolean`\>; `includeMetadata`: `ZodDefault`\<`ZodBoolean`\>; `maxDepth`: `ZodDefault`\<`ZodNumber`\>; `toVersionId`: `ZodString`; `workflowId`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `format`: `"json"` \| `"summary"` \| `"detailed"` \| `"visual"`; `fromVersionId`: `string`; `highlightChanges`: `boolean`; `includeContext`: `boolean`; `includeMetadata`: `boolean`; `maxDepth`: `number`; `toVersionId`: `string`; `workflowId`: `string`; \}, \{ `format?`: `"json"` \| `"summary"` \| `"detailed"` \| `"visual"`; `fromVersionId`: `string`; `highlightChanges?`: `boolean`; `includeContext?`: `boolean`; `includeMetadata?`: `boolean`; `maxDepth?`: `number`; `toVersionId`: `string`; `workflowId`: `string`; \}\>

Defined in: [src/tools/version-control/VersionDiffTool.ts:19](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/version-control/VersionDiffTool.ts#L19)

Zod schema for validating input parameters

#### Overrides

[`BaseTool`](../../../base/Tool/classes/BaseTool.md).[`inputSchema`](../../../base/Tool/classes/BaseTool.md#inputschema)

***

### name

> **name**: `string` = `'version_diff'`

Defined in: [src/tools/version-control/VersionDiffTool.ts:12](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/version-control/VersionDiffTool.ts#L12)

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

Defined in: [src/tools/version-control/VersionDiffTool.ts:30](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/version-control/VersionDiffTool.ts#L30)

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

Defined in: [src/tools/version-control/VersionDiffTool.ts:477](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/version-control/VersionDiffTool.ts#L477)

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
