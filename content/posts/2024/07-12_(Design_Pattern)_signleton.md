---
title: (Design Pattern) Singleton
tags:
  - '#design-pattern'
  - '#javascript'
createdAt: 2024-07-12 00:40
updatedAt: 2024-07-12 00:40
---

## Singleton Pattern

The Singleton pattern restricts the instantiation of a class to a single object, providing global access to that object. It is commonly used for scenarios where a single instance of a class needs to coordinate actions across an entire system, such as managing database connections, logging, or configuration settings.

## What is the best Practices for Singleton Pattern

### Private constructor:

To prevent direct instantiation from outside the class, the constructor of the Singleton class should be made private. This ensures that the class cannot be instantiated using the ‘new’ keyword.

### Static instance variable:

Declare a static variable within the class to hold the single instance. This variable should be of the same type as the class itself.

### Lazy initialization:

The Singleton instance should be created only when it is first requested. This technique, known as lazy initialization, ensures that the instance is not unnecessarily created if it is never used during the application’s execution.

### Static getInstance() method:

Provide a static method that controls access to the Singleton instance. This method should check if the instance already exists and return it, or create a new instance if it doesn’t.

### Thread safety:

Consider thread safety while implementing Singletons, especially in scenarios where multiple threads may request access simultaneously. Techniques such as locking or synchronization can be employed to ensure the instance is created and accessed safely.

## Example

### Database Connection

```typescript
class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
      // Perform database connection setup here
    }
    return DatabaseConnection.instance;
  }

  public query(sql: string): void {
    // Execute the query
    console.log(`Executing query: ${sql}`);
  }
}

// Usage:
const dbConnection1 = DatabaseConnection.getInstance();
dbConnection1.query('SELECT * FROM users');

const dbConnection2 = DatabaseConnection.getInstance();
dbConnection2.query("UPDATE users SET name = 'John'");

console.log(dbConnection1 === dbConnection2); // true
```

### Logger

```typescript
enum LogLevel {
  INFO,
  ERROR,
  WARNING,
}

class Logger {
  private static instance: Logger;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(level: LogLevel, message: string): void {
    // Log the message with the specified level
    console.log(`[${LogLevel[level]}] ${message}`);
  }
}

// Usage:
const logger1 = Logger.getInstance();
logger1.log(LogLevel.INFO, 'Application started');

const logger2 = Logger.getInstance();
logger2.log(LogLevel.ERROR, 'An error occurred');

console.log(logger1 === logger2); // true
```

### Configuration Settings

```typescript
class Configuration {
  private static instance: Configuration;
  private settings: { [key: string]: string };

  private constructor() {
    // Private constructor to prevent direct instantiation
    this.settings = {
      apiEndpoint: 'https://api.example.com',
      apiKey: '123456789',
    };
  }

  public static getInstance(): Configuration {
    if (!Configuration.instance) {
      Configuration.instance = new Configuration();
    }
    return Configuration.instance;
  }

  public getSetting(key: string): string {
    // Get the value of the specified setting
    return this.settings[key];
  }
}

// Usage:
const config1 = Configuration.getInstance();
console.log(config1.getSetting('apiEndpoint')); // "https://api.example.com"

const config2 = Configuration.getInstance();
console.log(config2.getSetting('apiKey')); // "123456789"

console.log(config1 === config2); // true
```

## References

- [Designing Singleton Patterns in TypeScript: by examples](https://medium.com/@alessandro.traversi/designing-singleton-patterns-in-typescript-by-examples-8732ab07040d)
