[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/cache.types](../README.md) / CachePrefetchConfigSchema

# Variable: CachePrefetchConfigSchema

> `const` **CachePrefetchConfigSchema**: `ZodObject`\<\{ `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxConcurrent`: `ZodDefault`\<`ZodNumber`\>; `timeoutMs`: `ZodDefault`\<`ZodNumber`\>; `triggers`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `condition`: `ZodString`; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `name`: `ZodString`; `prefetchKeys`: `ZodArray`\<`ZodString`, `"many"`\>; `priority`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `condition`: `string`; `enabled`: `boolean`; `name`: `string`; `prefetchKeys`: `string`[]; `priority`: `number`; \}, \{ `condition`: `string`; `enabled?`: `boolean`; `name`: `string`; `prefetchKeys`: `string`[]; `priority?`: `number`; \}\>, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `enabled`: `boolean`; `maxConcurrent`: `number`; `timeoutMs`: `number`; `triggers`: `object`[]; \}, \{ `enabled?`: `boolean`; `maxConcurrent?`: `number`; `timeoutMs?`: `number`; `triggers?`: `object`[]; \}\>

Defined in: [src/types/cache.types.ts:190](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L190)
