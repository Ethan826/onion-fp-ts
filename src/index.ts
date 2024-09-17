/* eslint-disable @typescript-eslint/no-unused-vars */
import { Database } from "sqlite3";

import { isoEmail } from "./core/email";
import { ConsoleLoggingProvider } from "./providers/console-logging-provider";
import { createDbUserProvider } from "./providers/db-user-provider";
import { HardcodedAccountProvider } from "./providers/hardcoded-account-provider";
import { createHardcodedUserProvider } from "./providers/hardcoded-user-provider";
import { PinoLoggingProvider } from "./providers/pino-logging-provider";
import { getAccountByUserEmail } from "./shell/get-account-by-user-email";

const prodDeps = {
  // Production environment using DB user provider and console logging
  ...createDbUserProvider({
    ...ConsoleLoggingProvider,
    db: new Database("db.sqlite3"),
  }),

  // Example of swapping logging providers (uncomment to use):
  // ...createDbUserProvider({
  //   ...PinoLoggingProvider,
  //   db: new Database("db.sqlite3"),
  // }),

  // Example of swapping to hardcoded user provider (uncomment to use):
  // ...createHardcodedUserProvider(ConsoleLoggingProvider),
  // ...createHardcodedUserProvider(PinoLoggingProvider),

  // Always using hardcoded account provider in this case
  ...HardcodedAccountProvider,
};

/**
 * The `main` function is the entry point of the application. It retrieves an
 * account based on the provided user email and the services defined in
 * `prodDeps`.
 *
 * The function orchestrates service composition by leveraging the "shell" layer
 * (`getAccountByUserEmail`), which integrates with the underlying
 * infrastructure via `ReaderTaskEither`-based services like `UserService` and
 * `AccountService`.
 *
 * @returns A Promise that executes the process of fetching the account and logs
 * the result.
 *
 * ### Compile-time Collaborator Selection:
 *
 * Collaborators (services like logging and data providers) can be swapped at
 * compile time by simply commenting or uncommenting the appropriate service
 * configurations in the `prodDeps` object. This method allows:
 *
 * - **Type Safety**: By selecting the services at compile time, TypeScript
 *   ensures that all dependencies are satisfied correctly, preventing runtime
 *   errors related to missing or misconfigured services.
 *
 * - **No Runtime Overhead**: Since the service providers are chosen statically
 *   at compile time, the application avoids any conditional logic or dynamic
 *   checks at runtime. This guarantees there is no performance overhead
 *   associated with swapping collaborators.
 *
 * - **Minimal Code Changes**: The services in `prodDeps` are composed at the
 *   top level of the application. Switching between providers requires minimal
 *   changes (just commenting/uncommenting), and there is no need to modify the
 *   core logic or function signatures.
 */
const main = async () => {
  const myEmail = isoEmail.wrap("ekent@mercury.com");

  // Retrieves the account associated with the given email using the composed
  // dependencies
  const result = await getAccountByUserEmail(myEmail)(prodDeps)();

  // Logs the result of the operation
  console.log(result);
};

main().catch((e: unknown) => {
  console.error(e);
});
