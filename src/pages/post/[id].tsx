import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssg";
import { PostView } from "~/components/postView";

type PageProps = {
  id: string;
};

const SinglePostPage: NextPage<PageProps> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({
    id,
  });

  if (!data) return <div>404 - Post not found</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssgHelpers = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no slug xD");

  await ssgHelpers.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssgHelpers.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SinglePostPage;
