import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import ArticleList from "./pages/ArticleList";
import ArticleDetail from "./pages/ArticleDetail";
import ArticleForm from "./pages/ArticleForm";

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <Link to="/">ArticleHub</Link>

        <nav>
          <Link to="/">Articles</Link>
          <Link to="/articles/new">+ New Article</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ArticleList />} />
          <Route path="/articles/new" element={<ArticleForm />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/articles/:id/edit" element={<ArticleForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer>ArticleHub - ITSC 3155 Assignment 06</footer>
    </BrowserRouter>
  );
}
