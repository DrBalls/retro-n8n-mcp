[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [server/N8nMcpServer](../README.md) / IN8nMcpServerConfig

# Interface: IN8nMcpServerConfig

Defined in: [src/server/N8nMcpServer.ts:52](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L52)

## Properties

### apiConfig?

> `optional` **apiConfig**: `Partial`\<\{ `apiKey`: `string`; `baseUrl`: `string`; `cache`: \{ `enabled`: `boolean`; `maxSize`: `number`; `ttl`: `number`; \}; `headers?`: `Record`\<`string`, `string`\>; `rateLimit`: \{ `maxConcurrentRequests`: `number`; `maxRequestsPerSecond`: `number`; \}; `retry`: \{ `backoffMultiplier`: `number`; `initialDelay`: `number`; `maxDelay`: `number`; `maxRetries`: `number`; \}; `timeout`: `number`; \}\>

Defined in: [src/server/N8nMcpServer.ts:53](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L53)

***

### monitoring?

> `optional` **monitoring**: `object`

Defined in: [src/server/N8nMcpServer.ts:55](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L55)

#### pollingInterval?

> `optional` **pollingInterval**: `number`

#### protocol?

> `optional` **protocol**: `"websocket"` \| `"sse"` \| `"polling"`

#### sseUrl?

> `optional` **sseUrl**: `string`

#### updateInterval?

> `optional` **updateInterval**: `number`

#### wsUrl?

> `optional` **wsUrl**: `string`

***

### security?

> `optional` **security**: [`ISecurityConfig`](../../../security/SecurityManager/interfaces/ISecurityConfig.md)

Defined in: [src/server/N8nMcpServer.ts:54](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L54)
