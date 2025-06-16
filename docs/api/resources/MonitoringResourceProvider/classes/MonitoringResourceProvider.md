[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [resources/MonitoringResourceProvider](../README.md) / MonitoringResourceProvider

# Class: MonitoringResourceProvider

Defined in: [src/resources/MonitoringResourceProvider.ts:12](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/resources/MonitoringResourceProvider.ts#L12)

## Implements

- [`IResourceProvider`](../../../types/resources/interfaces/IResourceProvider.md)

## Constructors

### Constructor

> **new MonitoringResourceProvider**(`options`): `MonitoringResourceProvider`

Defined in: [src/resources/MonitoringResourceProvider.ts:22](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/resources/MonitoringResourceProvider.ts#L22)

#### Parameters

##### options

[`IMonitoringResourceOptions`](../interfaces/IMonitoringResourceOptions.md)

#### Returns

`MonitoringResourceProvider`

## Properties

### description

> **description**: `string` = `'Real-time monitoring data for workflows and executions'`

Defined in: [src/resources/MonitoringResourceProvider.ts:14](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/resources/MonitoringResourceProvider.ts#L14)

***

### name

> **name**: `string` = `'monitoring'`

Defined in: [src/resources/MonitoringResourceProvider.ts:13](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/resources/MonitoringResourceProvider.ts#L13)

## Methods

### getMetadata()

> **getMetadata**(): [`IResourceMetadata`](../../../types/resources/interfaces/IResourceMetadata.md)

Defined in: [src/resources/MonitoringResourceProvider.ts:177](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/resources/MonitoringResourceProvider.ts#L177)

Get resource metadata

#### Returns

[`IResourceMetadata`](../../../types/resources/interfaces/IResourceMetadata.md)

***

### listResources()

> **listResources**(): `Promise`\<[`IResource`](../../../types/resources/interfaces/IResource.md)[]\>

Defined in: [src/resources/MonitoringResourceProvider.ts:31](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/resources/MonitoringResourceProvider.ts#L31)

List available monitoring resources

#### Returns

`Promise`\<[`IResource`](../../../types/resources/interfaces/IResource.md)[]\>

#### Implementation of

[`IResourceProvider`](../../../types/resources/interfaces/IResourceProvider.md).[`listResources`](../../../types/resources/interfaces/IResourceProvider.md#listresources)

***

### readResource()

> **readResource**(`uri`): `Promise`\<`string`\>

Defined in: [src/resources/MonitoringResourceProvider.ts:107](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/resources/MonitoringResourceProvider.ts#L107)

Read a monitoring resource

#### Parameters

##### uri

`string`

#### Returns

`Promise`\<`string`\>

#### Implementation of

[`IResourceProvider`](../../../types/resources/interfaces/IResourceProvider.md).[`readResource`](../../../types/resources/interfaces/IResourceProvider.md#readresource)

***

### subscribeToResource()

> **subscribeToResource**(`uri`, `callback`): () => `void`

Defined in: [src/resources/MonitoringResourceProvider.ts:144](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/resources/MonitoringResourceProvider.ts#L144)

Subscribe to resource updates

#### Parameters

##### uri

`string`

##### callback

(`data`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

#### Implementation of

[`IResourceProvider`](../../../types/resources/interfaces/IResourceProvider.md).[`subscribeToResource`](../../../types/resources/interfaces/IResourceProvider.md#subscribetoresource)
