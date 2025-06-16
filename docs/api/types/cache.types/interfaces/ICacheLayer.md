[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/cache.types](../README.md) / ICacheLayer

# Interface: ICacheLayer

Defined in: [src/types/cache.types.ts:98](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L98)

## Properties

### name

> **name**: `string`

Defined in: [src/types/cache.types.ts:99](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L99)

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/types/cache.types.ts:105](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L105)

#### Returns

`Promise`\<`void`\>

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/types/cache.types.ts:120](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L120)

#### Returns

`Promise`\<`void`\>

***

### delete()

> **delete**(`key`): `Promise`\<`boolean`\>

Defined in: [src/types/cache.types.ts:104](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L104)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`boolean`\>

***

### deleteMany()

> **deleteMany**(`keys`): `Promise`\<`number`\>

Defined in: [src/types/cache.types.ts:110](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L110)

#### Parameters

##### keys

`string`[]

#### Returns

`Promise`\<`number`\>

***

### get()

> **get**(`key`): `Promise`\<`null` \| \{ `accessCount`: `number`; `accessedAt`: `number`; `createdAt`: `number`; `key`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `size?`: `number`; `tags`: `string`[]; `ttl?`: `number`; `value?`: `unknown`; \}\>

Defined in: [src/types/cache.types.ts:102](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L102)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`null` \| \{ `accessCount`: `number`; `accessedAt`: `number`; `createdAt`: `number`; `key`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `size?`: `number`; `tags`: `string`[]; `ttl?`: `number`; `value?`: `unknown`; \}\>

***

### getMany()

> **getMany**(`keys`): `Promise`\<`Map`\<`string`, \{ `accessCount`: `number`; `accessedAt`: `number`; `createdAt`: `number`; `key`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `size?`: `number`; `tags`: `string`[]; `ttl?`: `number`; `value?`: `unknown`; \}\>\>

Defined in: [src/types/cache.types.ts:108](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L108)

#### Parameters

##### keys

`string`[]

#### Returns

`Promise`\<`Map`\<`string`, \{ `accessCount`: `number`; `accessedAt`: `number`; `createdAt`: `number`; `key`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `size?`: `number`; `tags`: `string`[]; `ttl?`: `number`; `value?`: `unknown`; \}\>\>

***

### getStats()

> **getStats**(): `Promise`\<\{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}\>

Defined in: [src/types/cache.types.ts:118](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L118)

#### Returns

`Promise`\<\{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}\>

***

### invalidateByPattern()

> **invalidateByPattern**(`pattern`): `Promise`\<`number`\>

Defined in: [src/types/cache.types.ts:114](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L114)

#### Parameters

##### pattern

`string`

#### Returns

`Promise`\<`number`\>

***

### invalidateByTag()

> **invalidateByTag**(`tag`): `Promise`\<`number`\>

Defined in: [src/types/cache.types.ts:115](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L115)

#### Parameters

##### tag

`string`

#### Returns

`Promise`\<`number`\>

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/types/cache.types.ts:119](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L119)

#### Returns

`Promise`\<`boolean`\>

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/types/cache.types.ts:113](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L113)

#### Parameters

##### pattern?

`string`

#### Returns

`Promise`\<`string`[]\>

***

### set()

> **set**(`key`, `value`, `options?`): `Promise`\<`boolean`\>

Defined in: [src/types/cache.types.ts:103](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L103)

#### Parameters

##### key

`string`

##### value

`unknown`

##### options?

###### tags?

`string`[]

###### ttl?

`number`

#### Returns

`Promise`\<`boolean`\>

***

### setMany()

> **setMany**(`entries`): `Promise`\<`boolean`\>

Defined in: [src/types/cache.types.ts:109](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L109)

#### Parameters

##### entries

`Map`\<`string`, \{ `tags?`: `string`[]; `ttl?`: `number`; `value`: `unknown`; \}\>

#### Returns

`Promise`\<`boolean`\>
