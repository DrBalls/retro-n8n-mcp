[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [security/Authorization](../README.md) / IAuthorizationContext

# Interface: IAuthorizationContext

Defined in: [src/security/Authorization.ts:20](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L20)

## Properties

### apiKeyId?

> `optional` **apiKeyId**: `string`

Defined in: [src/security/Authorization.ts:22](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L22)

***

### apiKeyPermissions?

> `optional` **apiKeyPermissions**: `string`[]

Defined in: [src/security/Authorization.ts:23](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L23)

***

### resource?

> `optional` **resource**: `object`

Defined in: [src/security/Authorization.ts:24](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L24)

#### id

> **id**: `string`

#### owner?

> `optional` **owner**: `string`

#### type

> **type**: `string`

***

### user?

> `optional` **user**: [`IUser`](IUser.md)

Defined in: [src/security/Authorization.ts:21](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/Authorization.ts#L21)
