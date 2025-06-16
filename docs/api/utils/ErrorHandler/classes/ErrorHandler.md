[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [utils/ErrorHandler](../README.md) / ErrorHandler

# Class: ErrorHandler

Defined in: [src/utils/ErrorHandler.ts:30](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L30)

## Constructors

### Constructor

> **new ErrorHandler**(): `ErrorHandler`

#### Returns

`ErrorHandler`

## Methods

### clearErrorTracking()

> `static` **clearErrorTracking**(): `void`

Defined in: [src/utils/ErrorHandler.ts:233](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L233)

Clear error tracking (useful for testing)

#### Returns

`void`

***

### createContextualError()

> `static` **createContextualError**(`error`, `context`): `Error`

Defined in: [src/utils/ErrorHandler.ts:241](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L241)

Create a contextual error with additional information

#### Parameters

##### error

`unknown`

##### context

[`IErrorContext`](../interfaces/IErrorContext.md)

#### Returns

`Error`

***

### getErrorStats()

> `static` **getErrorStats**(): `Record`\<`string`, `unknown`\>

Defined in: [src/utils/ErrorHandler.ts:217](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L217)

Get error statistics

#### Returns

`Record`\<`string`, `unknown`\>

***

### handle()

> `static` **handle**(`error`, `context`): `Promise`\<[`IErrorRecoveryStrategy`](../interfaces/IErrorRecoveryStrategy.md)\>

Defined in: [src/utils/ErrorHandler.ts:38](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L38)

Handle an error with context and recovery strategies

#### Parameters

##### error

`unknown`

##### context

[`IErrorContext`](../interfaces/IErrorContext.md) = `{}`

#### Returns

`Promise`\<[`IErrorRecoveryStrategy`](../interfaces/IErrorRecoveryStrategy.md)\>

***

### retry()

> `static` **retry**\<`T`\>(`operation`, `context`, `maxAttempts`): `Promise`\<`T`\>

Defined in: [src/utils/ErrorHandler.ts:276](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorHandler.ts#L276)

Retry an operation with exponential backoff

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `Promise`\<`T`\>

##### context

[`IErrorContext`](../interfaces/IErrorContext.md) = `{}`

##### maxAttempts

`number` = `3`

#### Returns

`Promise`\<`T`\>
