
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import itemSchema from '../../schemas/itemSchema.json' with { type: "json" };
import avatarSchema from '../../schemas/avatarSchema.json' with { type: "json" };
import locationSchema from '../../schemas/locationSchema.json' with { type: "json" };
import questSchema from '../../schemas/questSchema.json' with { type: "json" };

export class SchemaValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.itemValidator = this.ajv.compile(itemSchema);
    this.avatarValidator = this.ajv.compile(avatarSchema);
    this.locationValidator = this.ajv.compile(locationSchema);
    this.questValidator = this.ajv.compile(questSchema);
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

  validateLocation(location) {
    const isValid = this.locationValidator(location);
    return {
      valid: isValid,
      errors: this.locationValidator.errors || []
    };
  }

  validateQuest(quest) {
    const isValid = this.questValidator(quest);
    return {
      valid: isValid,
      errors: this.questValidator.errors || []
    };
  }
}
