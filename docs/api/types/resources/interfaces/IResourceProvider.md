[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/resources](../README.md) / IResourceProvider

# Interface: IResourceProvider

Defined in: [src/types/resources.ts:15](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/resources.ts#L15)

## Methods

### listResources()

> **listResources**(): `Promise`\<[`IResource`](IResource.md)[]\>

Defined in: [src/types/resources.ts:16](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/resources.ts#L16)

#### Returns

`Promise`\<[`IResource`](IResource.md)[]\>

***

### readResource()

> **readResource**(`uri`): `Promise`\<`any`\>

Defined in: [src/types/resources.ts:17](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/resources.ts#L17)

#### Parameters

##### uri

`string`

#### Returns

`Promise`\<`any`\>

***

### subscribeToResource()?

> `optional` **subscribeToResource**(`uri`, `callback`): () => `void`

Defined in: [src/types/resources.ts:18](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/resources.ts#L18)

#### Parameters

##### uri

`string`

##### callback

(`data`) => `void`

#### Returns

> (): `void`

##### Returns

`void`
