[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [utils/RequestQueue](../README.md) / RequestQueue

# Class: RequestQueue

Defined in: [src/utils/RequestQueue.ts:12](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L12)

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new RequestQueue**(`options`): `RequestQueue`

Defined in: [src/utils/RequestQueue.ts:22](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L22)

#### Parameters

##### options

###### concurrency?

`number`

###### interval?

`number`

###### intervalCap?

`number`

#### Returns

`RequestQueue`

#### Overrides

`EventEmitter.constructor`

## Accessors

### active

#### Get Signature

> **get** **active**(): `number`

Defined in: [src/utils/RequestQueue.ts:133](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L133)

##### Returns

`number`

***

### isPaused

#### Get Signature

> **get** **isPaused**(): `boolean`

Defined in: [src/utils/RequestQueue.ts:137](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L137)

##### Returns

`boolean`

***

### pending

#### Get Signature

> **get** **pending**(): `number`

Defined in: [src/utils/RequestQueue.ts:129](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L129)

##### Returns

`number`

***

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [src/utils/RequestQueue.ts:125](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L125)

##### Returns

`number`

## Methods

### add()

> **add**\<`T`\>(`execute`, `priority`): `Promise`\<`T`\>

Defined in: [src/utils/RequestQueue.ts:33](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L33)

#### Type Parameters

##### T

`T`

#### Parameters

##### execute

() => `Promise`\<`T`\>

##### priority

`number` = `0`

#### Returns

`Promise`\<`T`\>

***

### clear()

> **clear**(): `void`

Defined in: [src/utils/RequestQueue.ts:116](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L116)

#### Returns

`void`

***

### pause()

> **pause**(): `void`

Defined in: [src/utils/RequestQueue.ts:105](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L105)

#### Returns

`void`

***

### resume()

> **resume**(): `void`

Defined in: [src/utils/RequestQueue.ts:110](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/RequestQueue.ts#L110)

#### Returns

`void`
