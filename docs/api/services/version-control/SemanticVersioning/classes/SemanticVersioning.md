[**n8n MCP Server API Documentation v0.1.0**](../../../../README.md)

***

[n8n MCP Server API Documentation](../../../../modules.md) / [services/version-control/SemanticVersioning](../README.md) / SemanticVersioning

# Class: SemanticVersioning

Defined in: [src/services/version-control/SemanticVersioning.ts:7](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L7)

Utility class for semantic versioning operations
Implements semantic versioning (semver) specification for workflow versions

## Constructors

### Constructor

> **new SemanticVersioning**(): `SemanticVersioning`

#### Returns

`SemanticVersioning`

## Methods

### compare()

> `static` **compare**(`a`, `b`): `number`

Defined in: [src/services/version-control/SemanticVersioning.ts:112](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L112)

Compare two semantic versions
Returns: -1 if a < b, 0 if a === b, 1 if a > b

#### Parameters

##### a

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

##### b

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

#### Returns

`number`

***

### createInitialVersion()

> `static` **createInitialVersion**(): `object`

Defined in: [src/services/version-control/SemanticVersioning.ts:240](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L240)

Create initial version

#### Returns

`object`

##### build?

> `optional` **build**: `string`

##### major

> **major**: `number`

##### minor

> **minor**: `number`

##### patch

> **patch**: `number`

##### prerelease?

> `optional` **prerelease**: `string`

***

### getLatest()

> `static` **getLatest**(`versions`): `null` \| \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}

Defined in: [src/services/version-control/SemanticVersioning.ts:295](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L295)

Get latest version from array

#### Parameters

##### versions

`object`[]

#### Returns

`null` \| \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}

***

### getLatestStable()

> `static` **getLatestStable**(`versions`): `null` \| \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}

Defined in: [src/services/version-control/SemanticVersioning.ts:306](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L306)

Get latest stable version from array

#### Parameters

##### versions

`object`[]

#### Returns

`null` \| \{ `build?`: `string`; `major`: `number`; `minor`: `number`; `patch`: `number`; `prerelease?`: `string`; \}

***

### getNextVersion()

> `static` **getNextVersion**(`currentVersion`, `changeType`, `changes?`): `object`

Defined in: [src/services/version-control/SemanticVersioning.ts:210](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L210)

Get the next version based on current version and change type

#### Parameters

##### currentVersion

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

##### changeType

`"major"` | `"minor"` | `"patch"` | `"prerelease"` | `"auto"`

##### changes?

###### breaking

`boolean`

###### features

`number`

###### fixes

`number`

#### Returns

`object`

##### build?

> `optional` **build**: `string`

##### major

> **major**: `number`

##### minor

> **minor**: `number`

##### patch

> **patch**: `number`

##### prerelease?

> `optional` **prerelease**: `string`

***

### getStableVersion()

> `static` **getStableVersion**(`version`): `object`

Defined in: [src/services/version-control/SemanticVersioning.ts:263](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L263)

Get stable version (remove prerelease and build metadata)

#### Parameters

##### version

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

#### Returns

`object`

##### build?

> `optional` **build**: `string`

##### major

> **major**: `number`

##### minor

> **minor**: `number`

##### patch

> **patch**: `number`

##### prerelease?

> `optional` **prerelease**: `string`

***

### increment()

> `static` **increment**(`version`, `type`, `prereleaseIdentifier?`): `object`

Defined in: [src/services/version-control/SemanticVersioning.ts:59](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L59)

Increment version based on type

#### Parameters

##### version

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

##### type

`"major"` | `"minor"` | `"patch"` | `"prerelease"`

##### prereleaseIdentifier?

`string`

#### Returns

`object`

##### build?

> `optional` **build**: `string`

##### major

> **major**: `number`

##### minor

> **minor**: `number`

##### patch

> **patch**: `number`

##### prerelease?

> `optional` **prerelease**: `string`

***

### isEqual()

> `static` **isEqual**(`a`, `b`): `boolean`

Defined in: [src/services/version-control/SemanticVersioning.ts:160](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L160)

Check if version a equals version b

#### Parameters

##### a

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

##### b

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

#### Returns

`boolean`

***

### isGreater()

> `static` **isGreater**(`a`, `b`): `boolean`

Defined in: [src/services/version-control/SemanticVersioning.ts:146](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L146)

Check if version a is greater than version b

#### Parameters

##### a

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

##### b

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

#### Returns

`boolean`

***

### isLess()

> `static` **isLess**(`a`, `b`): `boolean`

Defined in: [src/services/version-control/SemanticVersioning.ts:153](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L153)

Check if version a is less than version b

#### Parameters

##### a

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

##### b

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

#### Returns

`boolean`

***

### isPrerelease()

> `static` **isPrerelease**(`version`): `boolean`

Defined in: [src/services/version-control/SemanticVersioning.ts:274](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L274)

Check if version is prerelease

#### Parameters

##### version

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

#### Returns

`boolean`

***

### isStable()

> `static` **isStable**(`version`): `boolean`

Defined in: [src/services/version-control/SemanticVersioning.ts:281](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L281)

Check if version is stable (not prerelease)

#### Parameters

##### version

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

#### Returns

`boolean`

***

### isValidVersionString()

> `static` **isValidVersionString**(`versionString`): `boolean`

Defined in: [src/services/version-control/SemanticVersioning.ts:251](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L251)

Validate version string format

#### Parameters

##### versionString

`string`

#### Returns

`boolean`

***

### parse()

> `static` **parse**(`versionString`): `object`

Defined in: [src/services/version-control/SemanticVersioning.ts:12](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L12)

Parse a version string into semantic version components

#### Parameters

##### versionString

`string`

#### Returns

`object`

##### build?

> `optional` **build**: `string`

##### major

> **major**: `number`

##### minor

> **minor**: `number`

##### patch

> **patch**: `number`

##### prerelease?

> `optional` **prerelease**: `string`

***

### satisfiesRange()

> `static` **satisfiesRange**(`version`, `range`): `boolean`

Defined in: [src/services/version-control/SemanticVersioning.ts:167](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L167)

Check if version satisfies a range (simplified implementation)

#### Parameters

##### version

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

##### range

`string`

#### Returns

`boolean`

***

### sort()

> `static` **sort**(`versions`): `object`[]

Defined in: [src/services/version-control/SemanticVersioning.ts:288](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L288)

Sort versions in ascending order

#### Parameters

##### versions

`object`[]

#### Returns

`object`[]

***

### toString()

> `static` **toString**(`version`): `string`

Defined in: [src/services/version-control/SemanticVersioning.ts:42](https://github.com/DrBalls/retro-n8n-mcp/blob/5b51d2f27332cd66340761ded9087bbb57d7ae33/src/services/version-control/SemanticVersioning.ts#L42)

Convert semantic version to string representation

#### Parameters

##### version

###### build?

`string` = `...`

###### major

`number` = `...`

###### minor

`number` = `...`

###### patch

`number` = `...`

###### prerelease?

`string` = `...`

#### Returns

`string`
