[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [security/SecurityManager](../README.md) / SecurityManager

# Class: SecurityManager

Defined in: [src/security/SecurityManager.ts:34](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L34)

## Constructors

### Constructor

> **new SecurityManager**(`config`): `SecurityManager`

Defined in: [src/security/SecurityManager.ts:42](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L42)

#### Parameters

##### config

[`ISecurityConfig`](../interfaces/ISecurityConfig.md) = `{}`

#### Returns

`SecurityManager`

## Methods

### authenticate()

> **authenticate**(`context`): `Promise`\<\{ `apiKeyInfo?`: `Omit`\<[`IApiKey`](../../ApiKeyManager/interfaces/IApiKey.md), `"key"`\>; `authenticated`: `boolean`; `reason?`: `string`; `user?`: [`IUser`](../../Authorization/interfaces/IUser.md); \}\>

Defined in: [src/security/SecurityManager.ts:103](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L103)

Authenticate a request

#### Parameters

##### context

[`ISecurityContext`](../interfaces/ISecurityContext.md)

#### Returns

`Promise`\<\{ `apiKeyInfo?`: `Omit`\<[`IApiKey`](../../ApiKeyManager/interfaces/IApiKey.md), `"key"`\>; `authenticated`: `boolean`; `reason?`: `string`; `user?`: [`IUser`](../../Authorization/interfaces/IUser.md); \}\>

***

### authorize()

> **authorize**(`action`, `context`): `boolean`

Defined in: [src/security/SecurityManager.ts:165](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L165)

Authorize an action

#### Parameters

##### action

`string`

##### context

[`IAuthorizationContext`](../../Authorization/interfaces/IAuthorizationContext.md) & `object`

#### Returns

`boolean`

***

### checkRateLimit()

> **checkRateLimit**(`key`, `context`): `object`

Defined in: [src/security/SecurityManager.ts:195](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L195)

Check rate limits

#### Parameters

##### key

`string`

##### context

###### cost?

`number`

###### toolName?

`string`

###### type

`"global"` \| `"user"` \| `"apiKey"` \| `"tool"`

#### Returns

`object`

##### allowed

> **allowed**: `boolean`

##### retryAfter?

> `optional` **retryAfter**: `number`

***

### checkToolSecurity()

> **checkToolSecurity**(`toolName`, `permission`, `context`): `Promise`\<\{ `allowed`: `boolean`; `reason?`: `string`; `retryAfter?`: `number`; \}\>

Defined in: [src/security/SecurityManager.ts:232](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L232)

Check all security requirements for a tool execution

#### Parameters

##### toolName

`string`

##### permission

`string`

##### context

[`ISecurityContext`](../interfaces/ISecurityContext.md)

#### Returns

`Promise`\<\{ `allowed`: `boolean`; `reason?`: `string`; `retryAfter?`: `number`; \}\>

***

### createApiKey()

> **createApiKey**(`name`, `permissions`, `userId?`): [`IApiKey`](../../ApiKeyManager/interfaces/IApiKey.md)

Defined in: [src/security/SecurityManager.ts:299](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L299)

#### Parameters

##### name

`string`

##### permissions

`string`[]

##### userId?

`string`

#### Returns

[`IApiKey`](../../ApiKeyManager/interfaces/IApiKey.md)

***

### createRole()

> **createRole**(`role`): `void`

Defined in: [src/security/SecurityManager.ts:349](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L349)

#### Parameters

##### role

[`IRole`](../../Authorization/interfaces/IRole.md)

#### Returns

`void`

***

### createUser()

> **createUser**(`user`): `void`

Defined in: [src/security/SecurityManager.ts:335](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L335)

#### Parameters

##### user

[`IUser`](../../Authorization/interfaces/IUser.md)

#### Returns

`void`

***

### getAuditLogs()

> **getAuditLogs**(`query`): [`IAuditEvent`](../../AuditLogger/interfaces/IAuditEvent.md)[]

Defined in: [src/security/SecurityManager.ts:369](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L369)

#### Parameters

##### query

[`IAuditQuery`](../../AuditLogger/interfaces/IAuditQuery.md)

#### Returns

[`IAuditEvent`](../../AuditLogger/interfaces/IAuditEvent.md)[]

***

### getSecurityStatistics()

> **getSecurityStatistics**(`startTime`, `endTime`): `object`

Defined in: [src/security/SecurityManager.ts:373](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L373)

#### Parameters

##### startTime

`Date`

##### endTime

`Date`

#### Returns

`object`

##### audit

> **audit**: `object`

###### audit.actionBreakdown

> **actionBreakdown**: `Record`\<`string`, `number`\>

###### audit.deniedCount

> **deniedCount**: `number`

###### audit.failureCount

> **failureCount**: `number`

###### audit.successCount

> **successCount**: `number`

###### audit.topUsers

> **topUsers**: `object`[]

###### audit.totalEvents

> **totalEvents**: `number`

##### rateLimit

> **rateLimit**: `object`

###### rateLimit.limits

> **limits**: `object`[]

##### suspiciousActivity

> **suspiciousActivity**: `object`

###### suspiciousActivity.denialSpikes

> **denialSpikes**: `object`[]

###### suspiciousActivity.failureSpikes

> **failureSpikes**: `object`[]

###### suspiciousActivity.unusualActions

> **unusualActions**: `object`[]

***

### revokeApiKey()

> **revokeApiKey**(`id`, `userId?`): `boolean`

Defined in: [src/security/SecurityManager.ts:316](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L316)

#### Parameters

##### id

`string`

##### userId?

`string`

#### Returns

`boolean`

***

### stop()

> **stop**(): `void`

Defined in: [src/security/SecurityManager.ts:386](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L386)

#### Returns

`void`

***

### updateRole()

> **updateRole**(`id`, `updates`): `boolean`

Defined in: [src/security/SecurityManager.ts:356](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/SecurityManager.ts#L356)

#### Parameters

##### id

`string`

##### updates

`Partial`\<[`IRole`](../../Authorization/interfaces/IRole.md)\>

#### Returns

`boolean`
