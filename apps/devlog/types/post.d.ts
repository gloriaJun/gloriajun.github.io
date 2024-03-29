import { ParsedUrlQuery } from 'querystring';

export interface PostParams extends ParsedUrlQuery {
  id: string | Array<string>;
}

export interface FrontMatter {
  title: string;
  tags?: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostListItem extends FrontMatter {
  id: string;
}

export interface PostContentData extends PostListItem {
  content: string;
}
