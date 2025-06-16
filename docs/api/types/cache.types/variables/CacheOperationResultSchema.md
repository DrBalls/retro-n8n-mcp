[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/cache.types](../README.md) / CacheOperationResultSchema

# Variable: CacheOperationResultSchema

> `const` **CacheOperationResultSchema**: `ZodObject`\<\{ `error`: `ZodOptional`\<`ZodString`\>; `hit`: `ZodOptional`\<`ZodBoolean`\>; `key`: `ZodString`; `latencyMs`: `ZodOptional`\<`ZodNumber`\>; `layer`: `ZodOptional`\<`ZodEnum`\<\[`"memory"`, `"redis"`, `"database"`\]\>\>; `success`: `ZodBoolean`; `value`: `ZodOptional`\<`ZodUnknown`\>; \}, `"strip"`, `ZodTypeAny`, \{ `error?`: `string`; `hit?`: `boolean`; `key`: `string`; `latencyMs?`: `number`; `layer?`: `"memory"` \| `"redis"` \| `"database"`; `success`: `boolean`; `value?`: `unknown`; \}, \{ `error?`: `string`; `hit?`: `boolean`; `key`: `string`; `latencyMs?`: `number`; `layer?`: `"memory"` \| `"redis"` \| `"database"`; `success`: `boolean`; `value?`: `unknown`; \}\>

Defined in: [src/types/cache.types.ts:56](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L56)
