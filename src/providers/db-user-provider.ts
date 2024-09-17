import * as E from "fp-ts/Either";
import { flow, identity, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import type { Database } from "sqlite3";

import type { Email } from "../core/email";
import { User } from "../core/user";
import type { LoggingService } from "../services/logging-service";
import { log } from "../services/logging-service";
import type { UserService } from "../services/user-service";
import { createUserService, UserServiceError } from "../services/user-service";

class UserServiceDbQueryError extends UserServiceError {
  name = "UserServiceDbQueryError";
}

class UserServiceInvalidDataError extends UserServiceError {
  name = "UserServiceInvalidDataError";
}

type GetUserByEmailDeps = { db: Database } & LoggingService;

/**
 * Fetches a user by email using a `ReaderTaskEither` for dependency injection
 * and error handling.
 *
 * The process begins by logging the action and proceeds with querying the
 * database for the user by their email. The query result is either returned as
 * a valid `User` or mapped to an error if the data is invalid or the query
 * fails.
 *
 * @param email - The email address to query for.
 * @returns A `ReaderTaskEither` that fetches the user by email and handles
 * errors via `UserServiceError` or returns an `Option<User>`.
 */
const getUserByEmail: (
  email: Email
) => RTE.ReaderTaskEither<
  GetUserByEmailDeps,
  UserServiceError,
  O.Option<User>
> = (email) =>
  pipe(
    // Email is actually a string; the Newtype confuses the linter
    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
    log(`Preparing to query for ${email}`),
    RT.map(E.of),
    RTE.flatMap(() =>
      taskifiedGet("SELECT * FROM users WHERE email = ?", [email])
    ),
    RTE.bimap((e) => new UserServiceDbQueryError(e), O.fromNullable),
    RTE.flatMapEither(
      O.traverse(E.Applicative)(
        flow(
          User.decode.bind(this),
          E.mapLeft((e) => new UserServiceInvalidDataError(e))
        )
      )
    )
  );

/**
 * Creates a user provider that connects to a database and logging service.
 * This provider encapsulates the `getUserByEmail` functionality, allowing
 * the `UserService` to be used in the application.
 *
 * @param deps - Dependencies required for the service (Database and
 * LoggingService).
 * @returns A `UserService` that retrieves users by their email.
 */
export const createDbUserProvider = (deps: GetUserByEmailDeps): UserService =>
  createUserService({
    getUserByEmail: (email: Email) => getUserByEmail(email)(deps),
  });

/**
 * A helper function to query the database, wrapped in `ReaderTaskEither` for
 * dependency injection and error handling. Executes an SQL query and returns
 * the result, or an error if the query fails.
 *
 * @param query - SQL query string.
 * @param param - Parameters for the SQL query.
 * @returns A `ReaderTaskEither` that either returns the query result or an
 * error.
 */
const taskifiedGet: (
  query: string,
  param: unknown
) => RTE.ReaderTaskEither<GetUserByEmailDeps, unknown, unknown> =
  (query, param) =>
  ({ db }) =>
    TE.tryCatch(
      () =>
        new Promise((resolve, reject) => {
          db.get(query, param, (err: Error | null, result: unknown) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        }),
      identity
    );
