import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <p className="not-found-code">404</p>
        <h1>Page not found</h1>
        <p className="not-found-copy">
          The page you opened does not exist or the link is no longer valid.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn primary">Go to home</Link>
          <Link to="/faq" className="not-found-btn ghost">Open FAQ</Link>
        </div>
      </section>
    </main>
  )
}
