[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [security/ApiKeyManager](../README.md) / ApiKeyManager

# Class: ApiKeyManager

Defined in: [src/security/ApiKeyManager.ts:21](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/ApiKeyManager.ts#L21)

## Constructors

### Constructor

> **new ApiKeyManager**(): `ApiKeyManager`

#### Returns

`ApiKeyManager`

## Methods

### exportForPersistence()

> **exportForPersistence**(): `any`[]

Defined in: [src/security/ApiKeyManager.ts:237](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/ApiKeyManager.ts#L237)

Export API keys for persistence (excludes actual keys)

#### Returns

`any`[]

***

### generateApiKey()

> **generateApiKey**(`name`, `permissions`, `expiresIn?`): [`IApiKey`](../interfaces/IApiKey.md)

Defined in: [src/security/ApiKeyManager.ts:29](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/ApiKeyManager.ts#L29)

Generate a new API key

#### Parameters

##### name

`string`

##### permissions

`string`[] = `[]`

##### expiresIn?

`number`

#### Returns

[`IApiKey`](../interfaces/IApiKey.md)

***

### hasPermission()

> **hasPermission**(`keyId`, `permission`): `boolean`

Defined in: [src/security/ApiKeyManager.ts:139](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/ApiKeyManager.ts#L139)

Check if a permission is granted by an API key

#### Parameters

##### keyId

`string`

##### permission

`string`

#### Returns

`boolean`

***

### importFromPersistence()

> **importFromPersistence**(`data`): `void`

Defined in: [src/security/ApiKeyManager.ts:249](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/ApiKeyManager.ts#L249)

Import API keys from persistence
Note: This only works with hashed keys, original keys cannot be recovered

#### Parameters

##### data

`any`[]

#### Returns

`void`

***

### listApiKeys()

> **listApiKeys**(): `Omit`\<[`IApiKey`](../interfaces/IApiKey.md), `"key"`\>[]

Defined in: [src/security/ApiKeyManager.ts:124](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/ApiKeyManager.ts#L124)

List all API keys (without exposing the actual keys)

#### Returns

`Omit`\<[`IApiKey`](../interfaces/IApiKey.md), `"key"`\>[]

***

### revokeApiKey()

> **revokeApiKey**(`id`): `boolean`

Defined in: [src/security/ApiKeyManager.ts:107](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/ApiKeyManager.ts#L107)

Revoke an API key

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### rotateApiKey()

> **rotateApiKey**(`id`): `null` \| [`IApiKey`](../interfaces/IApiKey.md)

Defined in: [src/security/ApiKeyManager.ts:184](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/ApiKeyManager.ts#L184)

Rotate an API key (generate new key, keep same permissions)

#### Parameters

##### id

`string`

#### Returns

`null` \| [`IApiKey`](../interfaces/IApiKey.md)

***

### updatePermissions()

> **updatePermissions**(`id`, `permissions`): `boolean`

Defined in: [src/security/ApiKeyManager.ts:170](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/ApiKeyManager.ts#L170)

Update API key permissions

#### Parameters

##### id

`string`

##### permissions

`string`[]

#### Returns

`boolean`

***

### validateApiKey()

> **validateApiKey**(`key`): [`IApiKeyValidation`](../interfaces/IApiKeyValidation.md)

Defined in: [src/security/ApiKeyManager.ts:65](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/ApiKeyManager.ts#L65)

Validate an API key

#### Parameters

##### key

`string`

#### Returns

[`IApiKeyValidation`](../interfaces/IApiKeyValidation.md)
