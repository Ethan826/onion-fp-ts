import { createLoggingService } from "../services/logging-service";

/**
 * ConsoleLoggingProvider is a simple implementation of the `LoggingService`
 * that logs messages to the console using `console.log`. This provider conforms
 * to the `LoggingService` interface, allowing it to be used interchangeably
 * with other logging implementations in the application.
 *
 * The `log` function returns a deferred `Task<void>`, making it suitable for
 * functional programming environments where logging can be composed with other
 * side effects. This ensures the logging operation is non-blocking and fits
 * seamlessly into the functional service architecture.
 *
 * By using `createLoggingService`, the `ConsoleLoggingProvider` is encapsulated
 * behind a consistent interface, which adheres to the principles of Onion
 * architecture. The core business logic remains decoupled from the specific
 * logging implementation, allowing for easy extension or replacement of the
 * logging mechanism in the future.
 *
 * @returns A `LoggingService` implementation that logs messages to the console.
 */
export const ConsoleLoggingProvider = createLoggingService({
  /**
   * Logs a message to the console. This method is wrapped in a `Task<void>` to
   * ensure it can be composed with other side effects in a purely functional
   * style. The use of `Promise.resolve(void 0)` ensures that the logging is
   * non-blocking and asynchronous.
   *
   * @param m - The message to log.
   * @returns A `Task<void>` that logs the message using `console.log`.
   */
  log: (m) => () => {
    console.log(m);
    return Promise.resolve(void 0);
  },
});
