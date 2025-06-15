/**
 * Convert Zod schema to JSON Schema for MCP compatibility
 */
export function zodToJsonSchema(schema) {
    const def = schema._def;
    if (!def) {
        return { type: 'object', properties: {}, required: [] };
    }
    return zodTypeToJsonSchema(def);
}
function zodTypeToJsonSchema(def) {
    switch (def.typeName) {
        case 'ZodString':
            return handleString(def);
        case 'ZodNumber':
            return handleNumber(def);
        case 'ZodBoolean':
            return { type: 'boolean' };
        case 'ZodArray':
            return handleArray(def);
        case 'ZodObject':
            return handleObject(def);
        case 'ZodEnum':
            return handleEnum(def);
        case 'ZodUnion':
            return handleUnion(def);
        case 'ZodOptional':
            return zodTypeToJsonSchema(def.innerType._def);
        case 'ZodNullable':
            return {
                oneOf: [
                    zodTypeToJsonSchema(def.innerType._def),
                    { type: 'null' }
                ]
            };
        case 'ZodDefault':
            const schema = zodTypeToJsonSchema(def.innerType._def);
            schema.default = def.defaultValue();
            return schema;
        case 'ZodLiteral':
            return { const: def.value };
        case 'ZodRecord':
            return {
                type: 'object',
                additionalProperties: zodTypeToJsonSchema(def.valueType._def)
            };
        default:
            // Fallback for unknown types
            return { type: 'object', properties: {}, required: [] };
    }
}
function handleString(def) {
    const schema = { type: 'string' };
    if (def.checks) {
        for (const check of def.checks) {
            switch (check.kind) {
                case 'min':
                    schema.minLength = check.value;
                    break;
                case 'max':
                    schema.maxLength = check.value;
                    break;
                case 'email':
                    schema.format = 'email';
                    break;
                case 'url':
                    schema.format = 'uri';
                    break;
                case 'regex':
                    schema.pattern = check.regex.source;
                    break;
            }
        }
    }
    if (def.description) {
        schema.description = def.description;
    }
    return schema;
}
function handleNumber(def) {
    const schema = { type: 'number' };
    if (def.checks) {
        for (const check of def.checks) {
            switch (check.kind) {
                case 'min':
                    schema.minimum = check.value;
                    break;
                case 'max':
                    schema.maximum = check.value;
                    break;
                case 'int':
                    schema.type = 'integer';
                    break;
            }
        }
    }
    if (def.description) {
        schema.description = def.description;
    }
    return schema;
}
function handleArray(def) {
    return {
        type: 'array',
        items: zodTypeToJsonSchema(def.type._def),
        ...(def.minLength && { minItems: def.minLength.value }),
        ...(def.maxLength && { maxItems: def.maxLength.value }),
        ...(def.description && { description: def.description })
    };
}
function handleObject(def) {
    const properties = {};
    const required = [];
    for (const [key, value] of Object.entries(def.shape())) {
        const zodSchema = value;
        properties[key] = zodTypeToJsonSchema(zodSchema._def);
        // Check if field is required (not optional)
        if (zodSchema._def.typeName !== 'ZodOptional') {
            required.push(key);
        }
    }
    return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
        additionalProperties: def.unknownKeys === 'strict' ? false : true,
        ...(def.description && { description: def.description })
    };
}
function handleEnum(def) {
    return {
        enum: def.values,
        ...(def.description && { description: def.description })
    };
}
function handleUnion(def) {
    return {
        oneOf: def.options.map((option) => zodTypeToJsonSchema(option._def)),
        ...(def.description && { description: def.description })
    };
}
//# sourceMappingURL=zodToJsonSchema.js.map