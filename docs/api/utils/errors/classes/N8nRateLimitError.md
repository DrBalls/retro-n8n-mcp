[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [utils/errors](../README.md) / N8nRateLimitError

# Class: N8nRateLimitError

Defined in: [src/utils/errors.ts:27](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/errors.ts#L27)

## Extends

- `Error`

## Constructors

### Constructor

> **new N8nRateLimitError**(`message`, `retryAfter?`): `N8nRateLimitError`

Defined in: [src/utils/errors.ts:28](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/errors.ts#L28)

#### Parameters

##### message

`string`

##### retryAfter?

`number`

#### Returns

`N8nRateLimitError`

#### Overrides

`Error.constructor`

## Properties

### retryAfter?

> `optional` **retryAfter**: `number`

Defined in: [src/utils/errors.ts:30](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/errors.ts#L30)
