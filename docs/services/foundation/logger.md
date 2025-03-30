# Logger Service

## Overview
The Logger Service provides consistent, formatted logging capabilities throughout the CosyWorld system. It uses Winston, a versatile logging library for Node.js, to output formatted logs to both the console and log files, enabling effective debugging and system monitoring.

## Functionality
- **Multi-transport Logging**: Outputs logs to both console and file
- **Formatted Output**: Provides structured, readable log formats
- **Log Levels**: Supports different log levels (info, warn, error, debug)
- **Timestamp Integration**: Automatically adds timestamps to all log entries
- **Colorized Console Output**: Enhances readability in terminal sessions

## Implementation
The Logger Service is implemented as a Winston logger instance with customized formatting:

```javascript
import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Pretty log format for console
const consoleFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json() // File format stays clean
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      )
    }),
    new winston.transports.File({ filename: 'app.log' })
  ],
});
```

### Log Formats

#### Console Output
The console format is optimized for readability during development:
- Colorized by log level (info, warn, error)
- Compact timestamp (HH:mm:ss)
- Clean, single-line output

Example: `[14:27:35] info: Avatar 'Mage' created successfully`

#### File Output
The file format is optimized for parsing and analysis:
- JSON structure for programmatic consumption
- Full timestamp (YYYY-MM-DD HH:mm:ss)
- Complete metadata preservation

Example:
```json
{"level":"info","message":"Avatar 'Mage' created successfully","timestamp":"2023-05-20 14:27:35"}
```

## Usage
The logger is exported as a singleton instance that can be imported and used throughout the application:

```javascript
import { logger } from './logger.mjs';

// Different log levels
logger.info('System initialized');
logger.warn('Resource running low');
logger.error('Failed to connect to database', { error: err.message });
logger.debug('Processing step completed', { step: 'validation', result: 'success' });
```

## Log Levels
The logger supports the standard Winston log levels, in order of priority:
1. **error**: Critical errors requiring immediate attention
2. **warn**: Warnings that don't prevent operation but require attention
3. **info**: General operational information (default level)
4. **verbose**: Detailed information for troubleshooting
5. **debug**: Low-level debugging information
6. **silly**: Extremely detailed debugging information

## Best Practices
- Use appropriate log levels for different types of messages
- Include relevant context in log messages
- Use structured logging for machine-parseable events
- Avoid logging sensitive information (tokens, passwords)
- Keep log messages concise and meaningful
- Use error objects for stack traces when logging errors

## Customization
The logger can be customized by modifying its configuration:

- **Changing log levels**: Adjust verbosity based on environment
- **Adding transports**: Integrate with log aggregation services
- **Custom formats**: Tailor output for specific needs
- **Rotation policies**: Manage log file growth and archiving

## Integration Points
The logger integrates with various parts of the system:
- **Service initialization**: Track service startup and configuration
- **Request handling**: Log incoming requests and responses
- **Error handling**: Capture and log exceptions
- **Performance monitoring**: Track timing and resource usage
- **Security events**: Log authentication and authorization activities