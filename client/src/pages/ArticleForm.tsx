import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = id !== undefined;
  const articleId = Number(id);

  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;

    let active = true;

    async function loadArticle() {
      setLoading(true);

      try {
        const article = await api.getArticle(articleId);

        if (active) {
          setTitle(article.title);
          setContents(article.contents);
        }
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
  }, [articleId, isEditing]);

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!title.trim() || !contents.trim()) {
      setError("Title and contents cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const article = isEditing
        ? await api.updateArticle(
            articleId,
            title.trim(),
            contents.trim()
          )
        : await api.createArticle(
            title.trim(),
            contents.trim()
          );

      navigate(`/articles/${article.articleId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save article."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading article...</p>;

  return (
    <section>
      <h1>{isEditing ? "Edit Article" : "Create Article"}</h1>

      <form onSubmit={handleSubmit} noValidate>
        {error && <p>{error}</p>}

        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label htmlFor="contents">Contents</label>
        <textarea
          id="contents"
          rows={10}
          value={contents}
          onChange={(event) => setContents(event.target.value)}
        />

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Article"}
        </button>

        <Link to={isEditing ? `/articles/${articleId}` : "/"}>
          Cancel
        </Link>
      </form>
    </section>
  );
}
