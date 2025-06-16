[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/DebugSession](../README.md) / IDebugState

# Interface: IDebugState

Defined in: [src/services/DebugSession.ts:22](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L22)

## Properties

### callStack

> **callStack**: `string`[]

Defined in: [src/services/DebugSession.ts:27](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L27)

***

### currentExecutionId?

> `optional` **currentExecutionId**: `string`

Defined in: [src/services/DebugSession.ts:24](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L24)

***

### currentNodeId?

> `optional` **currentNodeId**: `string`

Defined in: [src/services/DebugSession.ts:23](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L23)

***

### isPaused

> **isPaused**: `boolean`

Defined in: [src/services/DebugSession.ts:25](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L25)

***

### stepMode

> **stepMode**: `null` \| `"over"` \| `"into"` \| `"out"`

Defined in: [src/services/DebugSession.ts:26](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L26)

***

### variables

> **variables**: `Map`\<`string`, `unknown`\>

Defined in: [src/services/DebugSession.ts:28](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L28)
