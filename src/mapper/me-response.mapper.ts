import { TypeGuard } from "../guards/type.guard";
import { User } from "../types/User";

export const mapMeResponseToUser = (data: unknown): User => {
  const record = TypeGuard.ensureRecord(data);

  const schoolAsUnknown = TypeGuard.ensureKeyAndValueExists(record, "school");
  const school = TypeGuard.ensureRecord(schoolAsUnknown);
  const schoolIdAsUnknown = TypeGuard.ensureKeyAndValueExists(school, "id");
  const schoolId = TypeGuard.ensureString(schoolIdAsUnknown);

  const userAsUnknown = TypeGuard.ensureKeyAndValueExists(record, "user");
  const user = TypeGuard.ensureRecord(userAsUnknown);

  const idAsUnknown = TypeGuard.ensureKeyAndValueExists(user, "id");
  const id = TypeGuard.ensureString(idAsUnknown);

  const firstNameAsUnknown = TypeGuard.ensureKeyAndValueExists(
    user,
    "firstName",
  );
  const firstName = TypeGuard.ensureString(firstNameAsUnknown);

  const lastNameAsUnknown = TypeGuard.ensureKeyAndValueExists(user, "lastName");
  const lastName = TypeGuard.ensureString(lastNameAsUnknown);

  return {
    id,
    schoolId,
    firstName,
    lastName,
    initials:
      firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase(),
  };
};
