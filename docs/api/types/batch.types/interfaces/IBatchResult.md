[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/batch.types](../README.md) / IBatchResult

# Interface: IBatchResult\<T\>

Defined in: [src/types/batch.types.ts:82](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L82)

## Type Parameters

### T

`T` = `any`

## Properties

### errors?

> `optional` **errors**: `object`[]

Defined in: [src/types/batch.types.ts:97](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L97)

#### error

> **error**: `string`

#### itemId

> **itemId**: `string`

#### retryable

> **retryable**: `boolean`

***

### operationId

> **operationId**: `string`

Defined in: [src/types/batch.types.ts:83](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L83)

***

### results

> **results**: `object`[]

Defined in: [src/types/batch.types.ts:91](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L91)

#### data?

> `optional` **data**: `T`

#### error?

> `optional` **error**: `string`

#### itemId

> **itemId**: `string`

#### success

> **success**: `boolean`

***

### status

> **status**: [`BatchOperationStatus`](../type-aliases/BatchOperationStatus.md)

Defined in: [src/types/batch.types.ts:84](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L84)

***

### summary

> **summary**: `object`

Defined in: [src/types/batch.types.ts:85](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/batch.types.ts#L85)

#### duration

> **duration**: `number`

#### failed

> **failed**: `number`

#### successful

> **successful**: `number`

#### total

> **total**: `number`
