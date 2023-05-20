import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import Image from "next/image";
import type { RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithAuthor) => {
  const { author, post } = props;

  return (
    <div className="flex gap-4 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt="Author image"
        className="h-12 w-12 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-2 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <span>{` · `}</span>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <span className="text-lg">{post.content}</span>
      </div>
    </div>
  );
};
