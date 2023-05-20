import { type User } from "@clerk/nextjs/server";

export const transformUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};