[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [utils/errors](../README.md) / N8nApiError

# Class: N8nApiError

Defined in: [src/utils/errors.ts:1](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/errors.ts#L1)

## Extends

- `Error`

## Constructors

### Constructor

> **new N8nApiError**(`message`, `statusCode?`, `code?`, `hint?`, `description?`, `response?`): `N8nApiError`

Defined in: [src/utils/errors.ts:2](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/errors.ts#L2)

#### Parameters

##### message

`string`

##### statusCode?

`number`

##### code?

`string`

##### hint?

`string`

##### description?

`string`

##### response?

`unknown`

#### Returns

`N8nApiError`

#### Overrides

`Error.constructor`

## Properties

### code?

> `optional` **code**: `string`

Defined in: [src/utils/errors.ts:5](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/errors.ts#L5)

***

### description?

> `optional` **description**: `string`

Defined in: [src/utils/errors.ts:7](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/errors.ts#L7)

***

### hint?

> `optional` **hint**: `string`

Defined in: [src/utils/errors.ts:6](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/errors.ts#L6)

***

### response?

> `optional` **response**: `unknown`

Defined in: [src/utils/errors.ts:8](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/errors.ts#L8)

***

### statusCode?

> `optional` **statusCode**: `number`

Defined in: [src/utils/errors.ts:4](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/errors.ts#L4)
