import { Link } from 'react-router-dom'
import { siteSupport } from '../content/siteContent'
import './InfoPage.css'

type InfoSection = {
  title: string
  body: readonly string[]
}

type InfoPageProps = {
  eyebrow: string
  title: string
  subtitle: string
  sections: readonly InfoSection[]
}

export default function InfoPage({ eyebrow, title, subtitle, sections }: InfoPageProps) {
  return (
    <main className="info-page">
      <section className="info-hero">
        <span className="info-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <section className="info-content">
        <div className="info-sections">
          {sections.map((section) => (
            <article key={section.title} className="info-card">
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>

        <aside className="info-side-card">
          <h2>Need help?</h2>
          <p>
            If you have questions about these policies or accessibility support, contact the Civis support team.
          </p>
          <div className="info-contact-list">
            {siteSupport.phone && <a href={`tel:${siteSupport.phone}`}>{siteSupport.phone}</a>}
            <a href={`mailto:${siteSupport.email}`}>{siteSupport.email}</a>
          </div>
          <div className="info-side-actions">
            <Link to="/faq" className="info-btn primary">Open FAQ</Link>
            <Link to="/" className="info-btn ghost">Back to home</Link>
          </div>
        </aside>
      </section>
    </main>
  )
}
