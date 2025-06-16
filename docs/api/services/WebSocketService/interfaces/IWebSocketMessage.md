[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/WebSocketService](../README.md) / IWebSocketMessage

# Interface: IWebSocketMessage

Defined in: [src/services/WebSocketService.ts:5](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L5)

## Properties

### data?

> `optional` **data**: `any`

Defined in: [src/services/WebSocketService.ts:8](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L8)

***

### error?

> `optional` **error**: `string`

Defined in: [src/services/WebSocketService.ts:9](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L9)

***

### timestamp

> **timestamp**: `string`

Defined in: [src/services/WebSocketService.ts:10](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L10)

***

### topic?

> `optional` **topic**: `string`

Defined in: [src/services/WebSocketService.ts:7](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L7)

***

### type

> **type**: `"subscribe"` \| `"error"` \| `"update"` \| `"unsubscribe"` \| `"ping"` \| `"pong"`

Defined in: [src/services/WebSocketService.ts:6](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/WebSocketService.ts#L6)
