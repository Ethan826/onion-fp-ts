import { flow } from "fp-ts/function";
import type * as O from "fp-ts/Option";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as RR from "fp-ts/ReadonlyRecord";
import type { UUID } from "io-ts-types";

import type { Email } from "../core/email";
import { isoEmail } from "../core/email";
import type { User } from "../core/user";
import { isoUserId } from "../core/user";
import type { LoggingService } from "../services/logging-service";
import { log } from "../services/logging-service";
import { createUserService } from "../services/user-service";

const HardcodedUserDb: RR.ReadonlyRecord<string, User> = {
  "ekent@mercury.com": {
    firstName: "Ethan",
    lastName: "Kent",
    id: isoUserId.wrap("a2a9a967-10bb-43b9-8230-99ae3a3d161f" as UUID),
    email: isoEmail.wrap("ekent@mercury.com"),
  },
};

type HardcodedUserProviderDeps = LoggingService;

/**
 * Retrieves a user by email from a hardcoded in-memory database, logging the
 * operation at various stages.
 *
 * This function uses a `ReaderTaskEither` to manage dependencies (via
 * `LoggingService`) and return a composable result. The user is looked up
 * in the hardcoded database, and the operation is logged before and after
 * execution.
 *
 * @param s - The email address to look up.
 * @returns A `ReaderTaskEither` that logs the process and returns an
 * `Option<User>` if found.
 */
const getUserByEmail: (
  s: Email
) => RTE.ReaderTaskEither<LoggingService, never, O.Option<User>> = flow(
  isoEmail.unwrap,
  RTE.of,
  RTE.tap((m) => log(`Looking up email \`${m}\``)),
  RTE.map((e) => RR.lookup(e)(HardcodedUserDb)),
  RTE.tap((u) => log(`Result: ${JSON.stringify(u)}`))
);

/**
 * Creates a hardcoded user provider that implements the `UserService` interface.
 *
 * This provider uses a hardcoded in-memory database and integrates with a
 * `LoggingService` to log the lookup process. The implementation can be easily
 * replaced with a real database-backed service in the future, as it conforms to
 * the `UserService` interface.
 *
 * @param deps - The `LoggingService` used for logging the operations.
 * @returns A `UserService` that retrieves users by email and logs the process.
 */
export const createHardcodedUserProvider = (deps: HardcodedUserProviderDeps) =>
  createUserService({
    getUserByEmail: (email) => getUserByEmail(email)(deps),
  });
