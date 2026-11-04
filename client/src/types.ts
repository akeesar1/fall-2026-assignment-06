export interface Article {
  articleId: number;
  title: string;
  contents: string;
}

export interface Comment {
  commentId: number;
  articleId: number;
  body: string;
}
