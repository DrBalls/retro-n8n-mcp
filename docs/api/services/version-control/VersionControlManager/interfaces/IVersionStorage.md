[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [services/version-control/VersionControlManager](../README.md) / IVersionStorage

# Interface: IVersionStorage

Defined in: [src/services/version-control/VersionControlManager.ts:19](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L19)

## Methods

### deleteBranch()

> **deleteBranch**(`branchId`): `Promise`\<`void`\>

Defined in: [src/services/version-control/VersionControlManager.ts:28](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L28)

#### Parameters

##### branchId

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteVersion()

> **deleteVersion**(`versionId`): `Promise`\<`void`\>

Defined in: [src/services/version-control/VersionControlManager.ts:23](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L23)

#### Parameters

##### versionId

`string`

#### Returns

`Promise`\<`void`\>

***

### getBranch()

> **getBranch**(`branchId`): `Promise`\<`null` \| \{ `baseVersionId`: `string`; `createdAt`: `string`; `createdBy?`: `string`; `description?`: `string`; `headVersionId`: `string`; `id`: `string`; `isActive`: `boolean`; `isMerged`: `boolean`; `mergedAt?`: `string`; `name`: `string`; `updatedAt`: `string`; `workflowId`: `string`; \}\>

Defined in: [src/services/version-control/VersionControlManager.ts:26](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L26)

#### Parameters

##### branchId

`string`

#### Returns

`Promise`\<`null` \| \{ `baseVersionId`: `string`; `createdAt`: `string`; `createdBy?`: `string`; `description?`: `string`; `headVersionId`: `string`; `id`: `string`; `isActive`: `boolean`; `isMerged`: `boolean`; `mergedAt?`: `string`; `name`: `string`; `updatedAt`: `string`; `workflowId`: `string`; \}\>

***

### getBranches()

> **getBranches**(`workflowId`): `Promise`\<`object`[]\>

Defined in: [src/services/version-control/VersionControlManager.ts:27](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L27)

#### Parameters

##### workflowId

`string`

#### Returns

`Promise`\<`object`[]\>

***

### getSettings()

> **getSettings**(`workflowId`): `Promise`\<`null` \| \{ `allowBranching`: `boolean`; `autoSnapshot`: `boolean`; `autoVersion`: `boolean`; `defaultBranch`: `string`; `maxVersions`: `number`; `requireCommitMessage`: `boolean`; `retentionDays`: `number`; `snapshotInterval`: `number`; `versioningStrategy`: `"timestamp"` \| `"semantic"` \| `"sequential"`; `workflowId`: `string`; \}\>

Defined in: [src/services/version-control/VersionControlManager.ts:30](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L30)

#### Parameters

##### workflowId

`string`

#### Returns

`Promise`\<`null` \| \{ `allowBranching`: `boolean`; `autoSnapshot`: `boolean`; `autoVersion`: `boolean`; `defaultBranch`: `string`; `maxVersions`: `number`; `requireCommitMessage`: `boolean`; `retentionDays`: `number`; `snapshotInterval`: `number`; `versioningStrategy`: `"timestamp"` \| `"semantic"` \| `"sequential"`; `workflowId`: `string`; \}\>

***

### getVersion()

> **getVersion**(`versionId`): `Promise`\<`null` \| \{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

Defined in: [src/services/version-control/VersionControlManager.ts:21](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L21)

#### Parameters

##### versionId

`string`

#### Returns

`Promise`\<`null` \| \{ `author?`: `string`; `branchName`: `string`; `changes`: `object`[]; `commitMessage?`: `string`; `createdAt`: `string`; `id`: `string`; `isSnapshot`: `boolean`; `metadata?`: `Record`\<`string`, `unknown`\>; `parentVersionId?`: `null` \| `string`; `tags`: `object`[]; `version`: \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}; `versionString`: `string`; `workflow`: \{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: ...; `outputIndex?`: ...; \}; `target`: \{ `id`: ...; `inputIndex?`: ...; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \}; `workflowId`: `string`; \}\>

***

### getVersions()

> **getVersions**(`workflowId`, `branch?`): `Promise`\<`object`[]\>

Defined in: [src/services/version-control/VersionControlManager.ts:22](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L22)

#### Parameters

##### workflowId

`string`

##### branch?

`string`

#### Returns

`Promise`\<`object`[]\>

***

### saveBranch()

> **saveBranch**(`branch`): `Promise`\<`void`\>

Defined in: [src/services/version-control/VersionControlManager.ts:25](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L25)

#### Parameters

##### branch

###### baseVersionId

`string` = `N8nIdSchema`

###### createdAt

`string` = `N8nTimestampSchema`

###### createdBy?

`string` = `...`

###### description?

`string` = `...`

###### headVersionId

`string` = `N8nIdSchema`

###### id

`string` = `N8nIdSchema`

###### isActive

`boolean` = `...`

###### isMerged

`boolean` = `...`

###### mergedAt?

`string` = `...`

###### name

`string` = `...`

###### updatedAt

`string` = `N8nTimestampSchema`

###### workflowId

`string` = `N8nIdSchema`

#### Returns

`Promise`\<`void`\>

***

### saveSettings()

> **saveSettings**(`settings`): `Promise`\<`void`\>

Defined in: [src/services/version-control/VersionControlManager.ts:31](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L31)

#### Parameters

##### settings

###### allowBranching

`boolean` = `...`

###### autoSnapshot

`boolean` = `...`

###### autoVersion

`boolean` = `...`

###### defaultBranch

`string` = `...`

###### maxVersions

`number` = `...`

###### requireCommitMessage

`boolean` = `...`

###### retentionDays

`number` = `...`

###### snapshotInterval

`number` = `...`

###### versioningStrategy

`"timestamp"` \| `"semantic"` \| `"sequential"` = `...`

###### workflowId

`string` = `N8nIdSchema`

#### Returns

`Promise`\<`void`\>

***

### saveVersion()

> **saveVersion**(`version`): `Promise`\<`void`\>

Defined in: [src/services/version-control/VersionControlManager.ts:20](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/VersionControlManager.ts#L20)

#### Parameters

##### version

###### author?

`string` = `...`

###### branchName

`string` = `...`

###### changes

`object`[] = `...`

###### commitMessage?

`string` = `...`

###### createdAt

`string` = `N8nTimestampSchema`

###### id

`string` = `N8nIdSchema`

###### isSnapshot

`boolean` = `...`

###### metadata?

`Record`\<`string`, `unknown`\> = `...`

###### parentVersionId?

`null` \| `string` = `...`

###### tags

`object`[] = `...`

###### version

\{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \} = `SemanticVersionSchema`

###### version.build?

`string` = `...`

###### version.major

`number` = `...`

###### version.minor

`number` = `...`

###### version.patch

`number` = `...`

###### version.prerelease?

`string` = `...`

###### versionString

`string` = `...`

###### workflow

\{ `active`: `boolean`; `connections`: `Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\>; `createdAt`: `string`; `id`: `string`; `name`: `string`; `nodes`: `object`[]; `settings?`: `Record`\<`string`, `unknown`\>; `staticData?`: `Record`\<`string`, `unknown`\>; `tags?`: `string`[]; `updatedAt`: `string`; `versionId?`: `string`; \} = `WorkflowSchema`

###### workflow.active

`boolean` = `...`

###### workflow.connections

`Record`\<`string`, `Record`\<`string`, (\{ `source`: \{ `id`: `string`; `outputIndex?`: `number`; \}; `target`: \{ `id`: `string`; `inputIndex?`: `number`; \}; \} \| \{ `index`: `number`; `node`: `string`; `type`: `string`; \})[][]\>\> = `...`

###### workflow.createdAt

`string` = `N8nTimestampSchema`

###### workflow.id

`string` = `N8nIdSchema`

###### workflow.name

`string` = `...`

###### workflow.nodes

`object`[] = `...`

###### workflow.settings?

`Record`\<`string`, `unknown`\> = `...`

###### workflow.staticData?

`Record`\<`string`, `unknown`\> = `...`

###### workflow.tags?

`string`[] = `...`

###### workflow.updatedAt

`string` = `N8nTimestampSchema`

###### workflow.versionId?

`string` = `...`

###### workflowId

`string` = `N8nIdSchema`

#### Returns

`Promise`\<`void`\>
