[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [utils/ErrorHandler](../README.md) / IErrorRecoveryStrategy

# Interface: IErrorRecoveryStrategy

Defined in: [src/utils/ErrorHandler.ts:22](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L22)

## Properties

### alternativeAction()?

> `optional` **alternativeAction**: () => `Promise`\<`unknown`\>

Defined in: [src/utils/ErrorHandler.ts:25](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L25)

#### Returns

`Promise`\<`unknown`\>

***

### developerMessage

> **developerMessage**: `string`

Defined in: [src/utils/ErrorHandler.ts:27](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L27)

***

### retryDelay?

> `optional` **retryDelay**: `number`

Defined in: [src/utils/ErrorHandler.ts:24](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L24)

***

### shouldRetry

> **shouldRetry**: `boolean`

Defined in: [src/utils/ErrorHandler.ts:23](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L23)

***

### userMessage

> **userMessage**: `string`

Defined in: [src/utils/ErrorHandler.ts:26](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L26)
