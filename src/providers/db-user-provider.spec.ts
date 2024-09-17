/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import type { UUID } from "io-ts-types";
import type { Database } from "sqlite3";

import { isoEmail } from "../core/email";
import type { User } from "../core/user";
import { isoUserId } from "../core/user";
import { createLoggingService } from "../services/logging-service";
import { getUserByEmail, UserServiceError } from "../services/user-service";
import { createDbUserProvider } from "./db-user-provider";

const mockEmail = isoEmail.wrap("ekent@mercury.com");

describe("getUserByEmail", () => {
  it("should return the user if found in the database", async () => {
    const mockUser = {
      id: isoUserId.wrap("a2a9a967-10bb-43b9-8230-99ae3a3d161f" as UUID),
      email: mockEmail,
      firstName: "Ethan",
      lastName: "Kent",
    };

    const { mockDeps, dbSpy } = createTestDeps(mockUser);
    const userProvider = createDbUserProvider(mockDeps);

    const result = await getUserByEmail(mockEmail)(userProvider)();

    expect(dbSpy).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      [mockEmail],
      expect.any(Function)
    );
    expect(result).toEqual(E.right(O.some(mockUser)));
  });

  it("should return None if the user isn't found in the database", async () => {
    const { mockDeps, dbSpy } = createTestDeps(null);
    const userProvider = createDbUserProvider(mockDeps);

    const result = await getUserByEmail(mockEmail)(userProvider)();

    expect(dbSpy).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      [mockEmail],
      expect.any(Function)
    );
    expect(result).toEqual(E.right(O.none));
  });

  it("should return an error if the database query fails", async () => {
    const mockError = new Error("DB failure");
    const { mockDeps, dbSpy } = createTestDeps(null, mockError);
    const userProvider = createDbUserProvider(mockDeps);

    const result = await getUserByEmail(mockEmail)(userProvider)();

    expect(dbSpy).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = ?",
      [mockEmail],
      expect.any(Function)
    );
    expect(result).toEqual(E.left(expect.any(UserServiceError)));
  });
});

const createTestDeps = (mockUser: User | null, error: Error | null = null) => {
  const dbSpy = jest.fn();
  const logSpy = jest.fn().mockResolvedValue(void 0);

  dbSpy.mockImplementation((query, params, callback) => {
    if (error) {
      callback(error, null); // Simulate a DB error
    } else {
      callback(null, mockUser); // Simulate success or no user found
    }
  });

  const mockDb = { get: dbSpy } as unknown as Database;

  return {
    dbSpy,
    logSpy,
    mockDeps: { ...createLoggingService({ log: logSpy }), db: mockDb },
  };
};
