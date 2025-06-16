[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [server/N8nMcpServer](../README.md) / N8nMcpServer

# Class: N8nMcpServer

Defined in: [src/server/N8nMcpServer.ts:64](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L64)

## Constructors

### Constructor

> **new N8nMcpServer**(`config?`): `N8nMcpServer`

Defined in: [src/server/N8nMcpServer.ts:77](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L77)

#### Parameters

##### config?

[`IN8nMcpServerConfig`](../interfaces/IN8nMcpServerConfig.md) | `Partial`\<\{ `apiKey`: `string`; `baseUrl`: `string`; `cache`: \{ `enabled`: `boolean`; `maxSize`: `number`; `ttl`: `number`; \}; `headers?`: `Record`\<`string`, `string`\>; `rateLimit`: \{ `maxConcurrentRequests`: `number`; `maxRequestsPerSecond`: `number`; \}; `retry`: \{ `backoffMultiplier`: `number`; `initialDelay`: `number`; `maxDelay`: `number`; `maxRetries`: `number`; \}; `timeout`: `number`; \}\>

#### Returns

`N8nMcpServer`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/server/N8nMcpServer.ts:585](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L585)

#### Returns

`Promise`\<`void`\>

***

### connect()

> **connect**(`transport`): `Promise`\<`void`\>

Defined in: [src/server/N8nMcpServer.ts:561](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L561)

#### Parameters

##### transport

`any`

#### Returns

`Promise`\<`void`\>

***

### createApiKey()

> **createApiKey**(`name`, `permissions`, `userId?`): [`IApiKey`](../../../security/ApiKeyManager/interfaces/IApiKey.md)

Defined in: [src/server/N8nMcpServer.ts:656](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L656)

#### Parameters

##### name

`string`

##### permissions

`string`[]

##### userId?

`string`

#### Returns

[`IApiKey`](../../../security/ApiKeyManager/interfaces/IApiKey.md)

***

### getSecurity()

> **getSecurity**(): [`SecurityManager`](../../../security/SecurityManager/classes/SecurityManager.md)

Defined in: [src/server/N8nMcpServer.ts:652](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L652)

#### Returns

[`SecurityManager`](../../../security/SecurityManager/classes/SecurityManager.md)

***

### getStats()

> **getStats**(): `object`

Defined in: [src/server/N8nMcpServer.ts:613](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L613)

#### Returns

`object`

##### errorRate

> **errorRate**: `number`

##### security?

> `optional` **security**: `any`

##### totalErrors

> **totalErrors**: `number`

##### totalRequests

> **totalRequests**: `number`

***

### getUptime()

> **getUptime**(): `number`

Defined in: [src/server/N8nMcpServer.ts:609](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L609)

#### Returns

`number`

***

### isHealthy()

> **isHealthy**(): `boolean`

Defined in: [src/server/N8nMcpServer.ts:643](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L643)

#### Returns

`boolean`

***

### revokeApiKey()

> **revokeApiKey**(`id`): `boolean`

Defined in: [src/server/N8nMcpServer.ts:660](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/server/N8nMcpServer.ts#L660)

#### Parameters

##### id

`string`

#### Returns

`boolean`
