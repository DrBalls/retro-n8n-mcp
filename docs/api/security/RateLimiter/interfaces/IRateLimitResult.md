[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [security/RateLimiter](../README.md) / IRateLimitResult

# Interface: IRateLimitResult

Defined in: [src/security/RateLimiter.ts:11](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L11)

## Properties

### allowed

> **allowed**: `boolean`

Defined in: [src/security/RateLimiter.ts:12](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L12)

***

### limit

> **limit**: `number`

Defined in: [src/security/RateLimiter.ts:13](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L13)

***

### remaining

> **remaining**: `number`

Defined in: [src/security/RateLimiter.ts:14](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L14)

***

### resetAt

> **resetAt**: `Date`

Defined in: [src/security/RateLimiter.ts:15](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L15)

***

### retryAfter?

> `optional` **retryAfter**: `number`

Defined in: [src/security/RateLimiter.ts:16](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L16)
