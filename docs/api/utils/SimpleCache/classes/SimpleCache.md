[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [utils/SimpleCache](../README.md) / SimpleCache

# Class: SimpleCache\<T\>

Defined in: [src/utils/SimpleCache.ts:7](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/SimpleCache.ts#L7)

## Type Parameters

### T

`T` = `unknown`

## Constructors

### Constructor

> **new SimpleCache**\<`T`\>(`options`): `SimpleCache`\<`T`\>

Defined in: [src/utils/SimpleCache.ts:12](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/SimpleCache.ts#L12)

#### Parameters

##### options

###### defaultTtl?

`number`

###### maxSize?

`number`

#### Returns

`SimpleCache`\<`T`\>

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [src/utils/SimpleCache.ts:60](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/SimpleCache.ts#L60)

##### Returns

`number`

## Methods

### cleanup()

> **cleanup**(): `void`

Defined in: [src/utils/SimpleCache.ts:65](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/SimpleCache.ts#L65)

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [src/utils/SimpleCache.ts:56](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/SimpleCache.ts#L56)

#### Returns

`void`

***

### delete()

> **delete**(`key`): `boolean`

Defined in: [src/utils/SimpleCache.ts:52](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/SimpleCache.ts#L52)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### get()

> **get**(`key`): `undefined` \| `T`

Defined in: [src/utils/SimpleCache.ts:33](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/SimpleCache.ts#L33)

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `T`

***

### getStats()

> **getStats**(): `object`

Defined in: [src/utils/SimpleCache.ts:93](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/SimpleCache.ts#L93)

#### Returns

`object`

##### entries

> **entries**: `object`[]

##### hitRate

> **hitRate**: `number`

##### maxSize

> **maxSize**: `number`

##### size

> **size**: `number`

***

### has()

> **has**(`key`): `boolean`

Defined in: [src/utils/SimpleCache.ts:48](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/SimpleCache.ts#L48)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### set()

> **set**(`key`, `value`, `ttl?`): `void`

Defined in: [src/utils/SimpleCache.ts:17](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/SimpleCache.ts#L17)

#### Parameters

##### key

`string`

##### value

`T`

##### ttl?

`number`

#### Returns

`void`
