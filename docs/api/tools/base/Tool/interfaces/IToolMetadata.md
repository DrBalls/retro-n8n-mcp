[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [tools/base/Tool](../README.md) / IToolMetadata

# Interface: IToolMetadata

Defined in: [src/tools/base/Tool.ts:98](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L98)

Tool metadata for discovery and documentation

## Properties

### category

> **category**: `"monitoring"` \| `"debug"` \| `"workflow"` \| `"execution"` \| `"credential"` \| `"system"` \| `"utility"` \| `"visualization"` \| `"version-control"` \| `"batch"`

Defined in: [src/tools/base/Tool.ts:102](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L102)

Tool category for organization

***

### isMutating?

> `optional` **isMutating**: `boolean`

Defined in: [src/tools/base/Tool.ts:122](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L122)

Whether this tool modifies data

***

### rateLimit?

> `optional` **rateLimit**: `object`

Defined in: [src/tools/base/Tool.ts:127](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L127)

Rate limit information

#### requests

> **requests**: `number`

#### window

> **window**: `number`

***

### requirements?

> `optional` **requirements**: `string`[]

Defined in: [src/tools/base/Tool.ts:107](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L107)

Required permissions or features

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/tools/base/Tool.ts:112](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L112)

Tags for search and filtering

***

### version?

> `optional` **version**: `string`

Defined in: [src/tools/base/Tool.ts:117](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/tools/base/Tool.ts#L117)

Version of the tool
