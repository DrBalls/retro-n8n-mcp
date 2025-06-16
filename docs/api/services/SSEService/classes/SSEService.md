[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/SSEService](../README.md) / SSEService

# Class: SSEService

Defined in: [src/services/SSEService.ts:20](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/SSEService.ts#L20)

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new SSEService**(`options`): `SSEService`

Defined in: [src/services/SSEService.ts:32](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/SSEService.ts#L32)

#### Parameters

##### options

[`ISSEOptions`](../interfaces/ISSEOptions.md)

#### Returns

`SSEService`

#### Overrides

`EventEmitter.constructor`

## Accessors

### activeSubscriptions

#### Get Signature

> **get** **activeSubscriptions**(): `string`[]

Defined in: [src/services/SSEService.ts:128](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/SSEService.ts#L128)

Get current subscriptions

##### Returns

`string`[]

***

### isConnected

#### Get Signature

> **get** **isConnected**(): `boolean`

Defined in: [src/services/SSEService.ts:121](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/SSEService.ts#L121)

Get connection state

##### Returns

`boolean`

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [src/services/SSEService.ts:46](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/SSEService.ts#L46)

Connect to SSE endpoint

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `void`

Defined in: [src/services/SSEService.ts:70](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/SSEService.ts#L70)

Disconnect from SSE endpoint

#### Returns

`void`

***

### subscribe()

> **subscribe**(`topic`): `void`

Defined in: [src/services/SSEService.ts:85](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/SSEService.ts#L85)

Subscribe to a topic (managed client-side for SSE)

#### Parameters

##### topic

`string`

#### Returns

`void`

***

### unsubscribe()

> **unsubscribe**(`topic`): `void`

Defined in: [src/services/SSEService.ts:103](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/SSEService.ts#L103)

Unsubscribe from a topic

#### Parameters

##### topic

`string`

#### Returns

`void`
