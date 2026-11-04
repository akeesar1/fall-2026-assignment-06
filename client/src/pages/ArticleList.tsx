
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Article } from "../types";

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadArticles() {
      setLoading(true);
      setError("");

      try {
        const data = await api.getArticles(search);
        if (active) setArticles(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load articles."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const timer = window.setTimeout(loadArticles, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  return (
    <section>
      <h1>All Articles</h1>
      <p>Browse articles and share your thoughts.</p>

      <Link to="/articles/new">+ Create Article</Link>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search articles by title..."
      />

      {loading && <p>Loading articles...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && articles.length === 0 && (
        <div>
          <h2>No articles found</h2>
          <p>
            {search
              ? "Try a different search term."
              : "Create your first article."}
          </p>
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <>
          <p>{articles.length} article(s) found</p>

          <div>
            {articles.map((article) => (
              <article key={article.articleId}>
                <h2>{article.title}</h2>

                <p>
                  {article.contents.length > 160
                    ? article.contents.slice(0, 160) + "..."
                    : article.contents}
                </p>

                <Link to={`/articles/${article.articleId}`}>
                  Read Article →
                </Link>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
