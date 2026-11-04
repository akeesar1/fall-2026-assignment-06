
import type { Article, Comment } from "./types";

const URL = "http://localhost:8080";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getArticles: (search = "") =>
    request<Article[]>(
      `/articles?title_contains=${encodeURIComponent(search)}`
    ),

  getArticle: (id: number) =>
    request<Article>(`/articles/${id}`),

  createArticle: (title: string, contents: string) =>
    request<Article>("/articles", {
      method: "POST",
      body: JSON.stringify({ title, contents }),
    }),

  updateArticle: (
    id: number,
    title: string,
    contents: string
  ) =>
    request<Article>(`/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, contents }),
    }),

  deleteArticle: (id: number) =>
    request<unknown>(`/articles/${id}`, {
      method: "DELETE",
    }),

  getComments: (articleId: number) =>
    request<Comment[]>(`/articles/${articleId}/comments`),

  addComment: (articleId: number, body: string) =>
    request<Comment>(`/articles/${articleId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),

  updateComment: (
    articleId: number,
    commentId: number,
    body: string
  ) =>
    request<Comment>(
      `/articles/${articleId}/comments/${commentId}`,
      {
        method: "PUT",
        body: JSON.stringify({ body }),
      }
    ),

  deleteComment: (articleId: number, commentId: number) =>
    request<unknown>(
      `/articles/${articleId}/comments/${commentId}`,
      { method: "DELETE" }
    ),
};
