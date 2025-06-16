[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/version-control.types](../README.md) / DiffOperationSchema

# Variable: DiffOperationSchema

> `const` **DiffOperationSchema**: `ZodObject`\<\{ `from`: `ZodOptional`\<`ZodString`\>; `oldValue`: `ZodOptional`\<`ZodUnknown`\>; `operation`: `ZodEnum`\<\[`"add"`, `"remove"`, `"replace"`, `"move"`, `"copy"`\]\>; `path`: `ZodString`; `value`: `ZodOptional`\<`ZodUnknown`\>; \}, `"strip"`, `ZodTypeAny`, \{ `from?`: `string`; `oldValue?`: `unknown`; `operation`: `"move"` \| `"add"` \| `"remove"` \| `"replace"` \| `"copy"`; `path`: `string`; `value?`: `unknown`; \}, \{ `from?`: `string`; `oldValue?`: `unknown`; `operation`: `"move"` \| `"add"` \| `"remove"` \| `"replace"` \| `"copy"`; `path`: `string`; `value?`: `unknown`; \}\>

Defined in: [src/types/version-control.types.ts:113](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/version-control.types.ts#L113)
