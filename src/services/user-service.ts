import type * as O from "fp-ts/Option";
import type * as RTE from "fp-ts/ReaderTaskEither";
import type * as TE from "fp-ts/TaskEither";

import { DomainError } from "../core/domain-error";
import type { Email } from "../core/email";
import type { User } from "../core/user";

const UserServiceSymbol = Symbol("UserService");

export abstract class UserServiceError extends DomainError {}

/**
 * UserService represents a service for handling user-related operations such
 * as retrieving a user by email.
 *
 * The service is defined using a Symbol (`UserServiceSymbol`) to encapsulate
 * and extend the functionality while preventing name collisions in the
 * system. The use of Symbols ensures that the internal structure of the
 * service is hidden, and only the interface is exposed to consumers, allowing
 * different services with similar names to coexist safely.
 *
 * This service follows Onion architecture principles, decoupling core business
 * logic from infrastructure concerns, and returning functional constructs like
 * `TaskEither` for handling asynchronous operations that can fail.
 */
export interface UserService {
  [UserServiceSymbol]: {
    /**
     * Retrieves a user by their email address.
     *
     * This method returns a `TaskEither` to handle the possibility of a
     * failure during the asynchronous operation (e.g., database or network
     * failure). The successful path contains an `Option<User>`, indicating
     * whether the user was found or not.
     *
     * @param email - The email address to look up the user.
     * @returns A `TaskEither` that resolves to either a `UserServiceError`
     * (in case of failure) or an optional `User` (in case of success).
     */
    getUserByEmail: (
      email: Email
    ) => TE.TaskEither<UserServiceError, O.Option<User>>;
  };
}

/**
 * Factory function to create a `UserService`.
 *
 * This function accepts an object implementing the `UserService` interface
 * and returns a structured service. The use of a Symbol to encapsulate the
 * service ensures that the implementation is hidden, avoiding potential name
 * collisions with other services.
 *
 * This pattern promotes the Dependency Inversion Principle by decoupling
 * higher-level business logic from the actual implementation of user retrieval.
 * Additionally, the encapsulation of service logic ensures that consumers only
 * interact with the well-defined interface, leading to a more modular and
 * maintainable architecture.
 *
 * @param definition - An object implementing the `getUserByEmail` method.
 * @returns A `UserService` object exposing the defined methods.
 */
export const createUserService = (
  definition: UserService[typeof UserServiceSymbol]
) => ({ [UserServiceSymbol]: definition });

/**
 * Higher-order function to invoke the `getUserByEmail` method from a given
 * `UserService`, returning a `ReaderTaskEither`.
 *
 * This function decouples the logic of invoking the service from its actual
 * implementation, enabling composition and testing without direct dependency on
 * the underlying service logic. It abstracts the interaction with the service,
 * following the principles of Onion architecture, by keeping core domain logic
 * decoupled from the service implementation.
 *
 * By returning a `ReaderTaskEither`, this function combines:
 * - `Reader`: for dependency injection, allowing the `UserService` to be passed
 *   implicitly when composed with other services.
 * - `Task`: for handling asynchronous execution, such as querying a database or
 *   external service.
 * - `Either`: for handling the success and failure cases, returning either a
 *   `UserServiceError` in case of failure or an `Option<User>` in case of
 *   success.
 *
 * This approach ensures the function integrates smoothly with `Reader`-based
 * environments, allowing types to widen automatically as more dependencies are
 * composed. This composition-friendly design enables services to be extended
 * and adapted without manual type adjustments.
 *
 * @param email - The email address used to look up the user.
 * @returns A `ReaderTaskEither` that resolves with either a `UserServiceError`
 * (in case of failure) or an `Option<User>` (in case of success). The `Reader`
 * monad ensures that the `UserService` dependency is passed implicitly,
 * supporting easy composition with other services and dependencies.
 */
export const getUserByEmail =
  (
    email: Email
  ): RTE.ReaderTaskEither<UserService, UserServiceError, O.Option<User>> =>
  (service) =>
    service[UserServiceSymbol].getUserByEmail(email);
