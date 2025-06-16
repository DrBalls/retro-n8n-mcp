[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/N8nApiClient](../README.md) / N8nApiClient

# Class: N8nApiClient

Defined in: [src/services/N8nApiClient.ts:31](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L31)

## Constructors

### Constructor

> **new N8nApiClient**(`config`, `cacheConfig?`): `N8nApiClient`

Defined in: [src/services/N8nApiClient.ts:39](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L39)

#### Parameters

##### config

`Partial`\<[`N8nApiConfig`](../../../types/config.types/type-aliases/N8nApiConfig.md)\> = `{}`

##### cacheConfig?

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

`N8nApiClient`

## Methods

### activateWorkflow()

> **activateWorkflow**(`id`): `Promise`\<\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:308](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L308)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}\>

***

### clearCache()

> **clearCache**(): `void`

Defined in: [src/services/N8nApiClient.ts:399](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L399)

#### Returns

`void`

***

### closeCache()

> **closeCache**(): `Promise`\<`void`\>

Defined in: [src/services/N8nApiClient.ts:431](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L431)

#### Returns

`Promise`\<`void`\>

***

### createCredential()

> **createCredential**(`credential`): `Promise`\<\{ `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodesAccess?`: `object`[]; `type`: `string`; `updatedAt`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:367](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L367)

#### Parameters

##### credential

`Partial`\<[`Credential`](../../../types/n8n.types/type-aliases/Credential.md)\>

#### Returns

`Promise`\<\{ `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodesAccess?`: `object`[]; `type`: `string`; `updatedAt`: `string`; \}\>

***

### createWorkflow()

> **createWorkflow**(`workflow`): `Promise`\<\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:292](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L292)

#### Parameters

##### workflow

`Partial`\<[`Workflow`](../../../types/n8n.types/type-aliases/Workflow.md)\>

#### Returns

`Promise`\<\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}\>

***

### deactivateWorkflow()

> **deactivateWorkflow**(`id`): `Promise`\<\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:314](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L314)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}\>

***

### deleteCredential()

> **deleteCredential**(`id`): `Promise`\<`void`\>

Defined in: [src/services/N8nApiClient.ts:382](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L382)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteExecution()

> **deleteExecution**(`id`): `Promise`\<`void`\>

Defined in: [src/services/N8nApiClient.ts:349](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L349)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteWorkflow()

> **deleteWorkflow**(`id`): `Promise`\<`void`\>

Defined in: [src/services/N8nApiClient.ts:304](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L304)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### getCacheManager()

> **getCacheManager**(): `undefined` \| [`MultiTierCacheManager`](../../cache/MultiTierCacheManager/classes/MultiTierCacheManager.md)

Defined in: [src/services/N8nApiClient.ts:427](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L427)

#### Returns

`undefined` \| [`MultiTierCacheManager`](../../cache/MultiTierCacheManager/classes/MultiTierCacheManager.md)

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [src/services/N8nApiClient.ts:403](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L403)

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

### getCredential()

> **getCredential**(`id`): `Promise`\<\{ `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodesAccess?`: `object`[]; `type`: `string`; `updatedAt`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:363](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L363)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodesAccess?`: `object`[]; `type`: `string`; `updatedAt`: `string`; \}\>

***

### getCredentials()

> **getCredentials**(`options`): `Promise`\<\{ `data`: `object`[]; `nextCursor?`: `null` \| `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:354](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L354)

#### Parameters

##### options

###### cursor?

`string`

###### limit?

`number`

#### Returns

`Promise`\<\{ `data`: `object`[]; `nextCursor?`: `null` \| `string`; \}\>

***

### getExecution()

> **getExecution**(`id`): `Promise`\<\{ `data?`: \{ `executionData?`: \{ `contextData`: `Record`\<`string`, `unknown`\>; `executionTime?`: `number`; `nodeExecutionStack`: `unknown`[]; `waitingExecution?`: `Record`\<`string`, `unknown`\>; `waitingExecutionSource?`: `Record`\<`string`, `unknown`\>; \}; `resultData?`: \{ `lastNodeExecuted?`: `string`; `runData`: `Record`\<`string`, `unknown`\>; \}; `startData?`: `Record`\<`string`, `unknown`\>; \}; `finished`: `boolean`; `id`: `string`; `mode`: `"retry"` \| `"manual"` \| `"trigger"` \| `"webhook"` \| `"integrated"` \| `"cli"`; `retryOf?`: `null` \| `string`; `retrySuccessId?`: `null` \| `string`; `startedAt`: `string`; `status`: `"success"` \| `"error"` \| `"unknown"` \| `"canceled"` \| `"crashed"` \| `"new"` \| `"running"` \| `"waiting"`; `stoppedAt?`: `null` \| `string`; `workflowData?`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:332](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L332)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `data?`: \{ `executionData?`: \{ `contextData`: `Record`\<`string`, `unknown`\>; `executionTime?`: `number`; `nodeExecutionStack`: `unknown`[]; `waitingExecution?`: `Record`\<`string`, `unknown`\>; `waitingExecutionSource?`: `Record`\<`string`, `unknown`\>; \}; `resultData?`: \{ `lastNodeExecuted?`: `string`; `runData`: `Record`\<`string`, `unknown`\>; \}; `startData?`: `Record`\<`string`, `unknown`\>; \}; `finished`: `boolean`; `id`: `string`; `mode`: `"retry"` \| `"manual"` \| `"trigger"` \| `"webhook"` \| `"integrated"` \| `"cli"`; `retryOf?`: `null` \| `string`; `retrySuccessId?`: `null` \| `string`; `startedAt`: `string`; `status`: `"success"` \| `"error"` \| `"unknown"` \| `"canceled"` \| `"crashed"` \| `"new"` \| `"running"` \| `"waiting"`; `stoppedAt?`: `null` \| `string`; `workflowData?`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

***

### getExecutions()

> **getExecutions**(`options`): `Promise`\<\{ `data`: `object`[]; `nextCursor?`: `null` \| `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:321](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L321)

#### Parameters

##### options

###### cursor?

`string`

###### limit?

`number`

###### status?

`string`

###### workflowId?

`string`

#### Returns

`Promise`\<\{ `data`: `object`[]; `nextCursor?`: `null` \| `string`; \}\>

***

### getQueueStats()

> **getQueueStats**(): `object`

Defined in: [src/services/N8nApiClient.ts:407](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L407)

#### Returns

`object`

##### active

> **active**: `number`

##### paused

> **paused**: `boolean`

##### pending

> **pending**: `number`

***

### getWorkflow()

> **getWorkflow**(`id`): `Promise`\<\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:288](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L288)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}\>

***

### getWorkflows()

> **getWorkflows**(`options`): `Promise`\<\{ `data`: `object`[]; `nextCursor?`: `null` \| `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:277](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L277)

#### Parameters

##### options

###### active?

`boolean`

###### cursor?

`string`

###### limit?

`number`

###### tags?

`string`[]

#### Returns

`Promise`\<\{ `data`: `object`[]; `nextCursor?`: `null` \| `string`; \}\>

***

### invalidateCache()

> **invalidateCache**(`pattern?`): `Promise`\<`number`\>

Defined in: [src/services/N8nApiClient.ts:437](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L437)

#### Parameters

##### pattern?

`string`

#### Returns

`Promise`\<`number`\>

***

### pauseQueue()

> **pauseQueue**(): `void`

Defined in: [src/services/N8nApiClient.ts:419](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L419)

#### Returns

`void`

***

### resumeQueue()

> **resumeQueue**(): `void`

Defined in: [src/services/N8nApiClient.ts:423](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L423)

#### Returns

`void`

***

### stopExecution()

> **stopExecution**(`id`): `Promise`\<\{ `data?`: \{ `executionData?`: \{ `contextData`: `Record`\<`string`, `unknown`\>; `executionTime?`: `number`; `nodeExecutionStack`: `unknown`[]; `waitingExecution?`: `Record`\<`string`, `unknown`\>; `waitingExecutionSource?`: `Record`\<`string`, `unknown`\>; \}; `resultData?`: \{ `lastNodeExecuted?`: `string`; `runData`: `Record`\<`string`, `unknown`\>; \}; `startData?`: `Record`\<`string`, `unknown`\>; \}; `finished`: `boolean`; `id`: `string`; `mode`: `"retry"` \| `"manual"` \| `"trigger"` \| `"webhook"` \| `"integrated"` \| `"cli"`; `retryOf?`: `null` \| `string`; `retrySuccessId?`: `null` \| `string`; `startedAt`: `string`; `status`: `"success"` \| `"error"` \| `"unknown"` \| `"canceled"` \| `"crashed"` \| `"new"` \| `"running"` \| `"waiting"`; `stoppedAt?`: `null` \| `string`; `workflowData?`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:345](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L345)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `data?`: \{ `executionData?`: \{ `contextData`: `Record`\<`string`, `unknown`\>; `executionTime?`: `number`; `nodeExecutionStack`: `unknown`[]; `waitingExecution?`: `Record`\<`string`, `unknown`\>; `waitingExecutionSource?`: `Record`\<`string`, `unknown`\>; \}; `resultData?`: \{ `lastNodeExecuted?`: `string`; `runData`: `Record`\<`string`, `unknown`\>; \}; `startData?`: `Record`\<`string`, `unknown`\>; \}; `finished`: `boolean`; `id`: `string`; `mode`: `"retry"` \| `"manual"` \| `"trigger"` \| `"webhook"` \| `"integrated"` \| `"cli"`; `retryOf?`: `null` \| `string`; `retrySuccessId?`: `null` \| `string`; `startedAt`: `string`; `status`: `"success"` \| `"error"` \| `"unknown"` \| `"canceled"` \| `"crashed"` \| `"new"` \| `"running"` \| `"waiting"`; `stoppedAt?`: `null` \| `string`; `workflowData?`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

***

### testConnection()

> **testConnection**(): `Promise`\<\{ `connected`: `boolean`; `version?`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:260](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L260)

#### Returns

`Promise`\<\{ `connected`: `boolean`; `version?`: `string`; \}\>

***

### testCredential()

> **testCredential**(`id`): `Promise`\<\{ `error?`: `string`; `success`: `boolean`; \}\>

Defined in: [src/services/N8nApiClient.ts:386](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L386)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `error?`: `string`; `success`: `boolean`; \}\>

***

### triggerWorkflow()

> **triggerWorkflow**(`workflowId`, `data?`): `Promise`\<\{ `data?`: \{ `executionData?`: \{ `contextData`: `Record`\<`string`, `unknown`\>; `executionTime?`: `number`; `nodeExecutionStack`: `unknown`[]; `waitingExecution?`: `Record`\<`string`, `unknown`\>; `waitingExecutionSource?`: `Record`\<`string`, `unknown`\>; \}; `resultData?`: \{ `lastNodeExecuted?`: `string`; `runData`: `Record`\<`string`, `unknown`\>; \}; `startData?`: `Record`\<`string`, `unknown`\>; \}; `finished`: `boolean`; `id`: `string`; `mode`: `"retry"` \| `"manual"` \| `"trigger"` \| `"webhook"` \| `"integrated"` \| `"cli"`; `retryOf?`: `null` \| `string`; `retrySuccessId?`: `null` \| `string`; `startedAt`: `string`; `status`: `"success"` \| `"error"` \| `"unknown"` \| `"canceled"` \| `"crashed"` \| `"new"` \| `"running"` \| `"waiting"`; `stoppedAt?`: `null` \| `string`; `workflowData?`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:336](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L336)

#### Parameters

##### workflowId

`string`

##### data?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<\{ `data?`: \{ `executionData?`: \{ `contextData`: `Record`\<`string`, `unknown`\>; `executionTime?`: `number`; `nodeExecutionStack`: `unknown`[]; `waitingExecution?`: `Record`\<`string`, `unknown`\>; `waitingExecutionSource?`: `Record`\<`string`, `unknown`\>; \}; `resultData?`: \{ `lastNodeExecuted?`: `string`; `runData`: `Record`\<`string`, `unknown`\>; \}; `startData?`: `Record`\<`string`, `unknown`\>; \}; `finished`: `boolean`; `id`: `string`; `mode`: `"retry"` \| `"manual"` \| `"trigger"` \| `"webhook"` \| `"integrated"` \| `"cli"`; `retryOf?`: `null` \| `string`; `retrySuccessId?`: `null` \| `string`; `startedAt`: `string`; `status`: `"success"` \| `"error"` \| `"unknown"` \| `"canceled"` \| `"crashed"` \| `"new"` \| `"running"` \| `"waiting"`; `stoppedAt?`: `null` \| `string`; `workflowData?`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

***

### updateCredential()

> **updateCredential**(`id`, `credential`): `Promise`\<\{ `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodesAccess?`: `object`[]; `type`: `string`; `updatedAt`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:373](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L373)

#### Parameters

##### id

`string`

##### credential

`Partial`\<[`Credential`](../../../types/n8n.types/type-aliases/Credential.md)\>

#### Returns

`Promise`\<\{ `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodesAccess?`: `object`[]; `type`: `string`; `updatedAt`: `string`; \}\>

***

### updateWorkflow()

> **updateWorkflow**(`id`, `workflow`): `Promise`\<\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}\>

Defined in: [src/services/N8nApiClient.ts:298](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/N8nApiClient.ts#L298)

#### Parameters

##### id

`string`

##### workflow

`Partial`\<[`Workflow`](../../../types/n8n.types/type-aliases/Workflow.md)\>

#### Returns

`Promise`\<\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}\>
