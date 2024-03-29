import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

import {
  FrontMatter,
  PostContentData,
  PostListItem,
  PostParams,
} from '@/types/post';

const postsDirectory = path.join(process.cwd(), '../../content/posts');
// const postsDirectory = path.join(process.cwd(), './_contents/posts');
const markdownExtension = '.md';

const getMarkdownContent = ((file) => {
  // Read markdown file as string
  const fullPath = path.join(postsDirectory, file);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const { data, ...matterResult } = matter(fileContents);

  return {
    data: data as FrontMatter,
    ...matterResult,
  };
}) satisfies (
  file: string,
) => Omit<ReturnType<typeof matter>, 'data'> & { data: FrontMatter };

export const getAllPostData = (() => {
  // Get file names under the post root directory
  const fileList = fs.readdirSync(postsDirectory, { recursive: true });

  const allPostsData = fileList.reduce((result: Array<PostListItem>, file) => {
    if (typeof file === 'string' && markdownExtension === path.extname(file)) {
      // Remove ".md" from file name to get id
      const id = file.replace(new RegExp(`${markdownExtension}$`), '');
      const matterResult = getMarkdownContent(file);

      result.push({
        id,
        ...matterResult.data,
      });
    }

    return result;
  }, []);

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.createdAt < b.createdAt) {
      return 1;
    } else {
      return -1;
    }
  });
}) satisfies () => Array<PostListItem>;

export const getPostData = (async (ids) => {
  const id = Array.isArray(ids) ? ids.join('/') : ids;
  const matterResult = getMarkdownContent(`${id}${markdownExtension}`);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  return {
    ...matterResult.data,
    id,
    content: processedContent.toString(),
  };
}) satisfies (ids: ValueOfType<PostParams, 'id'>) => Promise<PostContentData>;
