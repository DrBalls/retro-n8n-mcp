[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [services/version-control/VersionControlManager](../README.md) / VersionControlManager

# Class: VersionControlManager

Defined in: [src/services/version-control/VersionControlManager.ts:99](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L99)

Version Control Manager
Provides Git-like version control for n8n workflows

## Constructors

### Constructor

> **new VersionControlManager**(`storage?`): `VersionControlManager`

Defined in: [src/services/version-control/VersionControlManager.ts:104](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L104)

#### Parameters

##### storage?

[`IVersionStorage`](../interfaces/IVersionStorage.md)

#### Returns

`VersionControlManager`

## Methods

### createBranch()

> **createBranch**(`workflowId`, `branchName`, `options`): `Promise`\<\{ `baseVersionId`: `string`; `createdAt`: `string`; `createdBy?`: `string`; `description?`: `string`; `headVersionId`: `string`; `id`: `string`; `isActive`: `boolean`; `isMerged`: `boolean`; `mergedAt?`: `string`; `name`: `string`; `updatedAt`: `string`; `workflowId`: `string`; \}\>

Defined in: [src/services/version-control/VersionControlManager.ts:266](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L266)

Create a new branch

#### Parameters

##### workflowId

`string`

##### branchName

`string`

##### options

###### author?

`string`

###### description?

`string`

###### fromBranch?

`string`

###### fromVersionId?

`string`

#### Returns

`Promise`\<\{ `baseVersionId`: `string`; `createdAt`: `string`; `createdBy?`: `string`; `description?`: `string`; `headVersionId`: `string`; `id`: `string`; `isActive`: `boolean`; `isMerged`: `boolean`; `mergedAt?`: `string`; `name`: `string`; `updatedAt`: `string`; `workflowId`: `string`; \}\>

***

### createVersion()

> **createVersion**(`workflowId`, `workflow`, `options`): `Promise`\<\{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: ... \| ...; \}; `target`: \{ `id`: `string`; `inputIndex?`: ... \| ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

Defined in: [src/services/version-control/VersionControlManager.ts:184](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L184)

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

###### branch?

`string`

###### isSnapshot?

`boolean`

###### message?

`string`

###### tags?

`string`[]

###### versionType?

`"major"` \| `"minor"` \| `"patch"` \| `"auto"`

#### Returns

`Promise`\<\{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: ... \| ...; \}; `target`: \{ `id`: `string`; `inputIndex?`: ... \| ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

***

### generateVersionDiff()

> **generateVersionDiff**(`fromVersionId`, `toVersionId`): `Promise`\<\{ `fromVersionId`: `string`; `generatedAt`: `string`; `operations`: `object`[]; `summary`: \{ `connectionsAdded`: `number`; `connectionsRemoved`: `number`; `nodesAdded`: `number`; `nodesModified`: `number`; `nodesRemoved`: `number`; `parametersChanged`: `number`; \}; `toVersionId`: `string`; \}\>

Defined in: [src/services/version-control/VersionControlManager.ts:566](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L566)

Generate diff between two versions

#### Parameters

##### fromVersionId

`string`

##### toVersionId

`string`

#### Returns

`Promise`\<\{ `fromVersionId`: `string`; `generatedAt`: `string`; `operations`: `object`[]; `summary`: \{ `connectionsAdded`: `number`; `connectionsRemoved`: `number`; `nodesAdded`: `number`; `nodesModified`: `number`; `nodesRemoved`: `number`; `parametersChanged`: `number`; \}; `toVersionId`: `string`; \}\>

***

### getVersionHistory()

> **getVersionHistory**(`workflowId`, `options`): `Promise`\<`object`[]\>

Defined in: [src/services/version-control/VersionControlManager.ts:521](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L521)

Get version history

#### Parameters

##### workflowId

`string`

##### options

###### author?

`string`

###### branch?

`string`

###### limit?

`number`

###### offset?

`number`

###### since?

`number`

###### until?

`number`

#### Returns

`Promise`\<`object`[]\>

***

### initializeWorkflow()

> **initializeWorkflow**(`workflowId`, `workflow`, `settings?`): `Promise`\<\{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: ... \| ...; \}; `target`: \{ `id`: `string`; `inputIndex?`: ... \| ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

Defined in: [src/services/version-control/VersionControlManager.ts:112](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L112)

Initialize version control for a workflow

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

##### settings?

`Partial`\<\{ `allowBranching`: `boolean`; `autoSnapshot`: `boolean`; `autoVersion`: `boolean`; `defaultBranch`: `string`; `maxVersions`: `number`; `requireCommitMessage`: `boolean`; `retentionDays`: `number`; `snapshotInterval`: `number`; `versioningStrategy`: `"timestamp"` \| `"semantic"` \| `"sequential"`; `workflowId`: `string`; \}\>

#### Returns

`Promise`\<\{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: ... \| ...; \}; `target`: \{ `id`: `string`; `inputIndex?`: ... \| ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

***

### mergeBranch()

> **mergeBranch**(`workflowId`, `sourceBranch`, `targetBranch`, `options`): `Promise`\<\{ `conflicts`: `object`[]; `createdAt`: `string`; `hasConflicts`: `boolean`; `id`: `string`; `isAutoMergeable`: `boolean`; `mergedAt?`: `string`; `mergedWorkflow?`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `mergeStrategy`: `"manual"` \| `"auto"` \| `"ours"` \| `"theirs"`; `resolvedAt?`: `string`; `sourceBranchId`: `string`; `targetBranchId`: `string`; \}\>

Defined in: [src/services/version-control/VersionControlManager.ts:335](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L335)

Merge a branch into another branch

#### Parameters

##### workflowId

`string`

##### sourceBranch

`string`

##### targetBranch

`string`

##### options

###### author?

`string`

###### autoResolve?

`boolean`

###### message?

`string`

###### strategy?

`"manual"` \| `"auto"` \| `"ours"` \| `"theirs"`

#### Returns

`Promise`\<\{ `conflicts`: `object`[]; `createdAt`: `string`; `hasConflicts`: `boolean`; `id`: `string`; `isAutoMergeable`: `boolean`; `mergedAt?`: `string`; `mergedWorkflow?`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `mergeStrategy`: `"manual"` \| `"auto"` \| `"ours"` \| `"theirs"`; `resolvedAt?`: `string`; `sourceBranchId`: `string`; `targetBranchId`: `string`; \}\>

***

### rollback()

> **rollback**(`workflowId`, `targetVersionId`, `options`): `Promise`\<\{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: ... \| ...; \}; `target`: \{ `id`: `string`; `inputIndex?`: ... \| ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

Defined in: [src/services/version-control/VersionControlManager.ts:459](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L459)

Rollback to a specific version

#### Parameters

##### workflowId

`string`

##### targetVersionId

`string`

##### options

###### author?

`string`

###### branch?

`string`

###### createBackup?

`boolean`

###### message?

`string`

#### Returns

`Promise`\<\{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: ... \| ...; \}; `target`: \{ `id`: `string`; `inputIndex?`: ... \| ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>
