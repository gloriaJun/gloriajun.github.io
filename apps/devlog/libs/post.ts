import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), '../../content/posts');

type FrontMatter = {
  title: string;
  tags: string[];
  createAt: string;
  updateAt: string;
};

export function getAllPostData() {
  // Get file names under the post root directory
  const fileList = fs.readdirSync(postsDirectory, { recursive: true });

  const allPostsData: Array<
    FrontMatter & {
      id: string;
      encodedId: string;
    }
  > = fileList
    .map((file) => {
      if (typeof file !== 'string') {
        return;
      }

      const ext = path.extname(file);
      if (!['.md'].includes(ext)) {
        return;
      }

      // Remove ".md" from file name to get id
      const id = file.replace(new RegExp(`${ext}$`), '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      return {
        id,
        encodedId: encodeURIComponent(id),
        ...(matterResult.data as FrontMatter),
      };
    })
    .filter((data) => !!data);

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.createAt < b.createAt) {
      return 1;
    } else {
      return -1;
    }
  });
}
