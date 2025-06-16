[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/BatchOperationManager](../README.md) / BatchOperationManager

# Class: BatchOperationManager

Defined in: [src/services/BatchOperationManager.ts:17](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/BatchOperationManager.ts#L17)

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new BatchOperationManager**(`apiClient`): `BatchOperationManager`

Defined in: [src/services/BatchOperationManager.ts:24](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/BatchOperationManager.ts#L24)

#### Parameters

##### apiClient

[`N8nApiClient`](../../N8nApiClient/classes/N8nApiClient.md)

#### Returns

`BatchOperationManager`

#### Overrides

`EventEmitter.constructor`

## Methods

### cancelOperation()

> **cancelOperation**(`operationId`): `Promise`\<`boolean`\>

Defined in: [src/services/BatchOperationManager.ts:82](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/BatchOperationManager.ts#L82)

Cancel a batch operation

#### Parameters

##### operationId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### cleanupOldOperations()

> **cleanupOldOperations**(`olderThanMs`): `number`

Defined in: [src/services/BatchOperationManager.ts:519](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/BatchOperationManager.ts#L519)

Clean up completed operations older than specified time

#### Parameters

##### olderThanMs

`number` = `3600000`

#### Returns

`number`

***

### createBatchOperation()

> **createBatchOperation**\<`T`\>(`type`, `items`, `options`): `Promise`\<`string`\>

Defined in: [src/services/BatchOperationManager.ts:32](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/BatchOperationManager.ts#L32)

Create a new batch operation

#### Type Parameters

##### T

`T`

#### Parameters

##### type

[`BatchOperationType`](../../../types/batch.types/type-aliases/BatchOperationType.md)

##### items

`T`[]

##### options

[`IBatchOperationOptions`](../../../types/batch.types/interfaces/IBatchOperationOptions.md) = `{}`

#### Returns

`Promise`\<`string`\>

***

### getActiveOperations()

> **getActiveOperations**(): [`IBatchOperation`](../../../types/batch.types/interfaces/IBatchOperation.md)\<`any`\>[]

Defined in: [src/services/BatchOperationManager.ts:511](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/BatchOperationManager.ts#L511)

Get all active operations

#### Returns

[`IBatchOperation`](../../../types/batch.types/interfaces/IBatchOperation.md)\<`any`\>[]

***

### getOperationStatus()

> **getOperationStatus**(`operationId`): `null` \| [`IBatchOperation`](../../../types/batch.types/interfaces/IBatchOperation.md)\<`any`\>

Defined in: [src/services/BatchOperationManager.ts:75](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/BatchOperationManager.ts#L75)

Get batch operation status

#### Parameters

##### operationId

`string`

#### Returns

`null` \| [`IBatchOperation`](../../../types/batch.types/interfaces/IBatchOperation.md)\<`any`\>
