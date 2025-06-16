[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [security/RateLimiter](../README.md) / RateLimiter

# Class: RateLimiter

Defined in: [src/security/RateLimiter.ts:25](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L25)

## Constructors

### Constructor

> **new RateLimiter**(): `RateLimiter`

Defined in: [src/security/RateLimiter.ts:31](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L31)

#### Returns

`RateLimiter`

## Methods

### checkLimit()

> **checkLimit**(`name`, `key`, `options?`): [`IRateLimitResult`](../interfaces/IRateLimitResult.md)

Defined in: [src/security/RateLimiter.ts:53](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L53)

Check if a request is allowed

#### Parameters

##### name

`string`

##### key

`string`

##### options?

###### cost?

`number`

###### isSuccess?

`boolean`

#### Returns

[`IRateLimitResult`](../interfaces/IRateLimitResult.md)

***

### createCombinedLimiter()

> **createCombinedLimiter**(`limitNames`): (`key`, `options?`) => [`IRateLimitResult`](../interfaces/IRateLimitResult.md)

Defined in: [src/security/RateLimiter.ts:192](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L192)

Create a combined rate limiter that checks multiple limits

#### Parameters

##### limitNames

`string`[]

#### Returns

> (`key`, `options?`): [`IRateLimitResult`](../interfaces/IRateLimitResult.md)

##### Parameters

###### key

`string`

###### options?

###### cost?

`number`

###### isSuccess?

`boolean`

##### Returns

[`IRateLimitResult`](../interfaces/IRateLimitResult.md)

***

### getStatistics()

> **getStatistics**(): `object`

Defined in: [src/security/RateLimiter.ts:258](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L258)

Get statistics for rate limiting

#### Returns

`object`

##### limits

> **limits**: `object`[]

***

### getUsage()

> **getUsage**(`name`, `key`): `null` \| \{ `count`: `number`; `limit`: `number`; `remaining`: `number`; `resetAt`: `Date`; \}

Defined in: [src/security/RateLimiter.ts:146](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L146)

Get current usage for a key

#### Parameters

##### name

`string`

##### key

`string`

#### Returns

`null` \| \{ `count`: `number`; `limit`: `number`; `remaining`: `number`; `resetAt`: `Date`; \}

***

### middleware()

> **middleware**(`limitName`, `keyExtractor`): (`req`, `res`, `next`) => `void`

Defined in: [src/security/RateLimiter.ts:305](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L305)

Express middleware factory

#### Parameters

##### limitName

`string`

##### keyExtractor

(`req`) => `string`

#### Returns

> (`req`, `res`, `next`): `void`

##### Parameters

###### req

`any`

###### res

`any`

###### next

`any`

##### Returns

`void`

***

### registerLimit()

> **registerLimit**(`name`, `config`): `void`

Defined in: [src/security/RateLimiter.ts:39](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L39)

Register a rate limit configuration

#### Parameters

##### name

`string`

##### config

[`IRateLimitConfig`](../interfaces/IRateLimitConfig.md)

#### Returns

`void`

***

### resetLimit()

> **resetLimit**(`name`, `key`): `void`

Defined in: [src/security/RateLimiter.ts:129](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L129)

Reset rate limit for a key

#### Parameters

##### name

`string`

##### key

`string`

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [src/security/RateLimiter.ts:296](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/RateLimiter.ts#L296)

Stop the cleanup interval

#### Returns

`void`
