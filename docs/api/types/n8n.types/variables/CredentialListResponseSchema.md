[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/n8n.types](../README.md) / CredentialListResponseSchema

# Variable: CredentialListResponseSchema

> `const` **CredentialListResponseSchema**: `ZodObject`\<\{ `data`: `ZodArray`\<`ZodObject`\<\{ `createdAt`: `ZodString`; `id`: `ZodString`; `name`: `ZodString`; `nodesAccess`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `date`: `ZodString`; `nodeType`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `date`: `string`; `nodeType`: `string`; \}, \{ `date`: `string`; `nodeType`: `string`; \}\>, `"many"`\>\>; `type`: `ZodString`; `updatedAt`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodesAccess?`: `object`[]; `type`: `string`; `updatedAt`: `string`; \}, \{ `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodesAccess?`: `object`[]; `type`: `string`; `updatedAt`: `string`; \}\>, `"many"`\>; `nextCursor`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `data`: `object`[]; `nextCursor?`: `null` \| `string`; \}, \{ `data`: `object`[]; `nextCursor?`: `null` \| `string`; \}\>

Defined in: [src/types/n8n.types.ts:133](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/n8n.types.ts#L133)
