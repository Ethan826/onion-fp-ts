import { flow } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RTE from "fp-ts/ReaderTaskEither";

import type { Account } from "../core/account";
import type { Email } from "../core/email";
import type {
  AccountService,
  AccountServiceError,
} from "../services/account-service";
import { getAccountByOwnerId } from "../services/account-service";
import type { UserService, UserServiceError } from "../services/user-service";
import { getUserByEmail } from "../services/user-service";

/**
 * `getAccountByUserEmail` is part of the "shell" layer, responsible for
 * orchestrating operations across multiple services (`UserService` and
 * `AccountService`) to retrieve an account based on a user's email.
 *
 * This function takes an email address, looks up the corresponding user using
 * the `UserService`, and then fetches the associated account via the
 * `AccountService`.  Both services are injected as dependencies using
 * `ReaderTaskEither`, ensuring the operation remains composable, side-effect
 * free, and easily testable.
 *
 * @param email - The email address used to look up the user and their
 * associated account.
 * @returns A `ReaderTaskEither` that handles the asynchronous operations and
 * possible errors (`UserServiceError` or `AccountServiceError`). On success, it
 * returns an `Option<Account>`, representing the account, if found.
 */
export const getAccountByUserEmail: (
  email: Email
) => RTE.ReaderTaskEither<
  UserService & AccountService,
  UserServiceError | AccountServiceError,
  O.Option<Account>
> = flow(
  getUserByEmail, // Fetches the user by email using the UserService
  RTE.flatMap(
    flow(
      O.traverse(RTE.ApplicativePar)(({ id }) => getAccountByOwnerId(id)),
      RTE.map(O.flatten)
    )
  )
);
