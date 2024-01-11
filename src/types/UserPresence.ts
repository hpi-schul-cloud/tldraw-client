import { TDUser } from "@tldraw/tldraw";

export type UserPresence = {
  tdUser?: TDUser;
};

export type UserMetadata = {
  id: string;
  displayName: string;
};
