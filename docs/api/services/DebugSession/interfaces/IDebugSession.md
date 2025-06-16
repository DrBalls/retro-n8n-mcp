[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/DebugSession](../README.md) / IDebugSession

# Interface: IDebugSession

Defined in: [src/services/DebugSession.ts:43](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L43)

## Properties

### breakpoints

> **breakpoints**: `Map`\<`string`, [`IBreakpoint`](IBreakpoint.md)\>

Defined in: [src/services/DebugSession.ts:50](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L50)

***

### endTime?

> `optional` **endTime**: `Date`

Defined in: [src/services/DebugSession.ts:48](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L48)

***

### executionId?

> `optional` **executionId**: `string`

Defined in: [src/services/DebugSession.ts:46](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L46)

***

### id

> **id**: `string`

Defined in: [src/services/DebugSession.ts:44](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L44)

***

### isActive

> **isActive**: `boolean`

Defined in: [src/services/DebugSession.ts:53](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L53)

***

### startTime

> **startTime**: `Date`

Defined in: [src/services/DebugSession.ts:47](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L47)

***

### state

> **state**: [`IDebugState`](IDebugState.md)

Defined in: [src/services/DebugSession.ts:49](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L49)

***

### timeline

> **timeline**: [`IExecutionSnapshot`](IExecutionSnapshot.md)[]

Defined in: [src/services/DebugSession.ts:52](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L52)

***

### watchExpressions

> **watchExpressions**: `Map`\<`string`, [`IWatchExpression`](IWatchExpression.md)\>

Defined in: [src/services/DebugSession.ts:51](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L51)

***

### workflowId

> **workflowId**: `string`

Defined in: [src/services/DebugSession.ts:45](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L45)
