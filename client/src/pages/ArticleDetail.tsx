
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { Article } from "../types";
import Comments from "../components/Comments";

export default function ArticleDetail() {
  const { id } = useParams();
  const articleId = Number(id);
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadArticle() {
      setLoading(true);
      setError("");
      setArticle(null);

      try {
        const data = await api.getArticle(articleId);
        if (active) setArticle(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load article."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadArticle();

    return () => {
      active = false;
    };
  }, [articleId]);

  async function handleDelete() {
    if (!window.confirm("Delete this article?")) return;

    setDeleting(true);
    setError("");

    try {
      await api.deleteArticle(articleId);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete article."
      );
      setDeleting(false);
    }
  }

  if (loading) return <p>Loading article...</p>;

  if (!article) {
    return (
      <section>
        <h2>Article not found</h2>
        {error && <p>{error}</p>}
        <Link to="/">Back to Articles</Link>
      </section>
    );
  }

  return (
    <section>
      <Link to="/">← Back to Articles</Link>

      <article>
        <h1>{article.title}</h1>
        <p>{article.contents}</p>

        <Link to={`/articles/${articleId}/edit`}>
          Edit Article
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Article"}
        </button>

        {error && <p>{error}</p>}
      </article>

      <Comments articleId={articleId} />
    </section>
  );
}
