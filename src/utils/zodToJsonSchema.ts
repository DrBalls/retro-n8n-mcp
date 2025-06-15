import { z } from 'zod';

/**
 * Convert Zod schema to JSON Schema for MCP compatibility
 */
export function zodToJsonSchema(schema: z.ZodSchema<any>): any {
  const def = (schema as any)._def;
  
  if (!def) {
    return { type: 'object', properties: {}, required: [] };
  }

  return zodTypeToJsonSchema(def);
}

function zodTypeToJsonSchema(def: any): any {
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

function handleString(def: any): any {
  const schema: any = { type: 'string' };
  
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

function handleNumber(def: any): any {
  const schema: any = { type: 'number' };
  
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

function handleArray(def: any): any {
  return {
    type: 'array',
    items: zodTypeToJsonSchema(def.type._def),
    ...(def.minLength && { minItems: def.minLength.value }),
    ...(def.maxLength && { maxItems: def.maxLength.value }),
    ...(def.description && { description: def.description })
  };
}

function handleObject(def: any): any {
  const properties: any = {};
  const required: string[] = [];
  
  for (const [key, value] of Object.entries(def.shape())) {
    const zodSchema = value as z.ZodSchema<any>;
    properties[key] = zodTypeToJsonSchema((zodSchema as any)._def);
    
    // Check if field is required (not optional)
    if ((zodSchema as any)._def.typeName !== 'ZodOptional') {
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

function handleEnum(def: any): any {
  return {
    enum: def.values,
    ...(def.description && { description: def.description })
  };
}

function handleUnion(def: any): any {
  return {
    oneOf: def.options.map((option: any) => zodTypeToJsonSchema(option._def)),
    ...(def.description && { description: def.description })
  };
}