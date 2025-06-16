[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [services/cache/CacheKeyBuilder](../README.md) / CacheKeyBuilder

# Class: CacheKeyBuilder

Defined in: [src/services/cache/CacheKeyBuilder.ts:6](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L6)

Utility class for building consistent cache keys across the application

## Implements

- [`ICacheKeyBuilder`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md)

## Constructors

### Constructor

> **new CacheKeyBuilder**(`prefix`): `CacheKeyBuilder`

Defined in: [src/services/cache/CacheKeyBuilder.ts:9](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L9)

#### Parameters

##### prefix

`string` = `'n8n-mcp'`

#### Returns

`CacheKeyBuilder`

## Methods

### batchOperation()

> **batchOperation**(`operationId`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:187](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L187)

Build cache key for batch operation status

#### Parameters

##### operationId

`string`

#### Returns

`string`

***

### branch()

> **branch**(`workflowId`, `branchName`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:153](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L153)

Build cache key for branch data

#### Parameters

##### workflowId

`string`

##### branchName

`string`

#### Returns

`string`

***

### connectionStatus()

> **connectionStatus**(): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:139](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L139)

Build cache key for API connection status

#### Returns

`string`

***

### credential()

> **credential**(`id`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:30](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L30)

Build cache key for credential data

#### Parameters

##### id

`string`

#### Returns

`string`

#### Implementation of

[`ICacheKeyBuilder`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md).[`credential`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md#credential)

***

### credentialList()

> **credentialList**(`type?`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:115](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L115)

Build cache key for credential list

#### Parameters

##### type?

`string`

#### Returns

`string`

***

### custom()

> **custom**(`namespace`, `key`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:58](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L58)

Build custom cache key with namespace

#### Parameters

##### namespace

`string`

##### key

`string`

#### Returns

`string`

#### Implementation of

[`ICacheKeyBuilder`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md).[`custom`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md#custom)

***

### debugSession()

> **debugSession**(`sessionId`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:180](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L180)

Build cache key for debug session data

#### Parameters

##### sessionId

`string`

#### Returns

`string`

***

### execution()

> **execution**(`id`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:23](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L23)

Build cache key for execution data

#### Parameters

##### id

`string`

#### Returns

`string`

#### Implementation of

[`ICacheKeyBuilder`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md).[`execution`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md#execution)

***

### executionList()

> **executionList**(`workflowId?`, `filters?`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:90](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L90)

Build cache key for execution list with filters

#### Parameters

##### workflowId?

`string`

##### filters?

###### limit?

`number`

###### offset?

`number`

###### status?

`string`

#### Returns

`string`

***

### generateTags()

> **generateTags**(`key`): `string`[]

Defined in: [src/services/cache/CacheKeyBuilder.ts:225](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L225)

Generate invalidation tags for a key

#### Parameters

##### key

`string`

#### Returns

`string`[]

***

### getCredentialInvalidationPatterns()

> **getCredentialInvalidationPatterns**(`credentialId`, `type?`): `string`[]

Defined in: [src/services/cache/CacheKeyBuilder.ts:309](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L309)

Get all possible invalidation patterns for a credential

#### Parameters

##### credentialId

`string`

##### type?

`string`

#### Returns

`string`[]

***

### getExecutionInvalidationPatterns()

> **getExecutionInvalidationPatterns**(`executionId`, `workflowId?`): `string`[]

Defined in: [src/services/cache/CacheKeyBuilder.ts:290](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L290)

Get all possible invalidation patterns for an execution

#### Parameters

##### executionId

`string`

##### workflowId?

`string`

#### Returns

`string`[]

***

### getWorkflowInvalidationPatterns()

> **getWorkflowInvalidationPatterns**(`workflowId`): `string`[]

Defined in: [src/services/cache/CacheKeyBuilder.ts:275](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L275)

Get all possible invalidation patterns for a workflow

#### Parameters

##### workflowId

`string`

#### Returns

`string`[]

***

### matchesPattern()

> **matchesPattern**(`key`, `pattern`): `boolean`

Defined in: [src/services/cache/CacheKeyBuilder.ts:211](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L211)

Check if a key matches a pattern

#### Parameters

##### key

`string`

##### pattern

`string`

#### Returns

`boolean`

***

### metrics()

> **metrics**(`type`, `timeframe`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:51](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L51)

Build cache key for metrics data

#### Parameters

##### type

`string`

##### timeframe

`string`

#### Returns

`string`

#### Implementation of

[`ICacheKeyBuilder`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md).[`metrics`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md#metrics)

***

### monitoring()

> **monitoring**(`type`, `id?`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:170](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L170)

Build cache key for monitoring data

#### Parameters

##### type

`string`

##### id?

`string`

#### Returns

`string`

***

### node()

> **node**(`type`, `version`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:37](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L37)

Build cache key for node definition data

#### Parameters

##### type

`string`

##### version

`number`

#### Returns

`string`

#### Implementation of

[`ICacheKeyBuilder`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md).[`node`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md#node)

***

### parseKey()

> **parseKey**(`key`): `object`

Defined in: [src/services/cache/CacheKeyBuilder.ts:194](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L194)

Extract components from a cache key

#### Parameters

##### key

`string`

#### Returns

`object`

##### components

> **components**: `string`[]

##### id?

> `optional` **id**: `string`

##### namespace?

> `optional` **namespace**: `string`

##### prefix

> **prefix**: `string`

***

### serverHealth()

> **serverHealth**(): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:132](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L132)

Build cache key for server health data

#### Returns

`string`

***

### user()

> **user**(`id`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:44](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L44)

Build cache key for user data

#### Parameters

##### id

`string`

#### Returns

`string`

#### Implementation of

[`ICacheKeyBuilder`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md).[`user`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md#user)

***

### version()

> **version**(`workflowId`, `versionId`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:146](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L146)

Build cache key for version control data

#### Parameters

##### workflowId

`string`

##### versionId

`string`

#### Returns

`string`

***

### versionHistory()

> **versionHistory**(`workflowId`, `branchName?`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:160](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L160)

Build cache key for version history

#### Parameters

##### workflowId

`string`

##### branchName?

`string`

#### Returns

`string`

***

### workflow()

> **workflow**(`id`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:16](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L16)

Build cache key for workflow data

#### Parameters

##### id

`string`

#### Returns

`string`

#### Implementation of

[`ICacheKeyBuilder`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md).[`workflow`](../../../../types/cache.types/interfaces/ICacheKeyBuilder.md#workflow)

***

### workflowList()

> **workflowList**(`filters?`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:65](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L65)

Build cache key for workflow list with filters

#### Parameters

##### filters?

###### active?

`boolean`

###### limit?

`number`

###### offset?

`number`

###### tags?

`string`[]

#### Returns

`string`

***

### workflowStats()

> **workflowStats**(`workflowId`, `timeframe`): `string`

Defined in: [src/services/cache/CacheKeyBuilder.ts:125](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/cache/CacheKeyBuilder.ts#L125)

Build cache key for workflow execution statistics

#### Parameters

##### workflowId

`string`

##### timeframe

`string` = `'24h'`

#### Returns

`string`
