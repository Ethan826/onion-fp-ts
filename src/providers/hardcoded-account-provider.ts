import { pipe } from "fp-ts/function";
import type * as O from "fp-ts/Option";
import * as RR from "fp-ts/ReadonlyRecord";
import * as TE from "fp-ts/TaskEither";
import type { UUID } from "io-ts-types";

import type { Account } from "../core/account";
import { isoAccountId } from "../core/account";
import type { UserId } from "../core/user";
import { isoUserId } from "../core/user";
import type {
  AccountService,
  AccountServiceError,
} from "../services/account-service";
import { createAccountService } from "../services/account-service";

const HardcodedAccountDb: RR.ReadonlyRecord<string, Account> = {
  "a2a9a967-10bb-43b9-8230-99ae3a3d161f": {
    accountId: isoAccountId.wrap(
      "69bdcc3d-95df-4497-a6a7-c529e1b010d6" as UUID
    ),
    ownerId: isoUserId.wrap("a2a9a967-10bb-43b9-8230-99ae3a3d161f" as UUID),
  },
};

/**
 * `HardcodedAccountProvider` is an implementation of the `AccountService`
 * that retrieves account data from an in-memory, hardcoded database.
 *
 * The `getAccountByOwnerId` method takes a `UserId` and looks up the account
 * in a hardcoded `ReadonlyRecord`. This operation is wrapped in a `TaskEither`,
 * allowing it to be composed functionally with other asynchronous effects.
 *
 * While this implementation is simple and hardcoded, it conforms to the
 * `AccountService` interface, making it easy to replace with a more complex
 * implementation (e.g., a database-backed service) in the future without
 * changing the interface used by other parts of the system.
 *
 * @returns An `AccountService` implementation that retrieves accounts based on
 * their owner's `UserId` from a hardcoded database.
 */
export const HardcodedAccountProvider: AccountService = createAccountService({
  /**
   * Looks up an account by the owner's `UserId`.
   *
   * This function unwraps the `UserId` using the `isoUserId` utility, then
   * looks up the account in the hardcoded `HardcodedAccountDb`. It returns the
   * result as an `Option<Account>` wrapped in a `TaskEither`, ensuring that the
   * result is composable with other `TaskEither`-based services.
   *
   * @param ownerId - The ID of the user who owns the account.
   * @returns A `TaskEither` that resolves to either an `AccountServiceError`
   * or an `Option<Account>`.
   */
  getAccountByOwnerId: (
    ownerId: UserId
  ): TE.TaskEither<AccountServiceError, O.Option<Account>> =>
    pipe(
      ownerId,
      isoUserId.unwrap,
      (e) => RR.lookup(e)(HardcodedAccountDb),
      TE.of
    ),
});
