[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [security/SecurityManager](../README.md) / ISecurityConfig

# Interface: ISecurityConfig

Defined in: [src/security/SecurityManager.ts:17](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L17)

## Properties

### apiKeys?

> `optional` **apiKeys**: `object`

Defined in: [src/security/SecurityManager.ts:28](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L28)

#### defaultExpiry?

> `optional` **defaultExpiry**: `number`

#### maxPerUser?

> `optional` **maxPerUser**: `number`

***

### audit?

> `optional` **audit**: `object`

Defined in: [src/security/SecurityManager.ts:24](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L24)

#### enabled

> **enabled**: `boolean`

#### maxEvents?

> `optional` **maxEvents**: `number`

***

### rateLimits?

> `optional` **rateLimits**: `object`

Defined in: [src/security/SecurityManager.ts:18](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L18)

#### global?

> `optional` **global**: [`IRateLimitConfig`](../../RateLimiter/interfaces/IRateLimitConfig.md)

#### perApiKey?

> `optional` **perApiKey**: [`IRateLimitConfig`](../../RateLimiter/interfaces/IRateLimitConfig.md)

#### perTool?

> `optional` **perTool**: [`IRateLimitConfig`](../../RateLimiter/interfaces/IRateLimitConfig.md)

#### perUser?

> `optional` **perUser**: [`IRateLimitConfig`](../../RateLimiter/interfaces/IRateLimitConfig.md)
