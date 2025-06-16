[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [security/AuditLogger](../README.md) / AuditLogger

# Class: AuditLogger

Defined in: [src/security/AuditLogger.ts:35](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L35)

## Constructors

### Constructor

> **new AuditLogger**(`maxEvents`): `AuditLogger`

Defined in: [src/security/AuditLogger.ts:41](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L41)

#### Parameters

##### maxEvents

`number` = `10000`

#### Returns

`AuditLogger`

## Methods

### addEventHandler()

> **addEventHandler**(`handler`): `void`

Defined in: [src/security/AuditLogger.ts:203](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L203)

Add an event handler for real-time monitoring

#### Parameters

##### handler

(`event`) => `void`

#### Returns

`void`

***

### clearOldEvents()

> **clearOldEvents**(`beforeDate`): `number`

Defined in: [src/security/AuditLogger.ts:259](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L259)

Clear old events

#### Parameters

##### beforeDate

`Date`

#### Returns

`number`

***

### detectSuspiciousActivity()

> **detectSuspiciousActivity**(): `object`

Defined in: [src/security/AuditLogger.ts:295](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L295)

Detect suspicious activity patterns

#### Returns

`object`

##### denialSpikes

> **denialSpikes**: `object`[]

##### failureSpikes

> **failureSpikes**: `object`[]

##### unusualActions

> **unusualActions**: `object`[]

***

### exportEvents()

> **exportEvents**(`query?`): `object`

Defined in: [src/security/AuditLogger.ts:220](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L220)

Export events for persistence

#### Parameters

##### query?

[`IAuditQuery`](../interfaces/IAuditQuery.md)

#### Returns

`object`

##### events

> **events**: [`IAuditEvent`](../interfaces/IAuditEvent.md)[]

##### exportedAt

> **exportedAt**: `Date`

##### format

> **format**: `string`

***

### getResourceAuditTrail()

> **getResourceAuditTrail**(`resourceType`, `resourceId`): [`IAuditEvent`](../interfaces/IAuditEvent.md)[]

Defined in: [src/security/AuditLogger.ts:281](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L281)

Get audit trail for a specific resource

#### Parameters

##### resourceType

`string`

##### resourceId

`string`

#### Returns

[`IAuditEvent`](../interfaces/IAuditEvent.md)[]

***

### getStatistics()

> **getStatistics**(`startTime`, `endTime`): `object`

Defined in: [src/security/AuditLogger.ts:389](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L389)

Get statistics for a time range

#### Parameters

##### startTime

`Date`

##### endTime

`Date`

#### Returns

`object`

##### actionBreakdown

> **actionBreakdown**: `Record`\<`string`, `number`\>

##### deniedCount

> **deniedCount**: `number`

##### failureCount

> **failureCount**: `number`

##### successCount

> **successCount**: `number`

##### topUsers

> **topUsers**: `object`[]

##### totalEvents

> **totalEvents**: `number`

***

### getUserActivity()

> **getUserActivity**(`userId`, `limit`): [`IAuditEvent`](../interfaces/IAuditEvent.md)[]

Defined in: [src/security/AuditLogger.ts:288](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L288)

Get user activity

#### Parameters

##### userId

`string`

##### limit

`number` = `100`

#### Returns

[`IAuditEvent`](../interfaces/IAuditEvent.md)[]

***

### importEvents()

> **importEvents**(`events`): `void`

Defined in: [src/security/AuditLogger.ts:235](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L235)

Import events from persistence

#### Parameters

##### events

[`IAuditEvent`](../interfaces/IAuditEvent.md)[]

#### Returns

`void`

***

### logDenied()

> **logDenied**(`action`, `reason`, `context`): `void`

Defined in: [src/security/AuditLogger.ts:131](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L131)

Log a denied action (authorization failure)

#### Parameters

##### action

`string`

##### reason

`string`

##### context

###### apiKeyId?

`string`

###### metadata?

\{ `ip?`: `string`; `sessionId?`: `string`; `userAgent?`: `string`; \}

###### metadata.ip?

`string`

###### metadata.sessionId?

`string`

###### metadata.userAgent?

`string`

###### resource?

\{ `id`: `string`; `name?`: `string`; `type`: `string`; \}

###### resource.id

`string`

###### resource.name?

`string`

###### resource.type

`string`

###### userId?

`string`

#### Returns

`void`

***

### logEvent()

> **logEvent**(`event`): `void`

Defined in: [src/security/AuditLogger.ts:48](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L48)

Log an audit event

#### Parameters

##### event

`Omit`\<[`IAuditEvent`](../interfaces/IAuditEvent.md), `"id"` \| `"timestamp"`\>

#### Returns

`void`

***

### logFailure()

> **logFailure**(`action`, `error`, `context`): `void`

Defined in: [src/security/AuditLogger.ts:107](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L107)

Log a failed action

#### Parameters

##### action

`string`

##### error

`string` | `Error`

##### context

###### apiKeyId?

`string`

###### metadata?

\{ `ip?`: `string`; `sessionId?`: `string`; `userAgent?`: `string`; \}

###### metadata.ip?

`string`

###### metadata.sessionId?

`string`

###### metadata.userAgent?

`string`

###### resource?

\{ `id`: `string`; `name?`: `string`; `type`: `string`; \}

###### resource.id

`string`

###### resource.name?

`string`

###### resource.type

`string`

###### userId?

`string`

#### Returns

`void`

***

### logSuccess()

> **logSuccess**(`action`, `context`): `void`

Defined in: [src/security/AuditLogger.ts:87](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L87)

Log a successful action

#### Parameters

##### action

`string`

##### context

###### apiKeyId?

`string`

###### details?

`Record`\<`string`, `unknown`\>

###### metadata?

\{ `ip?`: `string`; `sessionId?`: `string`; `userAgent?`: `string`; \}

###### metadata.ip?

`string`

###### metadata.sessionId?

`string`

###### metadata.userAgent?

`string`

###### resource?

\{ `id`: `string`; `name?`: `string`; `type`: `string`; \}

###### resource.id

`string`

###### resource.name?

`string`

###### resource.type

`string`

###### userId?

`string`

#### Returns

`void`

***

### queryEvents()

> **queryEvents**(`query`): [`IAuditEvent`](../interfaces/IAuditEvent.md)[]

Defined in: [src/security/AuditLogger.ts:152](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L152)

Query audit events

#### Parameters

##### query

[`IAuditQuery`](../interfaces/IAuditQuery.md)

#### Returns

[`IAuditEvent`](../interfaces/IAuditEvent.md)[]

***

### removeEventHandler()

> **removeEventHandler**(`handler`): `void`

Defined in: [src/security/AuditLogger.ts:210](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L210)

Remove an event handler

#### Parameters

##### handler

(`event`) => `void`

#### Returns

`void`
