[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [services/version-control/WorkflowDiffer](../README.md) / WorkflowDiffer

# Class: WorkflowDiffer

Defined in: [src/services/version-control/WorkflowDiffer.ts:19](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/WorkflowDiffer.ts#L19)

WorkflowDiffer
Generates diffs between workflow versions and provides visualization

## Constructors

### Constructor

> **new WorkflowDiffer**(): `WorkflowDiffer`

#### Returns

`WorkflowDiffer`

## Methods

### areWorkflowsIdentical()

> **areWorkflowsIdentical**(`workflow1`, `workflow2`): `boolean`

Defined in: [src/services/version-control/WorkflowDiffer.ts:76](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/WorkflowDiffer.ts#L76)

Check if two workflows are identical

#### Parameters

##### workflow1

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

##### workflow2

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

#### Returns

`boolean`

***

### generateDiff()

> **generateDiff**(`fromWorkflow`, `toWorkflow`): `Promise`\<\{ `fromVersionId`: `string`; `generatedAt`: `string`; `operations`: `object`[]; `summary`: \{ `connectionsAdded`: `number`; `connectionsRemoved`: `number`; `nodesAdded`: `number`; `nodesModified`: `number`; `nodesRemoved`: `number`; `parametersChanged`: `number`; \}; `toVersionId`: `string`; \}\>

Defined in: [src/services/version-control/WorkflowDiffer.ts:24](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/WorkflowDiffer.ts#L24)

Generate a comprehensive diff between two workflows

#### Parameters

##### fromWorkflow

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

##### toWorkflow

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

#### Returns

`Promise`\<\{ `fromVersionId`: `string`; `generatedAt`: `string`; `operations`: `object`[]; `summary`: \{ `connectionsAdded`: `number`; `connectionsRemoved`: `number`; `nodesAdded`: `number`; `nodesModified`: `number`; `nodesRemoved`: `number`; `parametersChanged`: `number`; \}; `toVersionId`: `string`; \}\>

***

### generateDiffDescription()

> **generateDiffDescription**(`diff`): `string`[]

Defined in: [src/services/version-control/WorkflowDiffer.ts:43](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/WorkflowDiffer.ts#L43)

Generate human-readable diff description

#### Parameters

##### diff

###### fromVersionId

`string` = `N8nIdSchema`

###### generatedAt

`string` = `N8nTimestampSchema`

###### operations

`object`[] = `...`

###### summary

\{ `connectionsAdded`: `number`; `connectionsRemoved`: `number`; `nodesAdded`: `number`; `nodesModified`: `number`; `nodesRemoved`: `number`; `parametersChanged`: `number`; \} = `...`

###### summary.connectionsAdded

`number` = `...`

###### summary.connectionsRemoved

`number` = `...`

###### summary.nodesAdded

`number` = `...`

###### summary.nodesModified

`number` = `...`

###### summary.nodesRemoved

`number` = `...`

###### summary.parametersChanged

`number` = `...`

###### toVersionId

`string` = `N8nIdSchema`

#### Returns

`string`[]

***

### generateVisualDiff()

> **generateVisualDiff**(`diff`): `object`

Defined in: [src/services/version-control/WorkflowDiffer.ts:152](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/WorkflowDiffer.ts#L152)

Generate visual diff for display purposes

#### Parameters

##### diff

###### fromVersionId

`string` = `N8nIdSchema`

###### generatedAt

`string` = `N8nTimestampSchema`

###### operations

`object`[] = `...`

###### summary

\{ `connectionsAdded`: `number`; `connectionsRemoved`: `number`; `nodesAdded`: `number`; `nodesModified`: `number`; `nodesRemoved`: `number`; `parametersChanged`: `number`; \} = `...`

###### summary.connectionsAdded

`number` = `...`

###### summary.connectionsRemoved

`number` = `...`

###### summary.nodesAdded

`number` = `...`

###### summary.nodesModified

`number` = `...`

###### summary.nodesRemoved

`number` = `...`

###### summary.parametersChanged

`number` = `...`

###### toVersionId

`string` = `N8nIdSchema`

#### Returns

`object`

##### content

> **content**: `string`

##### type

> **type**: `"unified"` \| `"split"`

***

### getAddedNodes()

> **getAddedNodes**(`fromWorkflow`, `toWorkflow`): `any`[]

Defined in: [src/services/version-control/WorkflowDiffer.ts:93](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/WorkflowDiffer.ts#L93)

Get nodes that were added between versions

#### Parameters

##### fromWorkflow

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

##### toWorkflow

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

#### Returns

`any`[]

***

### getConnectionChanges()

> **getConnectionChanges**(`fromWorkflow`, `toWorkflow`): `object`

Defined in: [src/services/version-control/WorkflowDiffer.ts:133](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/WorkflowDiffer.ts#L133)

Get connection changes between workflows

#### Parameters

##### fromWorkflow

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

##### toWorkflow

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

#### Returns

`object`

##### added

> **added**: `any`[]

##### removed

> **removed**: `any`[]

***

### getModifiedNodes()

> **getModifiedNodes**(`fromWorkflow`, `toWorkflow`): `object`[]

Defined in: [src/services/version-control/WorkflowDiffer.ts:109](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/WorkflowDiffer.ts#L109)

Get nodes that were modified between versions

#### Parameters

##### fromWorkflow

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

##### toWorkflow

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

#### Returns

`object`[]

***

### getRemovedNodes()

> **getRemovedNodes**(`fromWorkflow`, `toWorkflow`): `any`[]

Defined in: [src/services/version-control/WorkflowDiffer.ts:101](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/WorkflowDiffer.ts#L101)

Get nodes that were removed between versions

#### Parameters

##### fromWorkflow

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

##### toWorkflow

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

#### Returns

`any`[]
