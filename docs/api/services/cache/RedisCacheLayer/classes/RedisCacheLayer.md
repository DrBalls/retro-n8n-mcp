[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [services/cache/RedisCacheLayer](../README.md) / RedisCacheLayer

# Class: RedisCacheLayer

Defined in: [src/services/cache/RedisCacheLayer.ts:36](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L36)

Redis cache layer with connection pooling and error handling

## Implements

- [`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md)

## Constructors

### Constructor

> **new RedisCacheLayer**(`config`): `RedisCacheLayer`

Defined in: [src/services/cache/RedisCacheLayer.ts:58](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L58)

#### Parameters

##### config

`RedisCacheConfig`

#### Returns

`RedisCacheLayer`

## Properties

### name

> `readonly` **name**: `"redis"` = `'redis'`

Defined in: [src/services/cache/RedisCacheLayer.ts:37](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L37)

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`name`](../../../../types/cache.types/interfaces/ICacheLayer.md#name)

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/services/cache/RedisCacheLayer.ts:246](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L246)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`clear`](../../../../types/cache.types/interfaces/ICacheLayer.md#clear)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/services/cache/RedisCacheLayer.ts:507](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L507)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`close`](../../../../types/cache.types/interfaces/ICacheLayer.md#close)

***

### delete()

> **delete**(`key`): `Promise`\<`boolean`\>

Defined in: [src/services/cache/RedisCacheLayer.ts:224](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L224)

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

Defined in: [src/services/cache/RedisCacheLayer.ts:375](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L375)

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

Defined in: [src/services/cache/RedisCacheLayer.ts:139](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L139)

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

Defined in: [src/services/cache/RedisCacheLayer.ts:268](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L268)

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

Defined in: [src/services/cache/RedisCacheLayer.ts:455](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L455)

#### Returns

`Promise`\<\{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`getStats`](../../../../types/cache.types/interfaces/ICacheLayer.md#getstats)

***

### invalidateByPattern()

> **invalidateByPattern**(`pattern`): `Promise`\<`number`\>

Defined in: [src/services/cache/RedisCacheLayer.ts:418](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L418)

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

Defined in: [src/services/cache/RedisCacheLayer.ts:429](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L429)

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

Defined in: [src/services/cache/RedisCacheLayer.ts:493](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L493)

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`isHealthy`](../../../../types/cache.types/interfaces/ICacheLayer.md#ishealthy)

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/services/cache/RedisCacheLayer.ts:395](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L395)

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

Defined in: [src/services/cache/RedisCacheLayer.ts:186](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L186)

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

Defined in: [src/services/cache/RedisCacheLayer.ts:314](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/RedisCacheLayer.ts#L314)

#### Parameters

##### entries

`Map`\<`string`, \{ `tags?`: `string`[]; `ttl?`: `number`; `value`: `unknown`; \}\>

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`ICacheLayer`](../../../../types/cache.types/interfaces/ICacheLayer.md).[`setMany`](../../../../types/cache.types/interfaces/ICacheLayer.md#setmany)
