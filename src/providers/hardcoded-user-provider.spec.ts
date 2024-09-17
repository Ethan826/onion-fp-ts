import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import type { UUID } from "io-ts-types";

import { isoEmail } from "../core/email";
import { isoUserId } from "../core/user";
import type { LoggingService } from "../services/logging-service";
import { createLoggingService } from "../services/logging-service";
import { getUserByEmail } from "../services/user-service";
import { createHardcodedUserProvider } from "./hardcoded-user-provider";

describe("getUserByEmail", () => {
  it("should return the user when the email is found in the hardcoded database", async () => {
    const { mockLoggingService, mockLog } = createMockLoggingService();

    const provider = createHardcodedUserProvider(mockLoggingService);

    const email = isoEmail.wrap("ekent@mercury.com");

    const actual = await getUserByEmail(email)(provider)();
    const expected = E.of(
      O.of({
        firstName: "Ethan",
        lastName: "Kent",
        id: isoUserId.wrap("a2a9a967-10bb-43b9-8230-99ae3a3d161f" as UUID),
        email: isoEmail.wrap("ekent@mercury.com"),
      })
    );

    expect(actual).toEqual(expected);

    expect(mockLog).toHaveBeenCalledWith(
      "Looking up email `ekent@mercury.com`"
    );
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining("Kent"));
  });

  it("should return none when the email is not found in the hardcoded database", async () => {
    const { mockLoggingService, mockLog } = createMockLoggingService();

    const provider = createHardcodedUserProvider(mockLoggingService);

    const email = isoEmail.wrap("unknown@mercury.com");

    const result = await getUserByEmail(email)(provider)();

    expect(result).toEqual(E.of(O.none));

    expect(mockLog).toHaveBeenCalledWith(
      "Looking up email `unknown@mercury.com`"
    );
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining("None"));
  });
});

const createMockLoggingService = () => {
  const mockLog = jest.fn();

  const mockLoggingService: LoggingService = createLoggingService({
    log: mockLog,
  });

  return {
    mockLoggingService,
    mockLog,
  };
};
