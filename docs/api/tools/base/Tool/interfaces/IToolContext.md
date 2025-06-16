[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [tools/base/Tool](../README.md) / IToolContext

# Interface: IToolContext

Defined in: [src/tools/base/Tool.ts:51](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L51)

Context provided to tools during execution

## Properties

### apiClient?

> `optional` **apiClient**: `any`

Defined in: [src/tools/base/Tool.ts:55](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L55)

n8n API client instance (if available)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [src/tools/base/Tool.ts:78](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L78)

Additional context data

***

### monitoringService?

> `optional` **monitoringService**: `any`

Defined in: [src/tools/base/Tool.ts:60](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L60)

Real-time monitoring service instance (if available)

***

### requestId?

> `optional` **requestId**: `string`

Defined in: [src/tools/base/Tool.ts:65](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L65)

Request ID for tracing

***

### user?

> `optional` **user**: `object`

Defined in: [src/tools/base/Tool.ts:70](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L70)

User information if available

#### id

> **id**: `string`

#### name?

> `optional` **name**: `string`
