[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/DebugSessionManager](../README.md) / DebugSessionManager

# Class: DebugSessionManager

Defined in: [src/services/DebugSessionManager.ts:12](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L12)

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new DebugSessionManager**(`apiClient`, `options`): `DebugSessionManager`

Defined in: [src/services/DebugSessionManager.ts:19](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L19)

#### Parameters

##### apiClient

[`N8nApiClient`](../../N8nApiClient/classes/N8nApiClient.md)

##### options

[`IDebugSessionManagerOptions`](../interfaces/IDebugSessionManagerOptions.md) = `{}`

#### Returns

`DebugSessionManager`

#### Overrides

`EventEmitter.constructor`

## Methods

### createSession()

> **createSession**(`options`): `Promise`\<[`DebugSession`](../../DebugSession/classes/DebugSession.md)\>

Defined in: [src/services/DebugSessionManager.ts:61](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L61)

#### Parameters

##### options

[`IDebugSessionOptions`](../../DebugSession/interfaces/IDebugSessionOptions.md)

#### Returns

`Promise`\<[`DebugSession`](../../DebugSession/classes/DebugSession.md)\>

***

### destroy()

> **destroy**(): `void`

Defined in: [src/services/DebugSessionManager.ts:264](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L264)

#### Returns

`void`

***

### exportSessions()

> **exportSessions**(): `Promise`\<`Record`\<`string`, [`IDebugSession`](../../DebugSession/interfaces/IDebugSession.md)\>\>

Defined in: [src/services/DebugSessionManager.ts:192](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L192)

#### Returns

`Promise`\<`Record`\<`string`, [`IDebugSession`](../../DebugSession/interfaces/IDebugSession.md)\>\>

***

### getActiveSessions()

> **getActiveSessions**(): [`DebugSession`](../../DebugSession/classes/DebugSession.md)[]

Defined in: [src/services/DebugSessionManager.ts:94](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L94)

#### Returns

[`DebugSession`](../../DebugSession/classes/DebugSession.md)[]

***

### getAllSessions()

> **getAllSessions**(): [`DebugSession`](../../DebugSession/classes/DebugSession.md)[]

Defined in: [src/services/DebugSessionManager.ts:90](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L90)

#### Returns

[`DebugSession`](../../DebugSession/classes/DebugSession.md)[]

***

### getSession()

> **getSession**(`sessionId`): `undefined` \| [`DebugSession`](../../DebugSession/classes/DebugSession.md)

Defined in: [src/services/DebugSessionManager.ts:86](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L86)

#### Parameters

##### sessionId

`string`

#### Returns

`undefined` \| [`DebugSession`](../../DebugSession/classes/DebugSession.md)

***

### getSessionHistory()

> **getSessionHistory**(`limit`): [`IDebugSession`](../../DebugSession/interfaces/IDebugSession.md)[]

Defined in: [src/services/DebugSessionManager.ts:141](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L141)

#### Parameters

##### limit

`number` = `10`

#### Returns

[`IDebugSession`](../../DebugSession/interfaces/IDebugSession.md)[]

***

### getSessionsByWorkflow()

> **getSessionsByWorkflow**(`workflowId`): [`DebugSession`](../../DebugSession/classes/DebugSession.md)[]

Defined in: [src/services/DebugSessionManager.ts:98](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L98)

#### Parameters

##### workflowId

`string`

#### Returns

[`DebugSession`](../../DebugSession/classes/DebugSession.md)[]

***

### getStatistics()

> **getStatistics**(): `object`

Defined in: [src/services/DebugSessionManager.ts:221](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L221)

#### Returns

`object`

##### activeSessions

> **activeSessions**: `number`

##### averageBreakpointsPerSession

> **averageBreakpointsPerSession**: `number`

##### averageSessionDuration

> **averageSessionDuration**: `number`

##### averageTimelineEventsPerSession

> **averageTimelineEventsPerSession**: `number`

##### cachedSessions

> **cachedSessions**: `number`

##### totalSessions

> **totalSessions**: `number`

***

### importSession()

> **importSession**(`sessionData`): `Promise`\<[`DebugSession`](../../DebugSession/classes/DebugSession.md)\>

Defined in: [src/services/DebugSessionManager.ts:202](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L202)

#### Parameters

##### sessionData

[`IDebugSession`](../../DebugSession/interfaces/IDebugSession.md)

#### Returns

`Promise`\<[`DebugSession`](../../DebugSession/classes/DebugSession.md)\>

***

### removeSession()

> **removeSession**(`sessionId`): `Promise`\<`boolean`\>

Defined in: [src/services/DebugSessionManager.ts:104](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L104)

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### stopAllSessions()

> **stopAllSessions**(): `Promise`\<`void`\>

Defined in: [src/services/DebugSessionManager.ts:130](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/DebugSessionManager.ts#L130)

#### Returns

`Promise`\<`void`\>
