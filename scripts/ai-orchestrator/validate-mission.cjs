const fs = require('node:fs');
const path = require('node:path');

const baseDir = __dirname;
const missionSchemaPath = path.join(baseDir, 'schemas', 'mission.schema.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function jsonEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function describeType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
}

function matchesType(value, expected) {
  if (expected === 'null') return value === null;
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (expected === 'integer') return Number.isInteger(value);
  if (expected === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === expected;
}

function childPath(parent, key) {
  return /^[$A-Za-z_][A-Za-z0-9_]*$/.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;
}

function validateAgainstSchema(value, schema, currentPath = '$') {
  const errors = [];
  const expectedTypes = schema.type === undefined ? [] : (Array.isArray(schema.type) ? schema.type : [schema.type]);

  if (expectedTypes.length > 0 && !expectedTypes.some((expected) => matchesType(value, expected))) {
    errors.push({ path: currentPath, code: 'type', message: `expected ${expectedTypes.join(' or ')}, received ${describeType(value)}` });
    return errors;
  }

  if (Object.hasOwn(schema, 'const') && !jsonEqual(value, schema.const)) {
    errors.push({ path: currentPath, code: 'const', message: `must equal ${JSON.stringify(schema.const)}` });
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((allowed) => jsonEqual(value, allowed))) {
    errors.push({ path: currentPath, code: 'enum', message: `must be one of ${schema.enum.map((item) => JSON.stringify(item)).join(', ')}` });
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({ path: currentPath, code: 'minLength', message: `must contain at least ${schema.minLength} characters` });
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({ path: currentPath, code: 'maxLength', message: `must contain at most ${schema.maxLength} characters` });
    }
    if (schema.pattern !== undefined && !(new RegExp(schema.pattern).test(value))) {
      errors.push({ path: currentPath, code: 'pattern', message: `must match pattern ${schema.pattern}` });
    }
    if (schema.format === 'date-time') {
      const timestamp = Date.parse(value);
      if (!/^\d{4}-\d{2}-\d{2}T/.test(value) || Number.isNaN(timestamp)) {
        errors.push({ path: currentPath, code: 'format', message: 'must be a valid date-time' });
      }
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path: currentPath, code: 'minimum', message: `must be greater than or equal to ${schema.minimum}` });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path: currentPath, code: 'maximum', message: `must be less than or equal to ${schema.maximum}` });
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({ path: currentPath, code: 'minItems', message: `must contain at least ${schema.minItems} items` });
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({ path: currentPath, code: 'maxItems', message: `must contain at most ${schema.maxItems} items` });
    }
    if (schema.uniqueItems === true) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) {
        errors.push({ path: currentPath, code: 'uniqueItems', message: 'must contain unique items' });
      }
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateAgainstSchema(item, schema.items, `${currentPath}[${index}]`));
      });
    }
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const properties = schema.properties || {};
    for (const required of schema.required || []) {
      if (!Object.hasOwn(value, required)) {
        errors.push({ path: currentPath, code: 'required', message: `missing required property ${JSON.stringify(required)}` });
      }
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(properties, key)) {
          errors.push({ path: childPath(currentPath, key), code: 'additionalProperties', message: 'unexpected property' });
        }
      }
    }
    for (const [key, propertySchema] of Object.entries(properties)) {
      if (Object.hasOwn(value, key)) {
        errors.push(...validateAgainstSchema(value[key], propertySchema, childPath(currentPath, key)));
      }
    }
  }

  return errors;
}

function validateMission(mission) {
  return validateAgainstSchema(mission, readJson(missionSchemaPath));
}

function formatErrors(errors) {
  return errors.map((error) => `${error.path}: ${error.message}`).join('\n');
}

function runCli(argv) {
  const target = argv[0];
  if (!target) {
    console.error('Usage: node scripts/ai-orchestrator/validate-mission.cjs <mission.json>');
    return 2;
  }

  const resolved = path.resolve(target);
  let mission;
  try {
    mission = readJson(resolved);
  } catch (error) {
    console.error(`FAIL ${target}`);
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }

  const errors = validateMission(mission);
  if (errors.length > 0) {
    console.error(`FAIL ${target}`);
    console.error(formatErrors(errors));
    return 1;
  }

  console.log(`PASS ${target}`);
  return 0;
}

if (require.main === module) {
  process.exitCode = runCli(process.argv.slice(2));
}

module.exports = {
  formatErrors,
  readJson,
  runCli,
  validateAgainstSchema,
  validateMission,
};
