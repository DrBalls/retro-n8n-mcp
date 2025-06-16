[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/cache.types](../README.md) / CacheInvalidationSchema

# Variable: CacheInvalidationSchema

> `const` **CacheInvalidationSchema**: `ZodObject`\<\{ `cascade`: `ZodDefault`\<`ZodBoolean`\>; `reason`: `ZodOptional`\<`ZodString`\>; `strategy`: `ZodEnum`\<\[`"key"`, `"pattern"`, `"tag"`, `"all"`\]\>; `target`: `ZodOptional`\<`ZodString`\>; `timestamp`: `ZodNumber`; \}, `"strip"`, `ZodTypeAny`, \{ `cascade`: `boolean`; `reason?`: `string`; `strategy`: `"key"` \| `"pattern"` \| `"tag"` \| `"all"`; `target?`: `string`; `timestamp`: `number`; \}, \{ `cascade?`: `boolean`; `reason?`: `string`; `strategy`: `"key"` \| `"pattern"` \| `"tag"` \| `"all"`; `target?`: `string`; `timestamp`: `number`; \}\>

Defined in: [src/types/cache.types.ts:87](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L87)
