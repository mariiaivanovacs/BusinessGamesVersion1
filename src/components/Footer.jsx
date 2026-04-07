import { Link } from 'react-router-dom'
import partner1 from '/partner_1.png'
import partner2 from '/partner_2.png'

const EMAIL   = 'hello@businessgames.ru'
const VK_URL  = 'https://vk.com/businessgames'

function IconEmail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  )
}

function IconVK() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.77 3.352c-1.312 2.537-1.882 2.658-2.138 2.487-.592-.382-.44-1.544-.44-2.369V7.75c0-.69-.206-1.1-.8-1.1h-4.4c-.468 0-.752.356-.752.692 0 .729.996.897 1.098 2.942v4.445c0 .99-.178 1.17-.563 1.17-1.028 0-3.528-3.53-5.01-7.573C3.567 7.716 3.268 7 2.519 7H.274C-.218 7 0 7.488 0 7.75c0 .776 1.017 4.676 4.758 9.822C7.216 20.712 10.502 22 13.602 22c1.908 0 2.202-.437 2.202-1.19v-2.737c0-.52.108-.624.471-.624.267 0 .726.135 1.796 1.168C19.363 20.31 19.626 22 20.628 22h3.19c.493 0 .741-.248.596-.737-.156-.485-.988-1.499-2.071-2.55-.572-.669-1.432-1.39-1.696-1.755-.267-.422-.19-.61 0-1.013.001 0 2.672-3.887 2.951-5.211.14-.448 0-.75-.618-.75z" />
    </svg>
  )
}

const PARTNERS = [
  { name: 'Асцель — Центр бизнес-трекинга', logo: partner1 },
  { name: 'Международная школа трансформации',    logo: partner2 },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">

          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">Бизнес Игры</div>
            <p className="footer__tagline">
              Инструмент, который показывает реальные управленческие паттерны. 
              И точку, где теряется результат — становится видно.
            </p>
          </div>

          {/* Partners */}
          <div className="footer__partners">
            <p className="footer__col-heading">Партнёры</p>
            <div className="footer__partners-list">
              {PARTNERS.map(p => (
                <div key={p.name} className="footer__partner">
                  <img src={p.logo} alt={p.name} className="footer__partner-logo" />
                  <span className="footer__partner-name">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="footer__contacts-col">
            <p className="footer__col-heading">Контакты</p>
            <div className="footer__contacts">
              <a href={`mailto:${EMAIL}`} className="footer__contact-link"
                aria-label="Написать на почту" title={EMAIL}>
                <IconEmail />
              </a>
              <a href={VK_URL} className="footer__contact-link"
                aria-label="ВКонтакте" title="ВКонтакте"
                target="_blank" rel="noopener noreferrer">
                <IconVK />
              </a>
            </div>
          </div>

        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} Бизнес Игры. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
