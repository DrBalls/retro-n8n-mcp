[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [services/cache/MultiTierCacheManager](../README.md) / MultiTierCacheManager

# Class: MultiTierCacheManager

Defined in: [src/services/cache/MultiTierCacheManager.ts:21](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L21)

Multi-tier cache manager that orchestrates memory, Redis, and database cache layers

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new MultiTierCacheManager**(`config`): `MultiTierCacheManager`

Defined in: [src/services/cache/MultiTierCacheManager.ts:43](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L43)

#### Parameters

##### config

###### database?

\{ `cleanupIntervalMs`: `number`; `enabled`: `boolean`; `tableName`: `string`; `ttlMs`: `number`; \} = `...`

###### database.cleanupIntervalMs

`number` = `...`

###### database.enabled

`boolean` = `...`

###### database.tableName

`string` = `...`

###### database.ttlMs

`number` = `...`

###### memory?

\{ `cleanupIntervalMs`: `number`; `maxMemoryMB`: `number`; `maxSize`: `number`; `ttlMs`: `number`; \} = `...`

###### memory.cleanupIntervalMs

`number` = `...`

###### memory.maxMemoryMB

`number` = `...`

###### memory.maxSize

`number` = `...`

###### memory.ttlMs

`number` = `...`

###### redis?

\{ `connectionPool?`: \{ `max`: `number`; `min`: `number`; \}; `db`: `number`; `host`: `string`; `keyPrefix`: `string`; `password?`: `string`; `port`: `number`; `ttlMs`: `number`; \} = `...`

###### redis.connectionPool?

\{ `max`: `number`; `min`: `number`; \} = `...`

###### redis.connectionPool.max

`number` = `...`

###### redis.connectionPool.min

`number` = `...`

###### redis.db

`number` = `...`

###### redis.host

`string` = `...`

###### redis.keyPrefix

`string` = `...`

###### redis.password?

`string` = `...`

###### redis.port

`number` = `...`

###### redis.ttlMs

`number` = `...`

###### strategy?

\{ `compression`: `boolean`; `readThrough`: `boolean`; `serialization`: `"json"` \| `"msgpack"`; `writeBehind`: `boolean`; `writeThrough`: `boolean`; \} = `...`

###### strategy.compression

`boolean` = `...`

###### strategy.readThrough

`boolean` = `...`

###### strategy.serialization

`"json"` \| `"msgpack"` = `...`

###### strategy.writeBehind

`boolean` = `...`

###### strategy.writeThrough

`boolean` = `...`

#### Returns

`MultiTierCacheManager`

#### Overrides

`EventEmitter.constructor`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:248](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L248)

Clear all cache layers

#### Returns

`Promise`\<`void`\>

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:475](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L475)

Close all cache layers

#### Returns

`Promise`\<`void`\>

***

### delete()

> **delete**(`key`): `Promise`\<\{ `error?`: `string`; `hit?`: `boolean`; `key`: `string`; `latencyMs?`: `number`; `layer?`: `"memory"` \| `"redis"` \| `"database"`; `success`: `boolean`; `value?`: `unknown`; \}\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:211](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L211)

Delete value from cache across all layers

#### Parameters

##### key

`string`

#### Returns

`Promise`\<\{ `error?`: `string`; `hit?`: `boolean`; `key`: `string`; `latencyMs?`: `number`; `layer?`: `"memory"` \| `"redis"` \| `"database"`; `success`: `boolean`; `value?`: `unknown`; \}\>

***

### get()

> **get**(`key`): `Promise`\<\{ `error?`: `string`; `hit?`: `boolean`; `key`: `string`; `latencyMs?`: `number`; `layer?`: `"memory"` \| `"redis"` \| `"database"`; `success`: `boolean`; `value?`: `unknown`; \}\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:84](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L84)

Get value from cache, checking layers in order (memory -> Redis -> database)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<\{ `error?`: `string`; `hit?`: `boolean`; `key`: `string`; `latencyMs?`: `number`; `layer?`: `"memory"` \| `"redis"` \| `"database"`; `success`: `boolean`; `value?`: `unknown`; \}\>

***

### getKeyBuilder()

> **getKeyBuilder**(): [`CacheKeyBuilder`](../../CacheKeyBuilder/classes/CacheKeyBuilder.md)

Defined in: [src/services/cache/MultiTierCacheManager.ts:468](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L468)

Get cache key builder for consistent key generation

#### Returns

[`CacheKeyBuilder`](../../CacheKeyBuilder/classes/CacheKeyBuilder.md)

***

### getStats()

> **getStats**(): `Promise`\<\{ `database?`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `health`: \{ `databaseLayer?`: `boolean`; `memoryLayer`: `boolean`; `overall`: `boolean`; `redisLayer?`: `boolean`; \}; `memory`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `overall`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `performance`: \{ `averageResponseTimeMs`: `number`; `errorRate`: `number`; `p95ResponseTimeMs`: `number`; `p99ResponseTimeMs`: `number`; `throughputPerSecond`: `number`; \}; `redis?`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `timestamp`: `number`; \}\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:367](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L367)

Get comprehensive cache statistics across all layers

#### Returns

`Promise`\<\{ `database?`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `health`: \{ `databaseLayer?`: `boolean`; `memoryLayer`: `boolean`; `overall`: `boolean`; `redisLayer?`: `boolean`; \}; `memory`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `overall`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `performance`: \{ `averageResponseTimeMs`: `number`; `errorRate`: `number`; `p95ResponseTimeMs`: `number`; `p99ResponseTimeMs`: `number`; `throughputPerSecond`: `number`; \}; `redis?`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `timestamp`: `number`; \}\>

***

### invalidateByPattern()

> **invalidateByPattern**(`pattern`, `reason?`): `Promise`\<`number`\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:262](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L262)

Invalidate cache entries by pattern

#### Parameters

##### pattern

`string`

##### reason?

`string`

#### Returns

`Promise`\<`number`\>

***

### invalidateByTag()

> **invalidateByTag**(`tag`, `reason?`): `Promise`\<`number`\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:294](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L294)

Invalidate cache entries by tag

#### Parameters

##### tag

`string`

##### reason?

`string`

#### Returns

`Promise`\<`number`\>

***

### invalidateExecution()

> **invalidateExecution**(`executionId`, `workflowId?`, `reason?`): `Promise`\<`number`\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:346](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L346)

Invalidate cache entries for a specific execution

#### Parameters

##### executionId

`string`

##### workflowId?

`string`

##### reason?

`string`

#### Returns

`Promise`\<`number`\>

***

### invalidateWorkflow()

> **invalidateWorkflow**(`workflowId`, `reason?`): `Promise`\<`number`\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:326](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L326)

Invalidate cache entries for a specific workflow

#### Parameters

##### workflowId

`string`

##### reason?

`string`

#### Returns

`Promise`\<`number`\>

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:456](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L456)

Check if cache system is healthy

#### Returns

`Promise`\<`boolean`\>

***

### set()

> **set**(`key`, `value`, `options?`): `Promise`\<\{ `error?`: `string`; `hit?`: `boolean`; `key`: `string`; `latencyMs?`: `number`; `layer?`: `"memory"` \| `"redis"` \| `"database"`; `success`: `boolean`; `value?`: `unknown`; \}\>

Defined in: [src/services/cache/MultiTierCacheManager.ts:139](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/MultiTierCacheManager.ts#L139)

Set value in cache, using write strategy (write-through, write-behind, etc.)

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

`Promise`\<\{ `error?`: `string`; `hit?`: `boolean`; `key`: `string`; `latencyMs?`: `number`; `layer?`: `"memory"` \| `"redis"` \| `"database"`; `success`: `boolean`; `value?`: `unknown`; \}\>
