import type * as O from "fp-ts/Option";
import type * as RTE from "fp-ts/ReaderTaskEither";
import type * as TE from "fp-ts/TaskEither";

import type { Account } from "../core/account";
import { DomainError } from "../core/domain-error";
import type { UserId } from "../core/user";

const AccountServiceSymbol = Symbol("AccountService");

export class AccountServiceError extends DomainError {}

/**
 * AccountService represents the service layer responsible for handling
 * account-related operations.
 *
 * This design follows Onion architecture principles, where the service layer
 * abstracts external infrastructure (such as databases or APIs) and exposes
 * domain-specific operations, like fetching an account by its owner's user ID.
 *
 * The service is defined using a Symbol to encapsulate implementation details
 * and avoid potential name collisions. Using a unique Symbol ensures that
 * multiple services can coexist in the same context without clashing, even if
 * they provide similar functionality.
 */
export interface AccountService {
  [AccountServiceSymbol]: {
    /**
     * Retrieves an account by the owner's user ID.
     *
     * This function returns a `TaskEither` to handle asynchronous operations
     * that may fail. The success path returns an `Option<Account>`, which
     * represents the possibility that no account exists for the given owner.
     *
     * @param ownerId - The ID of the user who owns the account.
     * @returns A `TaskEither` that resolves to either an `AccountServiceError`
     * or an optional `Account`.
     */
    getAccountByOwnerId: (
      ownerId: UserId
    ) => TE.TaskEither<AccountServiceError, O.Option<Account>>;
  };
}

/**
 * Factory function for creating an `AccountService`.
 *
 * This function allows external infrastructure implementations to define the
 * behavior of `getAccountByOwnerId` and returns the service in a structured
 * format. By abstracting the service behind a factory, the system adheres to
 * the dependency inversion principle, ensuring that higher-level layers (like
 * business logic) depend only on the service interface and not on its
 * implementation.
 *
 * The use of the Symbol ensures that services with similar responsibilities
 * (such as multiple account services or logging services) can coexist without
 * risk of naming collisions or overwriting each other’s implementation.
 *
 * @param definition - An object implementing the core `getAccountByOwnerId`
 * function.
 * @returns An `AccountService` object exposing the defined methods.
 */
export const createAccountService = (
  definition: AccountService[typeof AccountServiceSymbol]
) => ({ [AccountServiceSymbol]: definition });

/**
 * Higher-order function to invoke the `getAccountByOwnerId` method from the
 * `AccountService`, returning a `ReaderTaskEither`.
 *
 * This function abstracts the interaction with the `AccountService`, providing
 * a clean API for other parts of the system to retrieve an account by the
 * owner's user ID. By leveraging `ReaderTaskEither`, it not only handles
 * asynchronous operations but also allows dependency injection for the service
 * without explicitly passing it around every time.
 *
 * The use of `ReaderTaskEither` integrates three monads:
 * - `Reader`: Injects the `AccountService` dependency.
 * - `Task`: Handles the asynchronous execution.
 * - `Either`: Manages success and failure cases, returning either a
 * `UserServiceError` or an `Option<Account>`.
 *
 * This composition ensures that side effects and dependencies are handled
 * functionally and composably. Additionally, this approach allows for
 * automatic type widening when additional dependencies are introduced,
 * meaning that the function remains flexible and can be easily composed with
 * other services.
 *
 * By using this pattern, we adhere to the Onion architecture principle of
 * keeping core domain logic decoupled from the service implementation, as well
 * as the Dependency Inversion Principle by relying on abstractions rather than
 * concrete implementations.
 *
 * @param ownerId - The ID of the user who owns the account.
 * @returns A `ReaderTaskEither` that resolves with either an
 * `AccountServiceError` or an `Option<Account>`. The `Reader` component
 * ensures that the `AccountService` is passed implicitly, allowing for easy
 * composition with other dependencies.
 */
export const getAccountByOwnerId =
  (
    ownerId: UserId
  ): RTE.ReaderTaskEither<
    AccountService,
    AccountServiceError,
    O.Option<Account>
  > =>
  (service) =>
    service[AccountServiceSymbol].getAccountByOwnerId(ownerId);
