[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [security/AuditLogger](../README.md) / IAuditEvent

# Interface: IAuditEvent

Defined in: [src/security/AuditLogger.ts:3](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L3)

## Properties

### action

> **action**: `string`

Defined in: [src/security/AuditLogger.ts:8](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L8)

***

### apiKeyId?

> `optional` **apiKeyId**: `string`

Defined in: [src/security/AuditLogger.ts:7](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L7)

***

### details?

> `optional` **details**: `Record`\<`string`, `unknown`\>

Defined in: [src/security/AuditLogger.ts:15](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L15)

***

### id

> **id**: `string`

Defined in: [src/security/AuditLogger.ts:4](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L4)

***

### metadata?

> `optional` **metadata**: `object`

Defined in: [src/security/AuditLogger.ts:16](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L16)

#### ip?

> `optional` **ip**: `string`

#### sessionId?

> `optional` **sessionId**: `string`

#### userAgent?

> `optional` **userAgent**: `string`

***

### resource?

> `optional` **resource**: `object`

Defined in: [src/security/AuditLogger.ts:9](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L9)

#### id

> **id**: `string`

#### name?

> `optional` **name**: `string`

#### type

> **type**: `string`

***

### result

> **result**: `"success"` \| `"failure"` \| `"denied"`

Defined in: [src/security/AuditLogger.ts:14](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L14)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/security/AuditLogger.ts:5](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L5)

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/security/AuditLogger.ts:6](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/security/AuditLogger.ts#L6)
