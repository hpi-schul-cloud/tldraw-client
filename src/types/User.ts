export type User = {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  initials: string;
};

export interface UserResponse {
  code: number;
  user: User | undefined;
}
