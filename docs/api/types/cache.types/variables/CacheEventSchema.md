[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/cache.types](../README.md) / CacheEventSchema

# Variable: CacheEventSchema

> `const` **CacheEventSchema**: `ZodObject`\<\{ `error`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `key`: `ZodString`; `latencyMs`: `ZodOptional`\<`ZodNumber`\>; `layer`: `ZodEnum`\<\[`"memory"`, `"redis"`, `"database"`\]\>; `metadata`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodUnknown`\>\>; `timestamp`: `ZodNumber`; `type`: `ZodEnum`\<\[`"hit"`, `"miss"`, `"set"`, `"delete"`, `"eviction"`, `"error"`, `"invalidation"`\]\>; `value`: `ZodOptional`\<`ZodUnknown`\>; \}, `"strip"`, `ZodTypeAny`, \{ `error?`: `string`; `id`: `string`; `key`: `string`; `latencyMs?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"`; `metadata?`: `Record`\<`string`, `unknown`\>; `timestamp`: `number`; `type`: `"error"` \| `"delete"` \| `"set"` \| `"hit"` \| `"miss"` \| `"eviction"` \| `"invalidation"`; `value?`: `unknown`; \}, \{ `error?`: `string`; `id`: `string`; `key`: `string`; `latencyMs?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"`; `metadata?`: `Record`\<`string`, `unknown`\>; `timestamp`: `number`; `type`: `"error"` \| `"delete"` \| `"set"` \| `"hit"` \| `"miss"` \| `"eviction"` \| `"invalidation"`; `value?`: `unknown`; \}\>

Defined in: [src/types/cache.types.ts:164](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L164)
