[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [utils/Logger](../README.md) / Logger

# Class: Logger

Defined in: [src/utils/Logger.ts:10](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/Logger.ts#L10)

## Constructors

### Constructor

> **new Logger**(`name`): `Logger`

Defined in: [src/utils/Logger.ts:16](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/Logger.ts#L16)

#### Parameters

##### name

`string`

#### Returns

`Logger`

## Methods

### debug()

> **debug**(`message`, `context?`): `void`

Defined in: [src/utils/Logger.ts:70](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/Logger.ts#L70)

#### Parameters

##### message

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### error()

> **error**(`message`, `context?`): `void`

Defined in: [src/utils/Logger.ts:82](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/Logger.ts#L82)

#### Parameters

##### message

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### info()

> **info**(`message`, `context?`): `void`

Defined in: [src/utils/Logger.ts:74](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/Logger.ts#L74)

#### Parameters

##### message

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### warn()

> **warn**(`message`, `context?`): `void`

Defined in: [src/utils/Logger.ts:78](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/Logger.ts#L78)

#### Parameters

##### message

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### clearLogs()

> `static` **clearLogs**(): `void`

Defined in: [src/utils/Logger.ts:28](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/Logger.ts#L28)

#### Returns

`void`

***

### getLogs()

> `static` **getLogs**(): [`ILogEntry`](../interfaces/ILogEntry.md)[]

Defined in: [src/utils/Logger.ts:24](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/Logger.ts#L24)

#### Returns

[`ILogEntry`](../interfaces/ILogEntry.md)[]

***

### setLogLevel()

> `static` **setLogLevel**(`level`): `void`

Defined in: [src/utils/Logger.ts:20](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/Logger.ts#L20)

#### Parameters

##### level

[`LogLevel`](../type-aliases/LogLevel.md)

#### Returns

`void`
