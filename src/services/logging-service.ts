import { pipe } from "fp-ts/function";
import type * as RTE from "fp-ts/ReaderTaskEither";
import type * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";

const LoggingServiceSymbol = Symbol("LoggingService");

/**
 * LoggingService represents a service responsible for logging messages within
 * the system.
 *
 * In this Onion architecture reference, the service is defined using a Symbol
 * (`LoggingServiceSymbol`) to ensure encapsulation and to avoid name collisions
 * in larger applications where multiple services may coexist.
 *
 * The `log` function is designed as a side-effect returning a `Task<void>`,
 * following the functional programming paradigm of `fp-ts`. This approach
 * defers execution, allowing for functional composition and referential
 * transparency.
 *
 * This architecture abstracts the actual logging mechanism (e.g., console
 * logging, file logging, or external logging) behind a well-defined interface,
 * ensuring that the logging implementation can be replaced or extended without
 * impacting other parts of the system. The use of a symbol ensures that
 * multiple services can safely operate without risk of name collisions or
 * overwriting.
 */
export interface LoggingService {
  [LoggingServiceSymbol]: {
    /**
     * Logs a message asynchronously.
     *
     * The `log` function takes a string message and returns a `Task<void>`,
     * ensuring that the logging side-effect is deferred and can be composed
     * with other functional effects in a purely functional way.
     *
     * @param message - The message to be logged.
     * @returns A `Task<void>` representing the deferred logging operation.
     */
    log: (message: string) => T.Task<void>;
  };
}

/**
 * Factory function for creating a `LoggingService`.
 *
 * This function takes a definition object that implements the `LoggingService`
 * interface and returns a structured service object. The factory ensures that
 * the service adheres to the necessary interface while abstracting away the
 * implementation details. This pattern promotes the Dependency Inversion
 * Principle by decoupling higher-level logic from the concrete implementation
 * of logging.
 *
 * Using a Symbol for the service prevents name collisions, especially in
 * scenarios where multiple services with similar interfaces may be used
 * throughout the system.
 *
 * @param definition - An object implementing the core `log` function of the
 * service.
 * @returns A `LoggingService` object with the defined logging method.
 */
export const createLoggingService = (
  definition: LoggingService[typeof LoggingServiceSymbol]
) => ({ [LoggingServiceSymbol]: definition });

/**
 * Higher-order function to invoke the `log` method of the `LoggingService`,
 * returning a `ReaderTaskEither`.
 *
 * This function abstracts away the interaction with the `LoggingService` symbol,
 * allowing other parts of the system to log messages without needing to know the
 * internal structure of the service. This cleanly separates the service layer from
 * the business logic.
 *
 * By returning a `ReaderTaskEither`, this function integrates the `Reader` monad for
 * dependency injection and the `Task` monad for deferred side effects. The `Either`
 * part of the monad is not used in this case because logging typically doesn't have
 * a failure case, but `ReaderTaskEither` allows for consistent composition with other
 * services that may include failure handling.
 *
 * This pattern promotes functional programming by enabling the function to be composed
 * with other services that share a similar dependency injection pattern. Additionally,
 * the use of `ReaderTaskEither` ensures that as more dependencies are introduced, the
 * types will automatically widen without requiring manual adjustments.
 *
 * In an Onion architecture, this function resides in the service layer, interacting
 * with the core business logic while allowing the infrastructure to implement the
 * actual logging mechanism.
 *
 * @param message - The message to log.
 * @returns A `ReaderTaskEither` that resolves with `void` after logging the message,
 * relying on the `LoggingService` passed via the `Reader`.
 */
export const log =
  (message: string): RTE.ReaderTaskEither<LoggingService, never, void> =>
  (service) =>
    pipe(message, service[LoggingServiceSymbol].log, TE.fromTask);
