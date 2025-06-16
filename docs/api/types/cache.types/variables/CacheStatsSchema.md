[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/cache.types](../README.md) / CacheStatsSchema

# Variable: CacheStatsSchema

> `const` **CacheStatsSchema**: `ZodObject`\<\{ `averageLatencyMs`: `ZodDefault`\<`ZodNumber`\>; `errors`: `ZodDefault`\<`ZodNumber`\>; `evictions`: `ZodDefault`\<`ZodNumber`\>; `hitRate`: `ZodDefault`\<`ZodNumber`\>; `hits`: `ZodDefault`\<`ZodNumber`\>; `lastAccess`: `ZodOptional`\<`ZodNumber`\>; `layer`: `ZodEnum`\<\[`"memory"`, `"redis"`, `"database"`, `"overall"`\]\>; `misses`: `ZodDefault`\<`ZodNumber`\>; `totalItems`: `ZodDefault`\<`ZodNumber`\>; `totalRequests`: `ZodDefault`\<`ZodNumber`\>; `totalSizeBytes`: `ZodDefault`\<`ZodNumber`\>; `uptime`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `averageLatencyMs`: `number`; `errors`: `number`; `evictions`: `number`; `hitRate`: `number`; `hits`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses`: `number`; `totalItems`: `number`; `totalRequests`: `number`; `totalSizeBytes`: `number`; `uptime`: `number`; \}, \{ `averageLatencyMs?`: `number`; `errors?`: `number`; `evictions?`: `number`; `hitRate?`: `number`; `hits?`: `number`; `lastAccess?`: `number`; `layer`: `"memory"` \| `"redis"` \| `"database"` \| `"overall"`; `misses?`: `number`; `totalItems?`: `number`; `totalRequests?`: `number`; `totalSizeBytes?`: `number`; `uptime?`: `number`; \}\>

Defined in: [src/types/cache.types.ts:69](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L69)
