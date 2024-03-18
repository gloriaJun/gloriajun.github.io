import Link from 'next/link';

import { getAllPostData } from '@/libs/post';

export function getStaticProps() {
  const allPostsData = getAllPostData();

  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({
  allPostsData,
}: {
  allPostsData: ReturnType<typeof getAllPostData>;
}) {
  return (
    <div>
      <h1>Home</h1>
      <p>
        Visit the <Link href="/about">About</Link> page.
      </p>

      <section>
        <h2>Blog List</h2>
        <ul>
          {allPostsData.map((item) => (
            <li key={item.id}>
              <h4>{item.title}</h4>
              <p>tags: {item.tags.toString()}</p>
              <p>date: {item.createdAt}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
