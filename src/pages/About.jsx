import bgImage from '/background_2.png'
import { loadAboutPerson, resolveAssetPath } from '../utils/content'

const FALLBACK = {
  name:  'Наталья Крюкова',
  role:  'Спикер',
  bio:   'Совладелец производственной компании в сфере металлообработки. Основатель центра бизнес-трекинга Асцель. Эксперт по стратегической диагностике. Бизнес-трекер для собственников и управленцев. Более 20 лет в управлении.',
  photo: null,
  social_links: [],
  stats: [
    { num: '70+',  lbl: 'Сессий' },
    { num: '25+',  lbl: 'Компаний' },
    { num: '350+', lbl: 'Участников' },
  ],
}

const SOCIAL_LABELS = {
  'linkedin':  'LinkedIn',
  't.me':      'Telegram',
  'telegram':  'Telegram',
  'instagram': 'Instagram',
  'twitter':   'Twitter / X',
  'facebook':  'Facebook',
  'vk.com':    'ВКонтакте',
}

function getSocialLabel(url) {
  if (!url) return 'Ссылка'
  const lower = url.toLowerCase()
  for (const [key, label] of Object.entries(SOCIAL_LABELS)) {
    if (lower.includes(key)) return label
  }
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return 'Ссылка' }
}

export default function About() {
  const bgUrl = `url(${bgImage})`

  const raw    = loadAboutPerson()
  const data   = raw ?? FALLBACK

  const photoSrc  = resolveAssetPath(data.photo)
  const bioParas  = (data.bio ?? '').split('\n\n').filter(Boolean)
  const links     = Array.isArray(data.social_links) ? data.social_links.filter(Boolean) : []
  const stats     = Array.isArray(data.stats) && data.stats.length ? data.stats : FALLBACK.stats

  return (
    <main>
      {/* ── Page Hero ── */}
      <section className="page-hero">
        <div className="page-hero__bg" style={{ backgroundImage: bgUrl }} />
        <div className="page-hero__overlay" />
        <div className="container page-hero__content">
          <h2 className="page-hero__title">Немного о нас</h2>
        </div>
      </section>

      {/* ── About Content ── */}
      <section className="about-page">
        <div className="container">
          <div className="about-grid">

            {/* Photo column */}
            <div className="about-photo-sticky">
              <div className="about-photo">
                {photoSrc
                  ? <img src={photoSrc} alt={data.name} />
                  : (
                    <div className="about-photo__placeholder">
                      {data.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                  )
                }
              </div>
            </div>

            {/* Bio column */}
            <div>
              <div className="about-role-pill">Организатор бизнес-игр в г. Казань</div>

              <h1 className="about-name">{data.name}</h1>
              <p className="about-role">{data.role ?? 'Основатель'}</p>

              <div className="about-highlights">
                {stats.map((h, i) => (
                  <div key={i} className="highlight-card">
                    <div className="highlight-card__num">{h.num}</div>
                    <div className="highlight-card__lbl">{h.lbl}</div>
                  </div>
                ))}
              </div>

              <div className="divider" />

              {bioParas.map((para, i) => (
                <p key={i} className="about-bio">{para}</p>
              ))}

              {links.length > 0 && (
                <div className="social-row">
                  {links.map((url, i) => (
                    <a key={i} href={url} className="social-link"
                      target="_blank" rel="noopener noreferrer">
                      {getSocialLabel(url)} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
