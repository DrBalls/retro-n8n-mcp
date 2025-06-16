[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [tools/base/Tool](../README.md) / ITool

# Interface: ITool

Defined in: [src/tools/base/Tool.ts:11](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L11)

Base interface for all n8n MCP tools

## Properties

### description

> `readonly` **description**: `string`

Defined in: [src/tools/base/Tool.ts:20](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L20)

Human-readable description of what the tool does

***

### inputSchema

> `readonly` **inputSchema**: `ZodType`\<`any`\>

Defined in: [src/tools/base/Tool.ts:25](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L25)

Zod schema for validating input parameters

***

### name

> `readonly` **name**: `string`

Defined in: [src/tools/base/Tool.ts:15](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L15)

Unique identifier for the tool

## Methods

### execute()

> **execute**(`params`, `context`): `Promise`\<[`IToolResponse`](IToolResponse.md)\>

Defined in: [src/tools/base/Tool.ts:30](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L30)

Execute the tool with validated parameters

#### Parameters

##### params

`unknown`

##### context

[`IToolContext`](IToolContext.md)

#### Returns

`Promise`\<[`IToolResponse`](IToolResponse.md)\>

***

### getMetadata()?

> `optional` **getMetadata**(): [`IToolMetadata`](IToolMetadata.md)

Defined in: [src/tools/base/Tool.ts:45](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L45)

Optional method to get tool metadata

#### Returns

[`IToolMetadata`](IToolMetadata.md)

***

### isAvailable()?

> `optional` **isAvailable**(): `boolean` \| `Promise`\<`boolean`\>

Defined in: [src/tools/base/Tool.ts:40](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L40)

Optional method to check if tool is available

#### Returns

`boolean` \| `Promise`\<`boolean`\>

***

### toMcpTool()

> **toMcpTool**(): `object`

Defined in: [src/tools/base/Tool.ts:35](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L35)

Convert to MCP tool definition

#### Returns

`object`
