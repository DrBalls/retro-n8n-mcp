[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/version-control.types](../README.md) / WorkflowBranchSchema

# Variable: WorkflowBranchSchema

> `const` **WorkflowBranchSchema**: `ZodObject`\<\{ `baseVersionId`: `ZodString`; `createdAt`: `ZodString`; `createdBy`: `ZodOptional`\<`ZodString`\>; `description`: `ZodOptional`\<`ZodString`\>; `headVersionId`: `ZodString`; `id`: `ZodString`; `isActive`: `ZodDefault`\<`ZodBoolean`\>; `isMerged`: `ZodDefault`\<`ZodBoolean`\>; `mergedAt`: `ZodOptional`\<`ZodString`\>; `name`: `ZodString`; `updatedAt`: `ZodString`; `workflowId`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `baseVersionId`: `string`; `createdAt`: `string`; `createdBy?`: `string`; `description?`: `string`; `headVersionId`: `string`; `id`: `string`; `isActive`: `boolean`; `isMerged`: `boolean`; `mergedAt?`: `string`; `name`: `string`; `updatedAt`: `string`; `workflowId`: `string`; \}, \{ `baseVersionId`: `string`; `createdAt`: `string`; `createdBy?`: `string`; `description?`: `string`; `headVersionId`: `string`; `id`: `string`; `isActive?`: `boolean`; `isMerged?`: `boolean`; `mergedAt?`: `string`; `name`: `string`; `updatedAt`: `string`; `workflowId`: `string`; \}\>

Defined in: [src/types/version-control.types.ts:64](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/version-control.types.ts#L64)
