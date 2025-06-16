[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/version-control.types](../README.md) / WorkflowChangeSchema

# Variable: WorkflowChangeSchema

> `const` **WorkflowChangeSchema**: `ZodObject`\<\{ `description`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `newValue`: `ZodOptional`\<`ZodUnknown`\>; `oldValue`: `ZodOptional`\<`ZodUnknown`\>; `path`: `ZodString`; `timestamp`: `ZodString`; `type`: `ZodEnum`\<\[`"create"`, `"update"`, `"delete"`, `"move"`, `"rename"`, `"parameter_change"`, `"connection_change"`, `"node_add"`, `"node_remove"`, `"activation_change"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `description?`: `string`; `id`: `string`; `newValue?`: `unknown`; `oldValue?`: `unknown`; `path`: `string`; `timestamp`: `string`; `type`: `"create"` \| `"update"` \| `"delete"` \| `"move"` \| `"rename"` \| `"parameter_change"` \| `"connection_change"` \| `"node_add"` \| `"node_remove"` \| `"activation_change"`; \}, \{ `description?`: `string`; `id`: `string`; `newValue?`: `unknown`; `oldValue?`: `unknown`; `path`: `string`; `timestamp`: `string`; `type`: `"create"` \| `"update"` \| `"delete"` \| `"move"` \| `"rename"` \| `"parameter_change"` \| `"connection_change"` \| `"node_add"` \| `"node_remove"` \| `"activation_change"`; \}\>

Defined in: [src/types/version-control.types.ts:35](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/version-control.types.ts#L35)
