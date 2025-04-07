# Service Container

## Overview
The Container service implements the Service Locator pattern for the CosyWorld system. It provides a central registry for all services and manages their lifecycle, including dependency resolution and singleton instances.

## Functionality
- **Service Registration**: Register service factories with options
- **Dependency Resolution**: Automatically resolves registered services
- **Singleton Management**: Manages singleton instances of services
- **Lazy Initialization**: Services are only instantiated when needed

## Implementation
The Container is implemented as a class with methods to register and resolve services. Service factories are functions that receive the container instance to resolve their dependencies.

```javascript
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
```

## Usage
The Container is used by the ServiceRegistry to configure the system's services and by the ServiceInitializer to resolve and initialize them.

```javascript
// Registering a service
container.register('logger', () => console);

// Registering a service with dependencies
container.register('myService', (c) => new MyService(c.resolve('logger')));

// Resolving a service
const myService = container.resolve('myService');
```

## Dependencies
- None (foundational service)