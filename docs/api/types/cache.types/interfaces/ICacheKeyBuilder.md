[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [types/cache.types](../README.md) / ICacheKeyBuilder

# Interface: ICacheKeyBuilder

Defined in: [src/types/cache.types.ts:179](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L179)

## Methods

### credential()

> **credential**(`id`): `string`

Defined in: [src/types/cache.types.ts:182](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L182)

#### Parameters

##### id

`string`

#### Returns

`string`

***

### custom()

> **custom**(`namespace`, `key`): `string`

Defined in: [src/types/cache.types.ts:186](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L186)

#### Parameters

##### namespace

`string`

##### key

`string`

#### Returns

`string`

***

### execution()

> **execution**(`id`): `string`

Defined in: [src/types/cache.types.ts:181](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L181)

#### Parameters

##### id

`string`

#### Returns

`string`

***

### metrics()

> **metrics**(`type`, `timeframe`): `string`

Defined in: [src/types/cache.types.ts:185](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L185)

#### Parameters

##### type

`string`

##### timeframe

`string`

#### Returns

`string`

***

### node()

> **node**(`type`, `version`): `string`

Defined in: [src/types/cache.types.ts:183](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L183)

#### Parameters

##### type

`string`

##### version

`number`

#### Returns

`string`

***

### user()

> **user**(`id`): `string`

Defined in: [src/types/cache.types.ts:184](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L184)

#### Parameters

##### id

`string`

#### Returns

`string`

***

### workflow()

> **workflow**(`id`): `string`

Defined in: [src/types/cache.types.ts:180](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/types/cache.types.ts#L180)

#### Parameters

##### id

`string`

#### Returns

`string`
