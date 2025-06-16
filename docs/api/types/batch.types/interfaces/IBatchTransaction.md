[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/batch.types](../README.md) / IBatchTransaction

# Interface: IBatchTransaction

Defined in: [src/types/batch.types.ts:104](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L104)

## Properties

### completedAt?

> `optional` **completedAt**: `Date`

Defined in: [src/types/batch.types.ts:109](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L109)

***

### createdAt

> **createdAt**: `Date`

Defined in: [src/types/batch.types.ts:108](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L108)

***

### id

> **id**: `string`

Defined in: [src/types/batch.types.ts:105](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L105)

***

### operations

> **operations**: [`IBatchOperation`](IBatchOperation.md)\<`any`\>[]

Defined in: [src/types/batch.types.ts:106](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L106)

***

### rollbackState?

> `optional` **rollbackState**: [`IRollbackState`](IRollbackState.md)

Defined in: [src/types/batch.types.ts:110](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L110)

***

### status

> **status**: `"active"` \| `"rolled_back"` \| `"committed"`

Defined in: [src/types/batch.types.ts:107](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L107)
