[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [services/cache/CacheMonitoringService](../README.md) / CacheMonitoringService

# Class: CacheMonitoringService

Defined in: [src/services/cache/CacheMonitoringService.ts:28](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L28)

Service for monitoring cache performance, health, and generating alerts

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new CacheMonitoringService**(`cacheManager`): `CacheMonitoringService`

Defined in: [src/services/cache/CacheMonitoringService.ts:92](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L92)

#### Parameters

##### cacheManager

[`MultiTierCacheManager`](../../MultiTierCacheManager/classes/MultiTierCacheManager.md)

#### Returns

`CacheMonitoringService`

#### Overrides

`EventEmitter.constructor`

## Methods

### addAlertRule()

> **addAlertRule**(`rule`): `void`

Defined in: [src/services/cache/CacheMonitoringService.ts:201](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L201)

Add custom alert rule

#### Parameters

##### rule

`AlertRule`

#### Returns

`void`

***

### getActiveAlerts()

> **getActiveAlerts**(): `Alert`[]

Defined in: [src/services/cache/CacheMonitoringService.ts:159](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L159)

Get active alerts

#### Returns

`Alert`[]

***

### getAlertRules()

> **getAlertRules**(): `AlertRule`[]

Defined in: [src/services/cache/CacheMonitoringService.ts:228](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L228)

Get alert rules

#### Returns

`AlertRule`[]

***

### getAllAlerts()

> **getAllAlerts**(`since?`): `Alert`[]

Defined in: [src/services/cache/CacheMonitoringService.ts:166](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L166)

Get all alerts (including resolved ones)

#### Parameters

##### since?

`number`

#### Returns

`Alert`[]

***

### getCurrentMetrics()

> **getCurrentMetrics**(): `Promise`\<\{ `database?`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `health`: \{ `databaseLayer?`: `boolean`; `memoryLayer`: `boolean`; `overall`: `boolean`; `redisLayer?`: `boolean`; \}; `memory`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `overall`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `performance`: \{ `averageResponseTimeMs`: `number`; `errorRate`: `number`; `p95ResponseTimeMs`: `number`; `p99ResponseTimeMs`: `number`; `throughputPerSecond`: `number`; \}; `redis?`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `timestamp`: `number`; \}\>

Defined in: [src/services/cache/CacheMonitoringService.ts:144](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L144)

Get current cache metrics

#### Returns

`Promise`\<\{ `database?`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `health`: \{ `databaseLayer?`: `boolean`; `memoryLayer`: `boolean`; `overall`: `boolean`; `redisLayer?`: `boolean`; \}; `memory`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `overall`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `performance`: \{ `averageResponseTimeMs`: `number`; `errorRate`: `number`; `p95ResponseTimeMs`: `number`; `p99ResponseTimeMs`: `number`; `throughputPerSecond`: `number`; \}; `redis?`: \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}; `timestamp`: `number`; \}\>

***

### getEvents()

> **getEvents**(`limit?`, `type?`): `object`[]

Defined in: [src/services/cache/CacheMonitoringService.ts:176](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L176)

Get recent cache events

#### Parameters

##### limit?

`number`

##### type?

`string`

#### Returns

`object`[]

***

### getInvalidationHistory()

> **getInvalidationHistory**(`limit?`): `object`[]

Defined in: [src/services/cache/CacheMonitoringService.ts:193](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L193)

Get recent invalidation history

#### Parameters

##### limit?

`number`

#### Returns

`object`[]

***

### getMetricsHistory()

> **getMetricsHistory**(`since?`): `object`[]

Defined in: [src/services/cache/CacheMonitoringService.ts:151](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L151)

Get metrics history

#### Parameters

##### since?

`number`

#### Returns

`object`[]

***

### getPerformanceSummary()

> **getPerformanceSummary**(`timeframeMs`): `Promise`\<\{ `alertCount`: `number`; `averageHitRate`: `number`; `averageLatency`: `number`; `healthScore`: `number`; `peakThroughput`: `number`; `totalErrors`: `number`; `totalRequests`: `number`; \}\>

Defined in: [src/services/cache/CacheMonitoringService.ts:251](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L251)

Generate performance summary

#### Parameters

##### timeframeMs

`number` = `3600000`

#### Returns

`Promise`\<\{ `alertCount`: `number`; `averageHitRate`: `number`; `averageLatency`: `number`; `healthScore`: `number`; `peakThroughput`: `number`; `totalErrors`: `number`; `totalRequests`: `number`; \}\>

***

### removeAlertRule()

> **removeAlertRule**(`name`): `boolean`

Defined in: [src/services/cache/CacheMonitoringService.ts:215](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L215)

Remove alert rule

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### resolveAlert()

> **resolveAlert**(`alertId`): `boolean`

Defined in: [src/services/cache/CacheMonitoringService.ts:235](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L235)

Manually resolve an alert

#### Parameters

##### alertId

`string`

#### Returns

`boolean`

***

### start()

> **start**(): `void`

Defined in: [src/services/cache/CacheMonitoringService.ts:109](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L109)

Start monitoring cache performance

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [src/services/cache/CacheMonitoringService.ts:132](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheMonitoringService.ts#L132)

Stop monitoring

#### Returns

`void`
