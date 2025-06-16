[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/n8n.types](../README.md) / WorkflowNodeSchema

# Variable: WorkflowNodeSchema

> `const` **WorkflowNodeSchema**: `ZodObject`\<\{ `credentials`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodUnknown`\>\>; `disabled`: `ZodOptional`\<`ZodBoolean`\>; `id`: `ZodString`; `name`: `ZodString`; `notes`: `ZodOptional`\<`ZodString`\>; `parameters`: `ZodRecord`\<`ZodString`, `ZodUnknown`\>; `position`: `ZodArray`\<`ZodNumber`, `"many"`\>; `type`: `ZodString`; `typeVersion`: `ZodNumber`; \}, `"strip"`, `ZodTypeAny`, \{ `credentials?`: `Record`\<`string`, `unknown`\>; `disabled?`: `boolean`; `id`: `string`; `name`: `string`; `notes?`: `string`; `parameters`: `Record`\<`string`, `unknown`\>; `position`: `number`[]; `type`: `string`; `typeVersion`: `number`; \}, \{ `credentials?`: `Record`\<`string`, `unknown`\>; `disabled?`: `boolean`; `id`: `string`; `name`: `string`; `notes?`: `string`; `parameters`: `Record`\<`string`, `unknown`\>; `position`: `number`[]; `type`: `string`; `typeVersion`: `number`; \}\>

Defined in: [src/types/n8n.types.ts:8](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/n8n.types.ts#L8)
