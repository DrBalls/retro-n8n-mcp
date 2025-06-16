[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/version-control.types](../README.md) / VersionControlSettingsSchema

# Variable: VersionControlSettingsSchema

> `const` **VersionControlSettingsSchema**: `ZodObject`\<\{ `allowBranching`: `ZodDefault`\<`ZodBoolean`\>; `autoSnapshot`: `ZodDefault`\<`ZodBoolean`\>; `autoVersion`: `ZodDefault`\<`ZodBoolean`\>; `defaultBranch`: `ZodDefault`\<`ZodString`\>; `maxVersions`: `ZodDefault`\<`ZodNumber`\>; `requireCommitMessage`: `ZodDefault`\<`ZodBoolean`\>; `retentionDays`: `ZodDefault`\<`ZodNumber`\>; `snapshotInterval`: `ZodDefault`\<`ZodNumber`\>; `versioningStrategy`: `ZodDefault`\<`ZodEnum`\<\[`"semantic"`, `"sequential"`, `"timestamp"`\]\>\>; `workflowId`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `allowBranching`: `boolean`; `autoSnapshot`: `boolean`; `autoVersion`: `boolean`; `defaultBranch`: `string`; `maxVersions`: `number`; `requireCommitMessage`: `boolean`; `retentionDays`: `number`; `snapshotInterval`: `number`; `versioningStrategy`: `"timestamp"` \| `"semantic"` \| `"sequential"`; `workflowId`: `string`; \}, \{ `allowBranching?`: `boolean`; `autoSnapshot?`: `boolean`; `autoVersion?`: `boolean`; `defaultBranch?`: `string`; `maxVersions?`: `number`; `requireCommitMessage?`: `boolean`; `retentionDays?`: `number`; `snapshotInterval?`: `number`; `versioningStrategy?`: `"timestamp"` \| `"semantic"` \| `"sequential"`; `workflowId`: `string`; \}\>

Defined in: [src/types/version-control.types.ts:138](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/version-control.types.ts#L138)
