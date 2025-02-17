
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import itemSchema from '../../schemas/itemSchema.json' assert { type: "json" };
import avatarSchema from '../../schemas/avatarSchema.json' assert { type: "json" };

export class SchemaValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.itemValidator = this.ajv.compile(itemSchema);
    this.avatarValidator = this.ajv.compile(avatarSchema);
  }

  validateItem(item) {
    const isValid = this.itemValidator(item);
    return {
      valid: isValid,
      errors: this.itemValidator.errors || []
    };
  }

  validateAvatar(avatar) {
    const isValid = this.avatarValidator(avatar);
    return {
      valid: isValid,
      errors: this.avatarValidator.errors || []
    };
  }
}
