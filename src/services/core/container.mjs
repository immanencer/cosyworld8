// src/services/container.mjs
export class Container {
  constructor() {
    this.registry = new Map();
    this.singletons = new Map();
  }

  register(name, factory, options = { singleton: true }) {
    this.registry.set(name, { factory, options });
  }

  resolve(name) {
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }
    const entry = this.registry.get(name);
    if (!entry) throw new Error(`Service '${name}' not registered`);
    const instance = entry.factory(this);
    if (entry.options.singleton) {
      this.singletons.set(name, instance);
    }
    return instance;
  }
}