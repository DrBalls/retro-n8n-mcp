[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/batch.types](../README.md) / IBatchOperation

# Interface: IBatchOperation\<T\>

Defined in: [src/types/batch.types.ts:8](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L8)

## Type Parameters

### T

`T` = `any`

## Properties

### endTime?

> `optional` **endTime**: `Date`

Defined in: [src/types/batch.types.ts:18](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L18)

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/batch.types.ts:19](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L19)

***

### failedItems

> **failedItems**: `number`

Defined in: [src/types/batch.types.ts:15](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L15)

***

### id

> **id**: `string`

Defined in: [src/types/batch.types.ts:9](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L9)

***

### items

> **items**: [`IBatchItem`](IBatchItem.md)\<`T`\>[]

Defined in: [src/types/batch.types.ts:16](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L16)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [src/types/batch.types.ts:20](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L20)

***

### processedItems

> **processedItems**: `number`

Defined in: [src/types/batch.types.ts:13](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L13)

***

### startTime

> **startTime**: `Date`

Defined in: [src/types/batch.types.ts:17](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L17)

***

### status

> **status**: [`BatchOperationStatus`](../type-aliases/BatchOperationStatus.md)

Defined in: [src/types/batch.types.ts:11](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L11)

***

### successfulItems

> **successfulItems**: `number`

Defined in: [src/types/batch.types.ts:14](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L14)

***

### totalItems

> **totalItems**: `number`

Defined in: [src/types/batch.types.ts:12](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L12)

***

### type

> **type**: [`BatchOperationType`](../type-aliases/BatchOperationType.md)

Defined in: [src/types/batch.types.ts:10](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L10)
