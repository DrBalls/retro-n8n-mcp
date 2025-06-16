[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/RealtimeMonitoringService](../README.md) / RealtimeMonitoringService

# Class: RealtimeMonitoringService

Defined in: [src/services/RealtimeMonitoringService.ts:41](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/RealtimeMonitoringService.ts#L41)

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new RealtimeMonitoringService**(`options`): `RealtimeMonitoringService`

Defined in: [src/services/RealtimeMonitoringService.ts:51](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/RealtimeMonitoringService.ts#L51)

#### Parameters

##### options

[`IMonitoringOptions`](../interfaces/IMonitoringOptions.md)

#### Returns

`RealtimeMonitoringService`

#### Overrides

`EventEmitter.constructor`

## Methods

### getStatus()

> **getStatus**(): `object`

Defined in: [src/services/RealtimeMonitoringService.ts:225](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/RealtimeMonitoringService.ts#L225)

Get monitoring status

#### Returns

`object`

##### connected

> **connected**: `boolean`

##### monitoredExecutions

> **monitoredExecutions**: `string`[]

##### monitoredWorkflows

> **monitoredWorkflows**: `string`[]

##### protocol

> **protocol**: [`MonitoringProtocol`](../type-aliases/MonitoringProtocol.md)

***

### getWorkflowMetrics()

> **getWorkflowMetrics**(`workflowId`): `Promise`\<`null` \| [`IWorkflowMetrics`](../interfaces/IWorkflowMetrics.md)\>

Defined in: [src/services/RealtimeMonitoringService.ts:212](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/RealtimeMonitoringService.ts#L212)

Get current metrics for a workflow

#### Parameters

##### workflowId

`string`

#### Returns

`Promise`\<`null` \| [`IWorkflowMetrics`](../interfaces/IWorkflowMetrics.md)\>

***

### monitorExecution()

> **monitorExecution**(`executionId`, `options?`): `Promise`\<`void`\>

Defined in: [src/services/RealtimeMonitoringService.ts:113](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/RealtimeMonitoringService.ts#L113)

Monitor a specific execution

#### Parameters

##### executionId

`string`

##### options?

###### includeProgress?

`boolean`

###### pollingInterval?

`number`

#### Returns

`Promise`\<`void`\>

***

### monitorWorkflowMetrics()

> **monitorWorkflowMetrics**(`workflowId`, `options?`): `Promise`\<`void`\>

Defined in: [src/services/RealtimeMonitoringService.ts:186](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/RealtimeMonitoringService.ts#L186)

Monitor workflow metrics

#### Parameters

##### workflowId

`string`

##### options?

###### includePastExecutions?

`boolean`

###### interval?

`number`

#### Returns

`Promise`\<`void`\>

***

### start()

> **start**(): `Promise`\<`void`\>

Defined in: [src/services/RealtimeMonitoringService.ts:62](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/RealtimeMonitoringService.ts#L62)

Start monitoring

#### Returns

`Promise`\<`void`\>

***

### stop()

> **stop**(): `void`

Defined in: [src/services/RealtimeMonitoringService.ts:91](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/RealtimeMonitoringService.ts#L91)

Stop monitoring

#### Returns

`void`

***

### stopMonitoringExecution()

> **stopMonitoringExecution**(`executionId`): `void`

Defined in: [src/services/RealtimeMonitoringService.ts:154](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/RealtimeMonitoringService.ts#L154)

Stop monitoring an execution

#### Parameters

##### executionId

`string`

#### Returns

`void`
