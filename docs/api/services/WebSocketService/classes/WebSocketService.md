[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/WebSocketService](../README.md) / WebSocketService

# Class: WebSocketService

Defined in: [src/services/WebSocketService.ts:22](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L22)

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new WebSocketService**(`options`): `WebSocketService`

Defined in: [src/services/WebSocketService.ts:33](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L33)

#### Parameters

##### options

[`IWebSocketOptions`](../interfaces/IWebSocketOptions.md)

#### Returns

`WebSocketService`

#### Overrides

`EventEmitter.constructor`

## Accessors

### activeSubscriptions

#### Get Signature

> **get** **activeSubscriptions**(): `string`[]

Defined in: [src/services/WebSocketService.ts:152](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L152)

Get current subscriptions

##### Returns

`string`[]

***

### isConnected

#### Get Signature

> **get** **isConnected**(): `boolean`

Defined in: [src/services/WebSocketService.ts:145](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L145)

Get connection state

##### Returns

`boolean`

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [src/services/WebSocketService.ts:47](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L47)

Connect to WebSocket server

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `void`

Defined in: [src/services/WebSocketService.ts:71](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L71)

Disconnect from WebSocket server

#### Returns

`void`

***

### send()

> **send**(`data`): `void`

Defined in: [src/services/WebSocketService.ts:132](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L132)

Send a message

#### Parameters

##### data

`any`

#### Returns

`void`

***

### subscribe()

> **subscribe**(`topic`): `void`

Defined in: [src/services/WebSocketService.ts:90](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L90)

Subscribe to a topic

#### Parameters

##### topic

`string`

#### Returns

`void`

***

### unsubscribe()

> **unsubscribe**(`topic`): `void`

Defined in: [src/services/WebSocketService.ts:111](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L111)

Unsubscribe from a topic

#### Parameters

##### topic

`string`

#### Returns

`void`
