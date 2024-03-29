import dayjs from 'dayjs';
import htmlParse from 'html-react-parser';


import { getAllPostData, getPostData } from '@/libs/post';
import { PostParams, PostContentData } from '@/types/post';

import type {
  InferGetStaticPropsType,
  GetStaticProps,
  GetStaticPaths,
} from 'next';

export const getStaticPaths = (() => {
  const paths = getAllPostData().map((file) => {
    return {
      params: {
        id: file.id.split('/'),
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
}) satisfies GetStaticPaths<PostParams>;

export const getStaticProps = (async (props) => {
  const postData = await getPostData(props.params!.id);

  return {
    props: {
      postData,
    },
  };
}) satisfies GetStaticProps<
  {
    postData: PostContentData;
  },
  PostParams
>;

export default function Post({
  postData,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <section>
      <h2>{postData.title}</h2>
      <p>
        {[postData.createdAt, postData.updatedAt].map((date, index) => (
          <span key={index}>{dayjs(date).format()}</span>
        ))}
      </p>
      <div>{htmlParse(postData.content)}</div>
    </section>
  );
}
