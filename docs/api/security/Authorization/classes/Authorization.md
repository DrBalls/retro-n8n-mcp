[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [security/Authorization](../README.md) / Authorization

# Class: Authorization

Defined in: [src/security/Authorization.ts:31](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L31)

## Constructors

### Constructor

> **new Authorization**(): `Authorization`

Defined in: [src/security/Authorization.ts:37](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L37)

#### Returns

`Authorization`

## Methods

### assignRole()

> **assignRole**(`userId`, `roleId`): `boolean`

Defined in: [src/security/Authorization.ts:413](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L413)

Assign a role to a user

#### Parameters

##### userId

`string`

##### roleId

`string`

#### Returns

`boolean`

***

### canAccessResource()

Check if a user can access a resource

#### Call Signature

> **canAccessResource**(`context`, `action`): `boolean`

Defined in: [src/security/Authorization.ts:162](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L162)

##### Parameters

###### context

[`IAuthorizationContext`](../interfaces/IAuthorizationContext.md)

###### action

`string`

##### Returns

`boolean`

#### Call Signature

> **canAccessResource**(`context`, `action`): `boolean`

Defined in: [src/security/Authorization.ts:476](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L476)

Can access resource with advanced checks

##### Parameters

###### context

###### resource?

\{ `id`: `string`; `isPublic?`: `boolean`; `ownerId?`: `string`; `sharedWith?`: `string`[]; `type`: `string`; \}

###### resource.id

`string`

###### resource.isPublic?

`boolean`

###### resource.ownerId?

`string`

###### resource.sharedWith?

`string`[]

###### resource.type

`string`

###### user?

[`IUser`](../interfaces/IUser.md)

###### action

`string`

##### Returns

`boolean`

***

### createRole()

> **createRole**(`role`): `void`

Defined in: [src/security/Authorization.ts:94](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L94)

Create a new role

#### Parameters

##### role

[`IRole`](../interfaces/IRole.md)

#### Returns

`void`

***

### deleteRole()

> **deleteRole**(`id`): `boolean`

Defined in: [src/security/Authorization.ts:348](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L348)

Delete a role (except default roles)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### getEffectivePermissions()

> **getEffectivePermissions**(`context`): `string`[]

Defined in: [src/security/Authorization.ts:364](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L364)

Get effective permissions for a context

#### Parameters

##### context

[`IAuthorizationContext`](../interfaces/IAuthorizationContext.md)

#### Returns

`string`[]

***

### getRole()

> **getRole**(`id`): `undefined` \| [`IRole`](../interfaces/IRole.md)

Defined in: [src/security/Authorization.ts:327](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L327)

Get a specific role

#### Parameters

##### id

`string`

#### Returns

`undefined` \| [`IRole`](../interfaces/IRole.md)

***

### getRoles()

> **getRoles**(): [`IRole`](../interfaces/IRole.md)[]

Defined in: [src/security/Authorization.ts:320](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L320)

Get all roles

#### Returns

[`IRole`](../interfaces/IRole.md)[]

***

### getUser()

> **getUser**(`id`): `undefined` \| [`IUser`](../interfaces/IUser.md)

Defined in: [src/security/Authorization.ts:406](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L406)

Get a user by ID

#### Parameters

##### id

`string`

#### Returns

`undefined` \| [`IUser`](../interfaces/IUser.md)

***

### grantResourcePermission()

> **grantResourcePermission**(`resourceId`, `userId`, `permissions`): `void`

Defined in: [src/security/Authorization.ts:191](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L191)

Grant permission to a user for a specific resource

#### Parameters

##### resourceId

`string`

##### userId

`string`

##### permissions

`string`[]

#### Returns

`void`

***

### hasPermission()

> **hasPermission**(`context`, `permission`): `boolean`

Defined in: [src/security/Authorization.ts:118](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L118)

Check if a user has a specific permission

#### Parameters

##### context

[`IAuthorizationContext`](../interfaces/IAuthorizationContext.md)

##### permission

`string`

#### Returns

`boolean`

***

### listRoles()

> **listRoles**(): [`IRole`](../interfaces/IRole.md)[]

Defined in: [src/security/Authorization.ts:399](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L399)

List all roles

#### Returns

[`IRole`](../interfaces/IRole.md)[]

***

### permissionMatches()

> **permissionMatches**(`pattern`, `permission`): `boolean`

Defined in: [src/security/Authorization.ts:453](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L453)

Check if a permission matches a pattern (with wildcard support)

#### Parameters

##### pattern

`string`

##### permission

`string`

#### Returns

`boolean`

***

### removeRole()

> **removeRole**(`userId`, `roleId`): `boolean`

Defined in: [src/security/Authorization.ts:434](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L434)

Remove a role from a user

#### Parameters

##### userId

`string`

##### roleId

`string`

#### Returns

`boolean`

***

### revokeResourcePermission()

> **revokeResourcePermission**(`resourceId`, `userId`, `permissions?`): `void`

Defined in: [src/security/Authorization.ts:216](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L216)

Revoke permissions from a user for a resource

#### Parameters

##### resourceId

`string`

##### userId

`string`

##### permissions?

`string`[]

#### Returns

`void`

***

### updateRole()

> **updateRole**(`id`, `updates`): `boolean`

Defined in: [src/security/Authorization.ts:334](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L334)

Update a role

#### Parameters

##### id

`string`

##### updates

`Partial`\<[`IRole`](../interfaces/IRole.md)\>

#### Returns

`boolean`

***

### upsertUser()

> **upsertUser**(`user`): `void`

Defined in: [src/security/Authorization.ts:106](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L106)

Create or update a user

#### Parameters

##### user

[`IUser`](../interfaces/IUser.md)

#### Returns

`void`
