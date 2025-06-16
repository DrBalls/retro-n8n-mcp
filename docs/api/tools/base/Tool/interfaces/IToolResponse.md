[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [tools/base/Tool](../README.md) / IToolResponse

# Interface: IToolResponse

Defined in: [src/tools/base/Tool.ts:84](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L84)

Standard tool response format

## Properties

### content

> **content**: `object`[]

Defined in: [src/tools/base/Tool.ts:85](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L85)

#### data?

> `optional` **data**: `unknown`

#### mimeType?

> `optional` **mimeType**: `string`

#### text?

> `optional` **text**: `string`

#### type

> **type**: `"resource"` \| `"text"` \| `"image"`

***

### isError?

> `optional` **isError**: `boolean`

Defined in: [src/tools/base/Tool.ts:91](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L91)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [src/tools/base/Tool.ts:92](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L92)
