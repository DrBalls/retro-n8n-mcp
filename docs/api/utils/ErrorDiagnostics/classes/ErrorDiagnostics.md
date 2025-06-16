[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [utils/ErrorDiagnostics](../README.md) / ErrorDiagnostics

# Class: ErrorDiagnostics

Defined in: [src/utils/ErrorDiagnostics.ts:12](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorDiagnostics.ts#L12)

## Constructors

### Constructor

> **new ErrorDiagnostics**(): `ErrorDiagnostics`

#### Returns

`ErrorDiagnostics`

## Methods

### diagnose()

> `static` **diagnose**(`error`): [`IDiagnosticResult`](../interfaces/IDiagnosticResult.md)

Defined in: [src/utils/ErrorDiagnostics.ts:23](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorDiagnostics.ts#L23)

Diagnose an error and provide actionable suggestions

#### Parameters

##### error

`unknown`

#### Returns

[`IDiagnosticResult`](../interfaces/IDiagnosticResult.md)

***

### prioritizeFixes()

> `static` **prioritizeFixes**(`diagnosis`, `errorFrequency`): `string`[]

Defined in: [src/utils/ErrorDiagnostics.ts:410](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorDiagnostics.ts#L410)

Get suggested fix priority based on error frequency

#### Parameters

##### diagnosis

[`IDiagnosticResult`](../interfaces/IDiagnosticResult.md)

##### errorFrequency

`number`

#### Returns

`string`[]
