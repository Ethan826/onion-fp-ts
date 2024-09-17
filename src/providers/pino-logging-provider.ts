import pino from "pino";

import { createLoggingService } from "../services/logging-service";

const logger = pino();

/**
 * PinoLoggingProvider is a concrete implementation of the `LoggingService`
 * that uses the `pino` logging library to handle log messages. This provider
 * wraps `pino` into the `LoggingService` interface, making it compatible with
 * the functional service layer used in the application.
 *
 * The `log` function returns a deferred `Task<void>`, making it composable in
 * functional programming environments, particularly with other
 * `ReaderTaskEither` based services. The function logs messages via `pino`'s
 * `info` method, ensuring that logging is asynchronous and non-blocking.
 *
 * By creating the logging provider with `createLoggingService`, we adhere to
 * the principles of Onion architecture, encapsulating the logging
 * implementation behind an interface that can be easily swapped out or extended
 * without affecting the rest of the system.
 *
 * This design allows the core business logic to remain agnostic to the specific
 * logging implementation, ensuring flexibility and testability.
 *
 * @returns A `LoggingService` implementation that logs messages using `pino`.
 */
export const PinoLoggingProvider = createLoggingService({
  /**
   * Logs a message using the `pino` logger. This method is wrapped in a
   * `Task<void>` to ensure that it can be composed with other side effects in a
   * purely functional style. The use of `Promise.resolve(void 0)` ensures that
   * the logging is non-blocking and asynchronous.
   *
   * @param m - The message to log.
   * @returns A `Task<void>` that logs the message using `pino`'s `info` method.
   */
  log: (m) => () => {
    logger.info(m);
    return Promise.resolve(void 0);
  },
});
