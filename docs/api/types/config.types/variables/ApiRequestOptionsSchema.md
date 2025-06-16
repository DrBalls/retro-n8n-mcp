[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/config.types](../README.md) / ApiRequestOptionsSchema

# Variable: ApiRequestOptionsSchema

> `const` **ApiRequestOptionsSchema**: `ZodObject`\<\{ `headers`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodString`\>\>; `priority`: `ZodOptional`\<`ZodNumber`\>; `signal`: `ZodOptional`\<`ZodType`\<`AbortSignal`, `ZodTypeDef`, `AbortSignal`\>\>; `skipCache`: `ZodOptional`\<`ZodBoolean`\>; `timeout`: `ZodOptional`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `headers?`: `Record`\<`string`, `string`\>; `priority?`: `number`; `signal?`: `AbortSignal`; `skipCache?`: `boolean`; `timeout?`: `number`; \}, \{ `headers?`: `Record`\<`string`, `string`\>; `priority?`: `number`; `signal?`: `AbortSignal`; `skipCache?`: `boolean`; `timeout?`: `number`; \}\>

Defined in: [src/types/config.types.ts:70](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/config.types.ts#L70)
