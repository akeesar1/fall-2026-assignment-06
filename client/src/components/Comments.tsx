import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api";
import type { Comment } from "../types";

export default function Comments({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadComments() {
      setLoading(true);
      setError("");

      try {
        const data = await api.getComments(articleId);
        if (active) setComments(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load comments."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadComments();

    return () => {
      active = false;
    };
  }, [articleId]);

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!body.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const comment = await api.addComment(articleId, body.trim());
      setComments((previous) => [...previous, comment]);
      setBody("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add comment."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(comment: Comment) {
    setEditingId(comment.commentId);
    setEditBody(comment.body);
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody("");
    setError("");
  }

  async function saveEdit(commentId: number) {
    setError("");

    if (!editBody.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    setBusyId(commentId);

    try {
      const updated = await api.updateComment(
        articleId,
        commentId,
        editBody.trim()
      );

      setComments((previous) =>
        previous.map((comment) =>
          comment.commentId === commentId ? updated : comment
        )
      );

      cancelEdit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to edit comment."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteComment(commentId: number) {
    if (!window.confirm("Delete this comment?")) return;

    setBusyId(commentId);
    setError("");

    try {
      await api.deleteComment(articleId, commentId);

      setComments((previous) =>
        previous.filter((comment) => comment.commentId !== commentId)
      );

      if (editingId === commentId) cancelEdit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete comment."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section>
      <h2>Comments ({comments.length})</h2>

      {error && <p>{error}</p>}
      {loading && <p>Loading comments...</p>}

      {!loading && comments.length === 0 && !error && (
        <p>No comments yet.</p>
      )}

      {!loading && comments.map((comment) => (
        <article key={comment.commentId}>
          {editingId === comment.commentId ? (
            <div>
              <textarea
                value={editBody}
                onChange={(event) => setEditBody(event.target.value)}
                rows={3}
              />

              <button
                type="button"
                onClick={() => saveEdit(comment.commentId)}
                disabled={busyId !== null}
              >
                Save
              </button>

              <button
                type="button"
                onClick={cancelEdit}
                disabled={busyId !== null}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <p>{comment.body}</p>

              <button
                type="button"
                onClick={() => startEdit(comment)}
                disabled={busyId !== null}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => deleteComment(comment.commentId)}
                disabled={busyId !== null}
              >
                {busyId === comment.commentId
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </>
          )}
        </article>
      ))}

      <form onSubmit={addComment} noValidate>
        <h3>Add Comment</h3>

        <label htmlFor="comment">Your Comment</label>
        <textarea
          id="comment"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder="Write a comment..."
        />

        <button type="submit" disabled={saving || loading}>
          {saving ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </section>
  );
}
