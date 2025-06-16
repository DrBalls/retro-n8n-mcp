[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/version-control.types](../README.md) / MergeConflictSchema

# Variable: MergeConflictSchema

> `const` **MergeConflictSchema**: `ZodObject`\<\{ `baseValue`: `ZodOptional`\<`ZodUnknown`\>; `conflictType`: `ZodEnum`\<\[`"property_conflict"`, `"node_conflict"`, `"connection_conflict"`, `"deletion_conflict"`\]\>; `description`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `path`: `ZodString`; `resolution`: `ZodOptional`\<`ZodEnum`\<\[`"source"`, `"target"`, `"manual"`, `"skip"`\]\>\>; `resolvedValue`: `ZodOptional`\<`ZodUnknown`\>; `sourceValue`: `ZodUnknown`; `targetValue`: `ZodUnknown`; \}, `"strip"`, `ZodTypeAny`, \{ `baseValue?`: `unknown`; `conflictType`: `"property_conflict"` \| `"node_conflict"` \| `"connection_conflict"` \| `"deletion_conflict"`; `description?`: `string`; `id`: `string`; `path`: `string`; `resolution?`: `"source"` \| `"target"` \| `"manual"` \| `"skip"`; `resolvedValue?`: `unknown`; `sourceValue?`: `unknown`; `targetValue?`: `unknown`; \}, \{ `baseValue?`: `unknown`; `conflictType`: `"property_conflict"` \| `"node_conflict"` \| `"connection_conflict"` \| `"deletion_conflict"`; `description?`: `string`; `id`: `string`; `path`: `string`; `resolution?`: `"source"` \| `"target"` \| `"manual"` \| `"skip"`; `resolvedValue?`: `unknown`; `sourceValue?`: `unknown`; `targetValue?`: `unknown`; \}\>

Defined in: [src/types/version-control.types.ts:80](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/version-control.types.ts#L80)
