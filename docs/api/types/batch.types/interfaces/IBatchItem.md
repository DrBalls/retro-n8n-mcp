[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/batch.types](../README.md) / IBatchItem

# Interface: IBatchItem\<T\>

Defined in: [src/types/batch.types.ts:23](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L23)

## Type Parameters

### T

`T` = `any`

## Properties

### data

> **data**: `T`

Defined in: [src/types/batch.types.ts:25](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L25)

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/batch.types.ts:27](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L27)

***

### id

> **id**: `string`

Defined in: [src/types/batch.types.ts:24](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L24)

***

### processedAt?

> `optional` **processedAt**: `Date`

Defined in: [src/types/batch.types.ts:30](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L30)

***

### result?

> `optional` **result**: `any`

Defined in: [src/types/batch.types.ts:28](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L28)

***

### retryCount?

> `optional` **retryCount**: `number`

Defined in: [src/types/batch.types.ts:29](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L29)

***

### status

> **status**: `"success"` \| `"pending"` \| `"failed"` \| `"rolled_back"` \| `"processing"`

Defined in: [src/types/batch.types.ts:26](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L26)
