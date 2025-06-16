[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/cache.types](../README.md) / CacheEntrySchema

# Variable: CacheEntrySchema

> `const` **CacheEntrySchema**: `ZodObject`\<\{ `accessCount`: `ZodDefault`\<`ZodNumber`\>; `accessedAt`: `ZodNumber`; `createdAt`: `ZodNumber`; `key`: `ZodString`; `metadata`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodUnknown`\>\>; `size`: `ZodOptional`\<`ZodNumber`\>; `tags`: `ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `ttl`: `ZodOptional`\<`ZodNumber`\>; `value`: `ZodUnknown`; \}, `"strip"`, `ZodTypeAny`, \{ `accessCount`: `number`; `accessedAt`: `number`; `createdAt`: `number`; `key`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `size?`: `number`; `tags`: `string`[]; `ttl?`: `number`; `value?`: `unknown`; \}, \{ `accessCount?`: `number`; `accessedAt`: `number`; `createdAt`: `number`; `key`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `size?`: `number`; `tags?`: `string`[]; `ttl?`: `number`; `value?`: `unknown`; \}\>

Defined in: [src/types/cache.types.ts:41](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L41)
