[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [tools/ToolRegistry](../README.md) / IToolRegistrationOptions

# Interface: IToolRegistrationOptions

Defined in: [src/tools/ToolRegistry.ts:8](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L8)

Tool registration options

## Properties

### dependencies?

> `optional` **dependencies**: `string`[]

Defined in: [src/tools/ToolRegistry.ts:17](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L17)

Dependencies required by this tool

***

### override?

> `optional` **override**: `boolean`

Defined in: [src/tools/ToolRegistry.ts:12](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L12)

Whether to override existing tool with same name

***

### priority?

> `optional` **priority**: `number`

Defined in: [src/tools/ToolRegistry.ts:22](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/ToolRegistry.ts#L22)

Priority for tool discovery (higher = more important)
