import { mapMeResponseToUser } from "./me-response.mapper";
import { User } from "../types/User";

describe("mapMeResponseToUser", () => {
  describe("when data is valid", () => {
    it("should map the response to a User object", () => {
      const data = {
        school: { id: "school123" },
        user: { id: "user123", firstName: "John", lastName: "Doe" },
      };

      const result: User = mapMeResponseToUser(data);

      expect(result).toEqual({
        id: "user123",
        schoolId: "school123",
        firstName: "John",
        lastName: "Doe",
        initials: "JD",
      });
    });
  });

  describe("when data is invalid", () => {
    describe("school", () => {
      describe("when school is missing", () => {
        it("should throw an error", () => {
          const data = {
            user: { id: "user123", firstName: "John", lastName: "Doe" },
          };

          expect(() => mapMeResponseToUser(data)).toThrow(
            "The school is missing",
          );
        });
      });

      describe("when school id is missing", () => {
        it("should throw an error", () => {
          const data = {
            school: {},
            user: { id: "user123", firstName: "John", lastName: "Doe" },
          };

          expect(() => mapMeResponseToUser(data)).toThrow("The id is missing");
        });
      });

      describe("when school id is of wrong type", () => {
        it("should throw an error", () => {
          const data = {
            school: { id: 123 },
            user: { id: "user123", firstName: "John", lastName: "Doe" },
          };

          expect(() => mapMeResponseToUser(data)).toThrow(
            "Type is not a string",
          );
        });
      });
    });

    describe("user", () => {
      describe("when user is missing", () => {
        it("should throw an error", () => {
          const data = {
            school: { id: "school123" },
          };

          expect(() => mapMeResponseToUser(data)).toThrow(
            "The user is missing",
          );
        });
      });

      describe("when user id is missing", () => {
        it("should throw an error", () => {
          const data = {
            school: { id: "school123" },
            user: { firstName: "John", lastName: "Doe" },
          };

          expect(() => mapMeResponseToUser(data)).toThrow("The id is missing");
        });
      });

      describe("when user id is of wrong type", () => {
        it("should throw an error", () => {
          const data = {
            school: { id: "school123" },
            user: { id: 123, firstName: "John", lastName: "Doe" },
          };

          expect(() => mapMeResponseToUser(data)).toThrow(
            "Type is not a string",
          );
        });
      });

      describe("when firstName is missing", () => {
        it("should throw an error", () => {
          const data = {
            school: { id: "school123" },
            user: { id: "user123", lastName: "Doe" },
          };

          expect(() => mapMeResponseToUser(data)).toThrow(
            "The firstName is missing",
          );
        });
      });

      describe("when firstName is of wrong type", () => {
        it("should throw an error", () => {
          const data = {
            school: { id: "school123" },
            user: { id: "user123", firstName: 123, lastName: "Doe" },
          };

          expect(() => mapMeResponseToUser(data)).toThrow(
            "Type is not a string",
          );
        });
      });

      describe("when lastName is missing", () => {
        it("should throw an error", () => {
          const data = {
            school: { id: "school123" },
            user: { id: "user123", firstName: "John" },
          };

          expect(() => mapMeResponseToUser(data)).toThrow(
            "The lastName is missing",
          );
        });
      });

      describe("when lastName is of wrong type", () => {
        it("should throw an error", () => {
          const data = {
            school: { id: "school123" },
            user: { id: "user123", firstName: "John", lastName: 123 },
          };

          expect(() => mapMeResponseToUser(data)).toThrow(
            "Type is not a string",
          );
        });
      });
    });
  });
});
