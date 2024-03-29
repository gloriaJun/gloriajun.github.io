import dayjs from 'dayjs';
import Link from 'next/link';
import { GetStaticProps, InferGetStaticPropsType } from 'next/types';

import { getAllPostData } from '@/libs/post';
import { PostListItem } from '@/types/post';

export const getStaticProps = (() => {
  const allPostsData = getAllPostData();

  return {
    props: {
      allPostsData,
    },
  };
}) satisfies GetStaticProps<{
  allPostsData: Array<PostListItem>;
}>;

export default function Home({
  allPostsData,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <h1>Home</h1>

      <section>
        <h2>Blog List</h2>
        <ul>
          {allPostsData.map((item) => (
            <li key={item.id}>
              <Link href={`/posts/${item.id}`}>
                <h4>{item.title}</h4>
              </Link>
              <p>tags: {item.tags?.toString()}</p>
              <p>date: {dayjs(item.createdAt).format()}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
