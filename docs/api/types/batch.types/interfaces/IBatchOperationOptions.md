[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/batch.types](../README.md) / IBatchOperationOptions

# Interface: IBatchOperationOptions

Defined in: [src/types/batch.types.ts:33](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L33)

## Properties

### atomic?

> `optional` **atomic**: `boolean`

Defined in: [src/types/batch.types.ts:42](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L42)

Enable atomic transactions (all succeed or all fail)

***

### concurrency?

> `optional` **concurrency**: `number`

Defined in: [src/types/batch.types.ts:47](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L47)

Maximum number of concurrent operations

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [src/types/batch.types.ts:52](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L52)

Maximum retries per item

***

### onProgress()?

> `optional` **onProgress**: (`progress`) => `void`

Defined in: [src/types/batch.types.ts:62](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L62)

Progress callback

#### Parameters

##### progress

[`IBatchProgress`](IBatchProgress.md)

#### Returns

`void`

***

### retryDelay?

> `optional` **retryDelay**: `number`

Defined in: [src/types/batch.types.ts:57](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L57)

Delay between retries in ms

***

### stopOnError?

> `optional` **stopOnError**: `boolean`

Defined in: [src/types/batch.types.ts:37](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L37)

Whether to stop on first error or continue processing

***

### validateItem()?

> `optional` **validateItem**: (`item`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: [src/types/batch.types.ts:67](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L67)

Custom validation function for items

#### Parameters

##### item

`any`

#### Returns

`boolean` \| `Promise`\<`boolean`\>
