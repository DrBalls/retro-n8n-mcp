[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [utils/RequestQueue](../README.md) / QueuedRequest

# Interface: QueuedRequest\<T\>

Defined in: [src/utils/RequestQueue.ts:3](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L3)

## Type Parameters

### T

`T` = `unknown`

## Properties

### execute()

> **execute**: () => `Promise`\<`T`\>

Defined in: [src/utils/RequestQueue.ts:7](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L7)

#### Returns

`Promise`\<`T`\>

***

### id

> **id**: `string`

Defined in: [src/utils/RequestQueue.ts:4](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L4)

***

### priority

> **priority**: `number`

Defined in: [src/utils/RequestQueue.ts:5](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L5)

***

### reject()

> **reject**: (`error`) => `void`

Defined in: [src/utils/RequestQueue.ts:9](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L9)

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### resolve()

> **resolve**: (`value`) => `void`

Defined in: [src/utils/RequestQueue.ts:8](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L8)

#### Parameters

##### value

`T` | `PromiseLike`\<`T`\>

#### Returns

`void`

***

### timestamp

> **timestamp**: `number`

Defined in: [src/utils/RequestQueue.ts:6](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L6)
