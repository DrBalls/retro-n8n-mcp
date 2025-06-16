[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/n8n.types](../README.md) / WorkflowConnectionSchema

# Variable: WorkflowConnectionSchema

> `const` **WorkflowConnectionSchema**: `ZodObject`\<\{ `source`: `ZodObject`\<\{ `id`: `ZodString`; `outputIndex`: `ZodOptional`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `id`: `string`; `outputIndex?`: `number`; \}, \{ `id`: `string`; `outputIndex?`: `number`; \}\>; `target`: `ZodObject`\<\{ `id`: `ZodString`; `inputIndex`: `ZodOptional`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `id`: `string`; `inputIndex?`: `number`; \}, \{ `id`: `string`; `inputIndex?`: `number`; \}\>; \}, `"strip"`, `ZodTypeAny`, \{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \}, \{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \}\>

Defined in: [src/types/n8n.types.ts:28](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/n8n.types.ts#L28)
