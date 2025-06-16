[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/config.types](../README.md) / QueueConfigSchema

# Variable: QueueConfigSchema

> `const` **QueueConfigSchema**: `ZodObject`\<\{ `concurrency`: `ZodDefault`\<`ZodNumber`\>; `highWater`: `ZodDefault`\<`ZodNumber`\>; `interval`: `ZodDefault`\<`ZodNumber`\>; `intervalCap`: `ZodDefault`\<`ZodNumber`\>; `strategy`: `ZodDefault`\<`ZodEnum`\<\[`"fifo"`, `"lifo"`, `"priority"`\]\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `concurrency`: `number`; `highWater`: `number`; `interval`: `number`; `intervalCap`: `number`; `strategy`: `"priority"` \| `"fifo"` \| `"lifo"`; \}, \{ `concurrency?`: `number`; `highWater?`: `number`; `interval?`: `number`; `intervalCap?`: `number`; `strategy?`: `"priority"` \| `"fifo"` \| `"lifo"`; \}\>

Defined in: [src/types/config.types.ts:52](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/config.types.ts#L52)
