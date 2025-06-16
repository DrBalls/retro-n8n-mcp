[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/cache.types](../README.md) / CacheWarmingConfigSchema

# Variable: CacheWarmingConfigSchema

> `const` **CacheWarmingConfigSchema**: `ZodObject`\<\{ `enabled`: `ZodDefault`\<`ZodBoolean`\>; `strategies`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `batchSize`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `name`: `ZodString`; `pattern`: `ZodString`; `priority`: `ZodDefault`\<`ZodNumber`\>; `schedule`: `ZodOptional`\<`ZodString`\>; `source`: `ZodEnum`\<\[`"database"`, `"api"`, `"precomputed"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `batchSize`: `number`; `enabled`: `boolean`; `name`: `string`; `pattern`: `string`; `priority`: `number`; `schedule?`: `string`; `source`: `"database"` \| `"api"` \| `"precomputed"`; \}, \{ `batchSize?`: `number`; `enabled?`: `boolean`; `name`: `string`; `pattern`: `string`; `priority?`: `number`; `schedule?`: `string`; `source`: `"database"` \| `"api"` \| `"precomputed"`; \}\>, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `enabled`: `boolean`; `strategies`: `object`[]; \}, \{ `enabled?`: `boolean`; `strategies?`: `object`[]; \}\>

Defined in: [src/types/cache.types.ts:124](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L124)
