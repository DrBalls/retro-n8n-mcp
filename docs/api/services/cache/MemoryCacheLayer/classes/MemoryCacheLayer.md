[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [services/cache/MemoryCacheLayer](../README.md) / MemoryCacheLayer

# Class: MemoryCacheLayer

Defined in: [src/services/cache/MemoryCacheLayer.ts:20](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L20)

In-memory cache layer with LRU eviction and TTL support

## Implements

- [`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md)

## Constructors

### Constructor

> **new MemoryCacheLayer**(`config`): `MemoryCacheLayer`

Defined in: [src/services/cache/MemoryCacheLayer.ts:41](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L41)

#### Parameters

##### config

`MemoryCacheConfig`

#### Returns

`MemoryCacheLayer`

## Properties

### name

> `readonly` **name**: `"memory"` = `'memory'`

Defined in: [src/services/cache/MemoryCacheLayer.ts:21](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L21)

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`name`](../../../../types/cache.types/interfaces/ICacheLayer.md#name)

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:152](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L152)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`clear`](../../../../types/cache.types/interfaces/ICacheLayer.md#clear)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:289](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L289)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`close`](../../../../types/cache.types/interfaces/ICacheLayer.md#close)

***

### delete()

> **delete**(`key`): `Promise`\<`boolean`\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:135](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L135)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`delete`](../../../../types/cache.types/interfaces/ICacheLayer.md#delete)

***

### deleteMany()

> **deleteMany**(`keys`): `Promise`\<`number`\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:190](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L190)

#### Parameters

##### keys

`string`[]

#### Returns

`Promise`\<`number`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`deleteMany`](../../../../types/cache.types/interfaces/ICacheLayer.md#deletemany)

***

### get()

> **get**(`key`): `Promise`\<`null` \| \{ `accessCount`: `number`; `accessedAt`: `number`; `createdAt`: `number`; `key`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `size?`: `number`; `tags`: `string`[]; `ttl?`: `number`; `value?`: `unknown`; \}\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:57](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L57)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`null` \| \{ `accessCount`: `number`; `accessedAt`: `number`; `createdAt`: `number`; `key`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `size?`: `number`; `tags`: `string`[]; `ttl?`: `number`; `value?`: `unknown`; \}\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`get`](../../../../types/cache.types/interfaces/ICacheLayer.md#get)

***

### getMany()

> **getMany**(`keys`): `Promise`\<`Map`\<`string`, \{ `accessCount`: `number`; `accessedAt`: `number`; `createdAt`: `number`; `key`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `size?`: `number`; `tags`: `string`[]; `ttl?`: `number`; `value?`: `unknown`; \}\>\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:164](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L164)

#### Parameters

##### keys

`string`[]

#### Returns

`Promise`\<`Map`\<`string`, \{ `accessCount`: `number`; `accessedAt`: `number`; `createdAt`: `number`; `key`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `size?`: `number`; `tags`: `string`[]; `ttl?`: `number`; `value?`: `unknown`; \}\>\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`getMany`](../../../../types/cache.types/interfaces/ICacheLayer.md#getmany)

***

### getStats()

> **getStats**(): `Promise`\<\{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:255](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L255)

#### Returns

`Promise`\<\{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`getStats`](../../../../types/cache.types/interfaces/ICacheLayer.md#getstats)

***

### invalidateByPattern()

> **invalidateByPattern**(`pattern`): `Promise`\<`number`\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:226](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L226)

#### Parameters

##### pattern

`string`

#### Returns

`Promise`\<`number`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`invalidateByPattern`](../../../../types/cache.types/interfaces/ICacheLayer.md#invalidatebypattern)

***

### invalidateByTag()

> **invalidateByTag**(`tag`): `Promise`\<`number`\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:237](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L237)

#### Parameters

##### tag

`string`

#### Returns

`Promise`\<`number`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`invalidateByTag`](../../../../types/cache.types/interfaces/ICacheLayer.md#invalidatebytag)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:274](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L274)

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`isHealthy`](../../../../types/cache.types/interfaces/ICacheLayer.md#ishealthy)

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:203](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L203)

#### Parameters

##### pattern?

`string`

#### Returns

`Promise`\<`string`[]\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`keys`](../../../../types/cache.types/interfaces/ICacheLayer.md#keys)

***

### set()

> **set**(`key`, `value`, `options?`): `Promise`\<`boolean`\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:88](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L88)

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

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`set`](../../../../types/cache.types/interfaces/ICacheLayer.md#set)

***

### setMany()

> **setMany**(`entries`): `Promise`\<`boolean`\>

Defined in: [src/services/cache/MemoryCacheLayer.ts:177](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MemoryCacheLayer.ts#L177)

#### Parameters

##### entries

`Map`\<`string`, \{ `tags?`: `string`[]; `ttl?`: `number`; `value`: `unknown`; \}\>

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`setMany`](../../../../types/cache.types/interfaces/ICacheLayer.md#setmany)
