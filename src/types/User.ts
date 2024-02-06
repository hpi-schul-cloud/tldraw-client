export type User = {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  initials: string;
};

export type UserResult = {
  user?: User;
  statusCode: number;
};
