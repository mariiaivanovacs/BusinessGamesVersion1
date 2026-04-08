import img1 from '/image_1.png'
import img2 from '/image_2.jpg'
import img3 from '/image_3.png'
import { formatDate, formatPrice } from '../utils/content'

const FALLBACK_IMAGES = [img1, img2, img3]

// Deterministic: same event always gets the same image across renders
function pickFallbackImage(slug, index) {
  const seed = (slug || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), index ?? 0)
  return FALLBACK_IMAGES[seed % FALLBACK_IMAGES.length]
}

export default function EventCard({ event, index }) {
  const fallbackSrc = pickFallbackImage(event.slug, index)
  const imageSrc    = event.image || fallbackSrc

  return (
    <article className="event-card">
      <div className="event-card__img">
        <img
          src={imageSrc}
          alt={event.title}
          loading="lazy"
        />
      </div>

      <div className="event-card__body">
        <div className="event-card__top">
          <span className="event-card__date">{formatDate(event.date)}</span>
          {event.status && event.status !== 'past' && (
            <span className={`tag tag-${event.status}`}>
              {{ future: 'Скоро', current: 'Сейчас' }[event.status] ?? event.status}
            </span>
          )}
        </div>

        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__desc">{event.description}</p>

        <div className="event-card__footer">
          <div>
            <div className="event-card__price-num">{formatPrice(event.price)}</div>
            <div className="event-card__price-lbl">на одного человека</div>
          </div>

          {event.payment_link
            ? (
              <a
                href={event.payment_link}
                className="btn-register"
                target="_blank"
                rel="noopener noreferrer"
              >
                Купить билет →
              </a>
            )
            : (
              <button className="btn-register" disabled>
                Скоро
              </button>
            )
          }
        </div>
      </div>
    </article>
  )
}
