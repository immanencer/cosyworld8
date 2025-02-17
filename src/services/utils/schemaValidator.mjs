
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import itemSchema from '../../schemas/itemSchema.json' assert { type: "json" };

export class SchemaValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.itemValidator = this.ajv.compile(itemSchema);
  }

  validateItem(item) {
    const isValid = this.itemValidator(item);
    return {
      valid: isValid,
      errors: this.itemValidator.errors || []
    };
  }
}
