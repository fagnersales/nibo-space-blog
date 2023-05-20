import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { transformUserForClient } from "~/server/helpers/transformUserForClient";

export const profileRouter = createTRPCRouter({
  getByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return transformUserForClient(user);
    }),
});
