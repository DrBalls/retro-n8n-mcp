[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/DebugSession](../README.md) / DebugSession

# Class: DebugSession

Defined in: [src/services/DebugSession.ts:64](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L64)

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new DebugSession**(`options`, `apiClient`): `DebugSession`

Defined in: [src/services/DebugSession.ts:70](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L70)

#### Parameters

##### options

[`IDebugSessionOptions`](../interfaces/IDebugSessionOptions.md)

##### apiClient

[`N8nApiClient`](../../N8nApiClient/classes/N8nApiClient.md)

#### Returns

`DebugSession`

#### Overrides

`EventEmitter.constructor`

## Methods

### addBreakpoint()

> **addBreakpoint**(`breakpoint`): [`IBreakpoint`](../interfaces/IBreakpoint.md)

Defined in: [src/services/DebugSession.ts:138](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L138)

#### Parameters

##### breakpoint

`Omit`\<[`IBreakpoint`](../interfaces/IBreakpoint.md), `"hitCount"`\>

#### Returns

[`IBreakpoint`](../interfaces/IBreakpoint.md)

***

### addTimelineEvent()

> **addTimelineEvent**(`snapshot`): `void`

Defined in: [src/services/DebugSession.ts:356](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L356)

#### Parameters

##### snapshot

[`IExecutionSnapshot`](../interfaces/IExecutionSnapshot.md)

#### Returns

`void`

***

### addWatchExpression()

> **addWatchExpression**(`expression`, `nodeId?`): [`IWatchExpression`](../interfaces/IWatchExpression.md)

Defined in: [src/services/DebugSession.ts:185](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L185)

#### Parameters

##### expression

`string`

##### nodeId?

`string`

#### Returns

[`IWatchExpression`](../interfaces/IWatchExpression.md)

***

### disableBreakpoint()

> **disableBreakpoint**(`breakpointId`): `boolean`

Defined in: [src/services/DebugSession.ts:170](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L170)

#### Parameters

##### breakpointId

`string`

#### Returns

`boolean`

***

### enableBreakpoint()

> **enableBreakpoint**(`breakpointId`): `boolean`

Defined in: [src/services/DebugSession.ts:160](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L160)

#### Parameters

##### breakpointId

`string`

#### Returns

`boolean`

***

### evaluateWatchExpression()

> **evaluateWatchExpression**(`watchId`): `Promise`\<`unknown`\>

Defined in: [src/services/DebugSession.ts:213](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L213)

#### Parameters

##### watchId

`string`

#### Returns

`Promise`\<`unknown`\>

***

### exportSession()

> **exportSession**(): [`IDebugSession`](../interfaces/IDebugSession.md)

Defined in: [src/services/DebugSession.ts:517](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L517)

#### Returns

[`IDebugSession`](../interfaces/IDebugSession.md)

***

### getBreakpoints()

> **getBreakpoints**(): [`IBreakpoint`](../interfaces/IBreakpoint.md)[]

Defined in: [src/services/DebugSession.ts:180](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L180)

#### Returns

[`IBreakpoint`](../interfaces/IBreakpoint.md)[]

***

### getExecutionId()

> **getExecutionId**(): `undefined` \| `string`

Defined in: [src/services/DebugSession.ts:121](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L121)

#### Returns

`undefined` \| `string`

***

### getId()

> **getId**(): `string`

Defined in: [src/services/DebugSession.ts:113](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L113)

#### Returns

`string`

***

### getState()

> **getState**(): [`IDebugState`](../interfaces/IDebugState.md)

Defined in: [src/services/DebugSession.ts:129](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L129)

#### Returns

[`IDebugState`](../interfaces/IDebugState.md)

***

### getTimeline()

> **getTimeline**(): [`IExecutionSnapshot`](../interfaces/IExecutionSnapshot.md)[]

Defined in: [src/services/DebugSession.ts:133](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L133)

#### Returns

[`IExecutionSnapshot`](../interfaces/IExecutionSnapshot.md)[]

***

### getTimelineRange()

> **getTimelineRange**(`startTime?`, `endTime?`): [`IExecutionSnapshot`](../interfaces/IExecutionSnapshot.md)[]

Defined in: [src/services/DebugSession.ts:364](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L364)

#### Parameters

##### startTime?

`Date`

##### endTime?

`Date`

#### Returns

[`IExecutionSnapshot`](../interfaces/IExecutionSnapshot.md)[]

***

### getVariables()

> **getVariables**(`nodeId?`): `Promise`\<`Record`\<`string`, `unknown`\>\>

Defined in: [src/services/DebugSession.ts:342](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L342)

#### Parameters

##### nodeId?

`string`

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

***

### getWatchExpressions()

> **getWatchExpressions**(): [`IWatchExpression`](../interfaces/IWatchExpression.md)[]

Defined in: [src/services/DebugSession.ts:235](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L235)

#### Returns

[`IWatchExpression`](../interfaces/IWatchExpression.md)[]

***

### getWorkflowId()

> **getWorkflowId**(): `string`

Defined in: [src/services/DebugSession.ts:117](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L117)

#### Returns

`string`

***

### inspectVariable()

> **inspectVariable**(`name`, `nodeId?`): `Promise`\<`unknown`\>

Defined in: [src/services/DebugSession.ts:328](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L328)

#### Parameters

##### name

`string`

##### nodeId?

`string`

#### Returns

`Promise`\<`unknown`\>

***

### isActive()

> **isActive**(): `boolean`

Defined in: [src/services/DebugSession.ts:125](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L125)

#### Returns

`boolean`

***

### pause()

> **pause**(): `Promise`\<`void`\>

Defined in: [src/services/DebugSession.ts:263](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L263)

#### Returns

`Promise`\<`void`\>

***

### removeBreakpoint()

> **removeBreakpoint**(`breakpointId`): `boolean`

Defined in: [src/services/DebugSession.ts:150](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L150)

#### Parameters

##### breakpointId

`string`

#### Returns

`boolean`

***

### removeWatchExpression()

> **removeWatchExpression**(`watchId`): `boolean`

Defined in: [src/services/DebugSession.ts:203](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L203)

#### Parameters

##### watchId

`string`

#### Returns

`boolean`

***

### resume()

> **resume**(): `Promise`\<`void`\>

Defined in: [src/services/DebugSession.ts:271](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L271)

#### Returns

`Promise`\<`void`\>

***

### start()

> **start**(`executionId?`): `Promise`\<`void`\>

Defined in: [src/services/DebugSession.ts:240](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L240)

#### Parameters

##### executionId?

`string`

#### Returns

`Promise`\<`void`\>

***

### stepInto()

> **stepInto**(): `Promise`\<`void`\>

Defined in: [src/services/DebugSession.ts:287](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L287)

#### Returns

`Promise`\<`void`\>

***

### stepOut()

> **stepOut**(): `Promise`\<`void`\>

Defined in: [src/services/DebugSession.ts:295](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L295)

#### Returns

`Promise`\<`void`\>

***

### stepOver()

> **stepOver**(): `Promise`\<`void`\>

Defined in: [src/services/DebugSession.ts:279](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L279)

#### Returns

`Promise`\<`void`\>

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [src/services/DebugSession.ts:303](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSession.ts#L303)

#### Returns

`Promise`\<`void`\>
