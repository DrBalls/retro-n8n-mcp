[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [tools/ToolRegistry](../README.md) / ToolRegistry

# Class: ToolRegistry

Defined in: [src/tools/ToolRegistry.ts:50](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L50)

Registry for managing MCP tools

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new ToolRegistry**(`context`): `ToolRegistry`

Defined in: [src/tools/ToolRegistry.ts:57](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L57)

#### Parameters

##### context

[`IToolContext`](../../base/Tool/interfaces/IToolContext.md) = `{}`

#### Returns

`ToolRegistry`

#### Overrides

`EventEmitter.constructor`

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/tools/ToolRegistry.ts:328](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L328)

Clear all tools

#### Returns

`void`

***

### execute()

> **execute**(`toolName`, `params`, `context?`): `Promise`\<`any`\>

Defined in: [src/tools/ToolRegistry.ts:214](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L214)

Execute a tool

#### Parameters

##### toolName

`string`

##### params

`unknown`

##### context?

`Partial`\<[`IToolContext`](../../base/Tool/interfaces/IToolContext.md)\>

#### Returns

`Promise`\<`any`\>

***

### get()

> **get**(`toolName`): `undefined` \| [`ITool`](../../base/Tool/interfaces/ITool.md)

Defined in: [src/tools/ToolRegistry.ts:153](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L153)

Get a tool by name

#### Parameters

##### toolName

`string`

#### Returns

`undefined` \| [`ITool`](../../base/Tool/interfaces/ITool.md)

***

### getAll()

> **getAll**(): [`ITool`](../../base/Tool/interfaces/ITool.md)[]

Defined in: [src/tools/ToolRegistry.ts:167](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L167)

Get all registered tools

#### Returns

[`ITool`](../../base/Tool/interfaces/ITool.md)[]

***

### getAllStats()

> **getAllStats**(): `Map`\<`string`, `IToolStats`\>

Defined in: [src/tools/ToolRegistry.ts:276](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L276)

Get all tool statistics

#### Returns

`Map`\<`string`, `IToolStats`\>

***

### getByCategory()

> **getByCategory**(`category`): [`ITool`](../../base/Tool/interfaces/ITool.md)[]

Defined in: [src/tools/ToolRegistry.ts:181](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L181)

Get tools by category

#### Parameters

##### category

`string`

#### Returns

[`ITool`](../../base/Tool/interfaces/ITool.md)[]

***

### getByTag()

> **getByTag**(`tag`): [`ITool`](../../base/Tool/interfaces/ITool.md)[]

Defined in: [src/tools/ToolRegistry.ts:191](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L191)

Get tools by tag

#### Parameters

##### tag

`string`

#### Returns

[`ITool`](../../base/Tool/interfaces/ITool.md)[]

***

### getContext()

> **getContext**(): [`IToolContext`](../../base/Tool/interfaces/IToolContext.md)

Defined in: [src/tools/ToolRegistry.ts:321](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L321)

Get the current context

#### Returns

[`IToolContext`](../../base/Tool/interfaces/IToolContext.md)

***

### getNames()

> **getNames**(): `string`[]

Defined in: [src/tools/ToolRegistry.ts:174](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L174)

Get all tool names

#### Returns

`string`[]

***

### getStats()

> **getStats**(`toolName`): `undefined` \| `IToolStats`

Defined in: [src/tools/ToolRegistry.ts:269](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L269)

Get tool statistics

#### Parameters

##### toolName

`string`

#### Returns

`undefined` \| `IToolStats`

***

### has()

> **has**(`toolName`): `boolean`

Defined in: [src/tools/ToolRegistry.ts:160](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L160)

Check if a tool exists

#### Parameters

##### toolName

`string`

#### Returns

`boolean`

***

### register()

> **register**(`tool`, `options`): `void`

Defined in: [src/tools/ToolRegistry.ts:65](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L65)

Register a tool

#### Parameters

##### tool

[`ITool`](../../base/Tool/interfaces/ITool.md)

##### options

[`IToolRegistrationOptions`](../interfaces/IToolRegistrationOptions.md) = `{}`

#### Returns

`void`

***

### registerMany()

> **registerMany**(`tools`): `void`

Defined in: [src/tools/ToolRegistry.ts:109](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L109)

Register multiple tools at once

#### Parameters

##### tools

`object`[]

#### Returns

`void`

***

### search()

> **search**(`query`): [`ITool`](../../base/Tool/interfaces/ITool.md)[]

Defined in: [src/tools/ToolRegistry.ts:201](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L201)

Search tools by name or description

#### Parameters

##### query

`string`

#### Returns

[`ITool`](../../base/Tool/interfaces/ITool.md)[]

***

### toMcpTools()

> **toMcpTools**(): `object`[]

Defined in: [src/tools/ToolRegistry.ts:283](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L283)

Convert all tools to MCP format

#### Returns

`object`[]

***

### unregister()

> **unregister**(`toolName`): `boolean`

Defined in: [src/tools/ToolRegistry.ts:125](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L125)

Unregister a tool

#### Parameters

##### toolName

`string`

#### Returns

`boolean`

***

### updateContext()

> **updateContext**(`context`): `void`

Defined in: [src/tools/ToolRegistry.ts:314](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L314)

Update the global context

#### Parameters

##### context

`Partial`\<[`IToolContext`](../../base/Tool/interfaces/IToolContext.md)\>

#### Returns

`void`
