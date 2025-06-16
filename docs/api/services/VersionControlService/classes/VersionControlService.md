[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [services/VersionControlService](../README.md) / VersionControlService

# Class: VersionControlService

Defined in: [src/services/VersionControlService.ts:97](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/VersionControlService.ts#L97)

## Constructors

### Constructor

> **new VersionControlService**(`storage?`): `VersionControlService`

Defined in: [src/services/VersionControlService.ts:101](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/VersionControlService.ts#L101)

#### Parameters

##### storage?

`IVersionControlStorage`

#### Returns

`VersionControlService`

## Methods

### compareVersions()

> **compareVersions**(`fromVersionId`, `toVersionId`): `Promise`\<\{ `fromVersionId`: `string`; `generatedAt`: `string`; `operations`: `object`[]; `summary`: \{ `connectionsAdded`: `number`; `connectionsRemoved`: `number`; `nodesAdded`: `number`; `nodesModified`: `number`; `nodesRemoved`: `number`; `parametersChanged`: `number`; \}; `toVersionId`: `string`; \}\>

Defined in: [src/services/VersionControlService.ts:425](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/VersionControlService.ts#L425)

Compare two versions and generate a diff

#### Parameters

##### fromVersionId

`string`

##### toVersionId

`string`

#### Returns

`Promise`\<\{ `fromVersionId`: `string`; `generatedAt`: `string`; `operations`: `object`[]; `summary`: \{ `connectionsAdded`: `number`; `connectionsRemoved`: `number`; `nodesAdded`: `number`; `nodesModified`: `number`; `nodesRemoved`: `number`; `parametersChanged`: `number`; \}; `toVersionId`: `string`; \}\>

***

### createBranch()

> **createBranch**(`workflowId`, `branchName`, `options`): `Promise`\<\{ `baseVersionId`: `string`; `createdAt`: `string`; `createdBy?`: `string`; `description?`: `string`; `headVersionId`: `string`; `id`: `string`; `isActive`: `boolean`; `isMerged`: `boolean`; `mergedAt?`: `string`; `name`: `string`; `updatedAt`: `string`; `workflowId`: `string`; \}\>

Defined in: [src/services/VersionControlService.ts:206](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/VersionControlService.ts#L206)

Create a new branch

#### Parameters

##### workflowId

`string`

##### branchName

`string`

##### options

###### baseVersionId?

`string`

###### createdBy?

`string`

###### description?

`string`

#### Returns

`Promise`\<\{ `baseVersionId`: `string`; `createdAt`: `string`; `createdBy?`: `string`; `description?`: `string`; `headVersionId`: `string`; `id`: `string`; `isActive`: `boolean`; `isMerged`: `boolean`; `mergedAt?`: `string`; `name`: `string`; `updatedAt`: `string`; `workflowId`: `string`; \}\>

***

### createVersion()

> **createVersion**(`workflowId`, `workflow`, `options`): `Promise`\<\{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: ... \| ...; \}; `target`: \{ `id`: `string`; `inputIndex?`: ... \| ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

Defined in: [src/services/VersionControlService.ts:108](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/VersionControlService.ts#L108)

Create a new version of a workflow

#### Parameters

##### workflowId

`string`

##### workflow

###### active

`boolean` = `...`

###### connections

`Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\> = `...`

###### createdAt

`string` = `N8nTimestampSchema`

###### id

`string` = `N8nIdSchema`

###### name

`string` = `...`

###### nodes

`object`[] = `...`

###### settings?

`Record`\<`string`, `unknown`\> = `...`

###### staticData?

`Record`\<`string`, `unknown`\> = `...`

###### tags?

`string`[] = `...`

###### updatedAt

`string` = `N8nTimestampSchema`

###### versionId?

`string` = `...`

##### options

###### author?

`string`

###### branchName?

`string`

###### commitMessage?

`string`

###### isSnapshot?

`boolean`

###### parentVersionId?

`string`

###### tags?

`string`[]

###### versionIncrement?

`"major"` \| `"minor"` \| `"patch"`

#### Returns

`Promise`\<\{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: ... \| ...; \}; `target`: \{ `id`: `string`; `inputIndex?`: ... \| ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

***

### getVersionHistory()

> **getVersionHistory**(`workflowId`, `options`): `Promise`\<`object`[]\>

Defined in: [src/services/VersionControlService.ts:344](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/VersionControlService.ts#L344)

Get version history for a workflow

#### Parameters

##### workflowId

`string`

##### options

###### branchName?

`string`

###### includeSnapshots?

`boolean`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<`object`[]\>

***

### mergeBranch()

> **mergeBranch**(`workflowId`, `sourceBranchName`, `targetBranchName`, `options`): `Promise`\<\{ `conflicts`: `object`[]; `createdAt`: `string`; `hasConflicts`: `boolean`; `id`: `string`; `isAutoMergeable`: `boolean`; `mergedAt?`: `string`; `mergedWorkflow?`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `mergeStrategy`: `"manual"` \| `"auto"` \| `"ours"` \| `"theirs"`; `resolvedAt?`: `string`; `sourceBranchId`: `string`; `targetBranchId`: `string`; \}\>

Defined in: [src/services/VersionControlService.ts:263](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/VersionControlService.ts#L263)

Merge a branch into another branch

#### Parameters

##### workflowId

`string`

##### sourceBranchName

`string`

##### targetBranchName

`string`

##### options

###### author?

`string`

###### commitMessage?

`string`

###### deleteSourceBranch?

`boolean`

###### strategy?

`"manual"` \| `"auto"` \| `"ours"` \| `"theirs"`

#### Returns

`Promise`\<\{ `conflicts`: `object`[]; `createdAt`: `string`; `hasConflicts`: `boolean`; `id`: `string`; `isAutoMergeable`: `boolean`; `mergedAt?`: `string`; `mergedWorkflow?`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `mergeStrategy`: `"manual"` \| `"auto"` \| `"ours"` \| `"theirs"`; `resolvedAt?`: `string`; `sourceBranchId`: `string`; `targetBranchId`: `string`; \}\>

***

### rollbackToVersion()

> **rollbackToVersion**(`workflowId`, `targetVersionId`, `options`): `Promise`\<\{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: ... \| ...; \}; `target`: \{ `id`: `string`; `inputIndex?`: ... \| ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

Defined in: [src/services/VersionControlService.ts:373](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/VersionControlService.ts#L373)

Rollback to a specific version

#### Parameters

##### workflowId

`string`

##### targetVersionId

`string`

##### options

###### author?

`string`

###### branchName?

`string`

###### commitMessage?

`string`

###### createBackup?

`boolean`

#### Returns

`Promise`\<\{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: ... \| ...; \}; `target`: \{ `id`: `string`; `inputIndex?`: ... \| ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>
