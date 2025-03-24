import { TypeGuard } from "./type.guard";

describe("TypeGuard", () => {
  describe("checkKeyAndValueExists", () => {
    describe("when the key does not exist", () => {
      it("should throw an error", () => {
        const result = () => TypeGuard.checkKeyAndValueExists({}, "key");

        expect(result).toThrow("The key is missing");
      });
    });

    describe("when the key exists", () => {
      it("should not throw an error", () => {
        const result = () =>
          TypeGuard.checkKeyAndValueExists({ key: "value" }, "key");

        expect(result).not.toThrow();
      });
    });
  });

  describe("ensureKeyAndValueExists", () => {
    describe("when the key does not exist", () => {
      it("should throw an error", () => {
        const result = () => TypeGuard.ensureKeyAndValueExists({}, "key");

        expect(result).toThrow("The key is missing");
      });
    });

    describe("when the key exists", () => {
      it("should return the value", () => {
        const result = TypeGuard.ensureKeyAndValueExists(
          { key: "value" },
          "key",
        );

        expect(result).toBe("value");
      });
    });
  });

  describe("checkNumber", () => {
    describe("when the value is not a number", () => {
      it("should throw an error for string", () => {
        const result = () => TypeGuard.checkNumber("string");

        expect(result).toThrow("Type is not a number");
      });

      it("should throw an error for undefined", () => {
        const result = () => TypeGuard.checkNumber(undefined);

        expect(result).toThrow("Type is not a number");
      });

      it("should throw an error for null", () => {
        const result = () => TypeGuard.checkNumber(null);

        expect(result).toThrow("Type is not a number");
      });

      it("should throw an error for empty string", () => {
        const result = () => TypeGuard.checkNumber("");

        expect(result).toThrow("Type is not a number");
      });

      it("should throw an error for boolean", () => {
        const result = () => TypeGuard.checkNumber(true);

        expect(result).toThrow("Type is not a number");
      });

      it("should throw an error for object", () => {
        const result = () => TypeGuard.checkNumber({});

        expect(result).toThrow("Type is not a number");
      });

      it("should throw an error for array", () => {
        const result = () => TypeGuard.checkNumber([]);

        expect(result).toThrow("Type is not a number");
      });
    });

    describe("when the value is a number", () => {
      it("should not throw an error", () => {
        const result = () => TypeGuard.checkNumber(123);

        expect(result).not.toThrow();
      });
    });
  });

  describe("checkArray", () => {
    describe("when the value is not an array", () => {
      it("should throw an error for string", () => {
        const result = () => TypeGuard.checkArray("string");

        expect(result).toThrow("Type is not an array");
      });

      it("should throw an error for undefined", () => {
        const result = () => TypeGuard.checkArray(undefined);

        expect(result).toThrow("Type is not an array");
      });

      it("should throw an error for null", () => {
        const result = () => TypeGuard.checkArray(null);

        expect(result).toThrow("Type is not an array");
      });

      it("should throw an error for empty string", () => {
        const result = () => TypeGuard.checkArray("");

        expect(result).toThrow("Type is not an array");
      });

      it("should throw an error for number", () => {
        const result = () => TypeGuard.checkArray(123);

        expect(result).toThrow("Type is not an array");
      });

      it("should throw an error for object", () => {
        const result = () => TypeGuard.checkArray({});

        expect(result).toThrow("Type is not an array");
      });

      it("should throw an error for boolean", () => {
        const result = () => TypeGuard.checkArray(true);

        expect(result).toThrow("Type is not an array");
      });
    });

    describe("when the value is an array", () => {
      it("should not throw an error", () => {
        const result = () => TypeGuard.checkArray([]);

        expect(result).not.toThrow();
      });
    });
  });

  describe("checkBoolean", () => {
    describe("when the value is not a boolean", () => {
      it("should throw an error for string", () => {
        const result = () => TypeGuard.checkBoolean("string");

        expect(result).toThrow("Type is not a boolean");
      });

      it("should throw an error for undefined", () => {
        const result = () => TypeGuard.checkBoolean(undefined);

        expect(result).toThrow("Type is not a boolean");
      });

      it("should throw an error for null", () => {
        const result = () => TypeGuard.checkBoolean(null);

        expect(result).toThrow("Type is not a boolean");
      });

      it("should throw an error for empty string", () => {
        const result = () => TypeGuard.checkBoolean("");

        expect(result).toThrow("Type is not a boolean");
      });

      it("should throw an error for number", () => {
        const result = () => TypeGuard.checkBoolean(123);

        expect(result).toThrow("Type is not a boolean");
      });

      it("should throw an error for object", () => {
        const result = () => TypeGuard.checkBoolean({});

        expect(result).toThrow("Type is not a boolean");
      });

      it("should throw an error for array", () => {
        const result = () => TypeGuard.checkBoolean([]);

        expect(result).toThrow("Type is not a boolean");
      });
    });

    describe("when the value is a boolean", () => {
      it("should not throw an error", () => {
        const result = () => TypeGuard.checkBoolean(true);

        expect(result).not.toThrow();
      });
    });
  });

  describe("ensureString", () => {
    describe("when the value is not a string", () => {
      it("should throw an error for number", () => {
        const result = () => TypeGuard.ensureString(123);

        expect(result).toThrow("Type is not a string");
      });

      it("should throw an error for undefined", () => {
        const result = () => TypeGuard.ensureString(undefined);

        expect(result).toThrow("Type is not a string");
      });

      it("should throw an error for null", () => {
        const result = () => TypeGuard.ensureString(null);

        expect(result).toThrow("Type is not a string");
      });

      it("should throw an error for boolean", () => {
        const result = () => TypeGuard.ensureString(true);

        expect(result).toThrow("Type is not a string");
      });

      it("should throw an error for object", () => {
        const result = () => TypeGuard.ensureString({});

        expect(result).toThrow("Type is not a string");
      });

      it("should throw an error for array", () => {
        const result = () => TypeGuard.ensureString([]);

        expect(result).toThrow("Type is not a string");
      });
    });

    describe("when the value is a string", () => {
      it("should return the value", () => {
        const result = TypeGuard.ensureString("string");

        expect(result).toBe("string");
      });

      it("should return the value", () => {
        const result = TypeGuard.ensureString("");

        expect(result).toBe("");
      });
    });
  });

  describe("isNull", () => {
    describe("when the value is null", () => {
      it("should return true", () => {
        const result = TypeGuard.isNull(null);

        expect(result).toBe(true);
      });
    });

    describe("when the value is not null", () => {
      it("should return false", () => {
        const result = TypeGuard.isNull("string");

        expect(result).toBe(false);
      });
    });

    describe("when the value is undefined", () => {
      it("should return false", () => {
        const result = TypeGuard.isNull(undefined);

        expect(result).toBe(false);
      });
    });

    describe("when the value is an empty string", () => {
      it("should return false", () => {
        const result = TypeGuard.isNull("");

        expect(result).toBe(false);
      });
    });

    describe("when the value is a number", () => {
      it("should return false", () => {
        const result = TypeGuard.isNull(123);

        expect(result).toBe(false);
      });
    });

    describe("when the value is a boolean", () => {
      it("should return false", () => {
        const result = TypeGuard.isNull(true);

        expect(result).toBe(false);
      });
    });

    describe("when the value is an object", () => {
      it("should return false", () => {
        const result = TypeGuard.isNull({});

        expect(result).toBe(false);
      });
    });

    describe("when the value is an array", () => {
      it("should return false", () => {
        const result = TypeGuard.isNull([]);

        expect(result).toBe(false);
      });
    });
  });

  describe("isArray", () => {
    describe("when the value is an array", () => {
      it("should return true", () => {
        const result = TypeGuard.isArray([]);

        expect(result).toBe(true);
      });
    });

    describe("when the value is a string", () => {
      it("should return false", () => {
        const result = TypeGuard.isArray("string");

        expect(result).toBe(false);
      });
    });

    describe("when the value is a number", () => {
      it("should return false", () => {
        const result = TypeGuard.isArray(123);

        expect(result).toBe(false);
      });
    });

    describe("when the value is a boolean", () => {
      it("should return false", () => {
        const result = TypeGuard.isArray(true);

        expect(result).toBe(false);
      });
    });

    describe("when the value is an object", () => {
      it("should return false", () => {
        const result = TypeGuard.isArray({});

        expect(result).toBe(false);
      });
    });

    describe("when the value is null", () => {
      it("should return false", () => {
        const result = TypeGuard.isArray(null);

        expect(result).toBe(false);
      });
    });

    describe("when the value is undefined", () => {
      it("should return false", () => {
        const result = TypeGuard.isArray(undefined);

        expect(result).toBe(false);
      });
    });

    describe("when the value is an empty string", () => {
      it("should return false", () => {
        const result = TypeGuard.isArray("");

        expect(result).toBe(false);
      });
    });
  });

  describe("isRecord", () => {
    describe("when the value is an object", () => {
      it("should return true", () => {
        const result = TypeGuard.isRecord({});

        expect(result).toBe(true);
      });
    });

    describe("when the value is a string", () => {
      it("should return false", () => {
        const result = TypeGuard.isRecord("string");

        expect(result).toBe(false);
      });
    });

    describe("when the value is a number", () => {
      it("should return false", () => {
        const result = TypeGuard.isRecord(123);

        expect(result).toBe(false);
      });
    });

    describe("when the value is a boolean", () => {
      it("should return false", () => {
        const result = TypeGuard.isRecord(true);

        expect(result).toBe(false);
      });
    });

    describe("when the value is an array", () => {
      it("should return false", () => {
        const result = TypeGuard.isRecord([]);

        expect(result).toBe(false);
      });
    });

    describe("when the value is null", () => {
      it("should return false", () => {
        const result = TypeGuard.isRecord(null);

        expect(result).toBe(false);
      });
    });

    describe("when the value is undefined", () => {
      it("should return false", () => {
        const result = TypeGuard.isRecord(undefined);

        expect(result).toBe(false);
      });
    });

    describe("when the value is an empty string", () => {
      it("should return false", () => {
        const result = TypeGuard.isRecord("");

        expect(result).toBe(false);
      });
    });
  });

  describe("ensureRecord", () => {
    describe("when the value is a string", () => {
      it("should throw an error", () => {
        const result = () => TypeGuard.ensureRecord("string");

        expect(result).toThrow("Type is not an object.");
      });
    });

    describe("when the value is a number", () => {
      it("should throw an error", () => {
        const result = () => TypeGuard.ensureRecord(123);

        expect(result).toThrow("Type is not an object.");
      });
    });

    describe("when the value is a boolean", () => {
      it("should throw an error", () => {
        const result = () => TypeGuard.ensureRecord(true);

        expect(result).toThrow("Type is not an object.");
      });
    });

    describe("when the value is an array", () => {
      it("should throw an error", () => {
        const result = () => TypeGuard.ensureRecord([]);

        expect(result).toThrow("Type is not an object.");
      });
    });

    describe("when the value is null", () => {
      it("should throw an error", () => {
        const result = () => TypeGuard.ensureRecord(null);

        expect(result).toThrow("Type is not an object.");
      });
    });

    describe("when the value is undefined", () => {
      it("should throw an error", () => {
        const result = () => TypeGuard.ensureRecord(undefined);

        expect(result).toThrow("Type is not an object.");
      });
    });

    describe("when the value is an empty string", () => {
      it("should throw an error", () => {
        const result = () => TypeGuard.ensureRecord("");

        expect(result).toThrow("Type is not an object.");
      });
    });

    describe("when the value is an object", () => {
      it("should return the value", () => {
        const result = TypeGuard.ensureRecord({});

        expect(result).toEqual({});
      });
    });
  });
});
