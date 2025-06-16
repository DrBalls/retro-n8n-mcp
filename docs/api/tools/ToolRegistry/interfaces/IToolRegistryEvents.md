[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [tools/ToolRegistry](../README.md) / IToolRegistryEvents

# Interface: IToolRegistryEvents

Defined in: [src/tools/ToolRegistry.ts:28](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L28)

Tool registry events

## Properties

### tool:error()

> **tool:error**: (`toolName`, `error`) => `void`

Defined in: [src/tools/ToolRegistry.ts:32](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L32)

#### Parameters

##### toolName

`string`

##### error

`Error`

#### Returns

`void`

***

### tool:executed()

> **tool:executed**: (`toolName`, `duration`) => `void`

Defined in: [src/tools/ToolRegistry.ts:31](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L31)

#### Parameters

##### toolName

`string`

##### duration

`number`

#### Returns

`void`

***

### tool:registered()

> **tool:registered**: (`tool`) => `void`

Defined in: [src/tools/ToolRegistry.ts:29](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L29)

#### Parameters

##### tool

[`ITool`](../../base/Tool/interfaces/ITool.md)

#### Returns

`void`

***

### tool:unregistered()

> **tool:unregistered**: (`toolName`) => `void`

Defined in: [src/tools/ToolRegistry.ts:30](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L30)

#### Parameters

##### toolName

`string`

#### Returns

`void`
