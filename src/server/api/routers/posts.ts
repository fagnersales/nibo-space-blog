import { type User, clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

const transformUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const limit = 100;

    const posts = await ctx.prisma.post.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: limit,
      })
    ).map(transformUserForClient);

    return posts.map((post) => ({
      post,
      get author() {
        const author = users.find((user) => user.id === post.authorId);

        if (!author)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "author not found for this post",
          });

        if (!author.username)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "author does not have a username",
          });

        return { ...author, username: author.username };
      },
    }));
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed").min(1).max(200),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await rateLimiter.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});
