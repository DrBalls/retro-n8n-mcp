[**n8n MCP Server API Documentation v0.1.0**](../../../README.md)

***

[n8n MCP Server API Documentation](../../../modules.md) / [utils/ErrorDiagnostics](../README.md) / IDiagnosticResult

# Interface: IDiagnosticResult

Defined in: [src/utils/ErrorDiagnostics.ts:3](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorDiagnostics.ts#L3)

## Properties

### confidence

> **confidence**: `"low"` \| `"medium"` \| `"high"`

Defined in: [src/utils/ErrorDiagnostics.ts:9](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorDiagnostics.ts#L9)

***

### documentation?

> `optional` **documentation**: `string`

Defined in: [src/utils/ErrorDiagnostics.ts:8](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorDiagnostics.ts#L8)

***

### errorType

> **errorType**: `string`

Defined in: [src/utils/ErrorDiagnostics.ts:4](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorDiagnostics.ts#L4)

***

### probableCause

> **probableCause**: `string`

Defined in: [src/utils/ErrorDiagnostics.ts:5](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorDiagnostics.ts#L5)

***

### relatedErrors?

> `optional` **relatedErrors**: `string`[]

Defined in: [src/utils/ErrorDiagnostics.ts:7](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorDiagnostics.ts#L7)

***

### suggestedFixes

> **suggestedFixes**: `string`[]

Defined in: [src/utils/ErrorDiagnostics.ts:6](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/utils/ErrorDiagnostics.ts#L6)
