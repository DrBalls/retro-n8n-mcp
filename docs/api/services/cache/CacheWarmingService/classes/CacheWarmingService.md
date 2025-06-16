[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [services/cache/CacheWarmingService](../README.md) / CacheWarmingService

# Class: CacheWarmingService

Defined in: [src/services/cache/CacheWarmingService.ts:19](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheWarmingService.ts#L19)

Service for warming cache with frequently accessed data and prefetching related data

## Constructors

### Constructor

> **new CacheWarmingService**(`cacheManager`, `warmingConfig`, `prefetchConfig`, `apiClient?`): `CacheWarmingService`

Defined in: [src/services/cache/CacheWarmingService.ts:38](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheWarmingService.ts#L38)

#### Parameters

##### cacheManager

[`MultiTierCacheManager`](../../MultiTierCacheManager/classes/MultiTierCacheManager.md)

##### warmingConfig

###### enabled

`boolean` = `...`

###### strategies

`object`[] = `...`

##### prefetchConfig

###### enabled

`boolean` = `...`

###### maxConcurrent

`number` = `...`

###### timeoutMs

`number` = `...`

###### triggers

`object`[] = `...`

##### apiClient?

[`N8nApiClient`](../../../N8nApiClient/classes/N8nApiClient.md)

#### Returns

`CacheWarmingService`

## Methods

### getStats()

> **getStats**(): `object`

Defined in: [src/services/cache/CacheWarmingService.ts:162](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheWarmingService.ts#L162)

Get warming and prefetching statistics

#### Returns

`object`

##### errors

> **errors**: `number` = `0`

##### prefetchExecutions

> **prefetchExecutions**: `number` = `0`

##### totalPrefetched

> **totalPrefetched**: `number` = `0`

##### totalWarmed

> **totalWarmed**: `number` = `0`

##### warmingExecutions

> **warmingExecutions**: `number` = `0`

***

### start()

> **start**(): `Promise`\<`void`\>

Defined in: [src/services/cache/CacheWarmingService.ts:53](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheWarmingService.ts#L53)

Start cache warming service

#### Returns

`Promise`\<`void`\>

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [src/services/cache/CacheWarmingService.ts:77](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheWarmingService.ts#L77)

Stop cache warming service

#### Returns

`Promise`\<`void`\>

***

### triggerPrefetch()

> **triggerPrefetch**(`conditionContext`): `Promise`\<`number`\>

Defined in: [src/services/cache/CacheWarmingService.ts:113](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheWarmingService.ts#L113)

Trigger prefetching based on a condition

#### Parameters

##### conditionContext

`Record`\<`string`, `any`\>

#### Returns

`Promise`\<`number`\>

***

### warmStrategy()

> **warmStrategy**(`strategyName`): `Promise`\<`number`\>

Defined in: [src/services/cache/CacheWarmingService.ts:97](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheWarmingService.ts#L97)

Manually trigger warming for a specific strategy

#### Parameters

##### strategyName

`string`

#### Returns

`Promise`\<`number`\>
