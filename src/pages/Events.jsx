import { useState, useEffect } from 'react'
import bgImage from '/background_el.JPG'
import EventCard from '../components/EventCard'
import { fetchEvents } from '../utils/content'

const FILTERS = [
  { key: 'all',     label: 'Все' },
  { key: 'current', label: 'Идут сейчас' },
  { key: 'future',  label: 'Скоро' },
]

export default function Events() {
  const [filter, setFilter] = useState('all')
  const [allEventsFull, setAllEventsFull] = useState([])
  const bgUrl = `url(${bgImage})`

  useEffect(() => {
    fetchEvents().then(data => setAllEventsFull(data.filter(e => e.status !== 'past')))
  }, [])

  const allEvents = allEventsFull

  const displayed = filter === 'all'
    ? allEvents
    : allEvents.filter(e => e.status === filter)

  return (
    <main>
      {/* ── Page Hero ── */}
      <section className="page-hero">
        <div className="page-hero__bg" style={{ backgroundImage: bgUrl }} />
        <div className="page-hero__overlay" />
        <div className="container page-hero__content">
          <p className="label page-hero__label">Мероприятия и программы</p>
          <h1 className="page-hero__title">
            Найдите<br />свою игру
          </h1>
        </div>
      </section>

      {/* ── Events List ── */}
      <section className="events-page">
        <div className="container">
          <div className="filter-bar" role="group" aria-label="Фильтр мероприятий">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`filter-btn${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="events-grid">
            {displayed.length > 0
              ? displayed.map(e => <EventCard key={e.slug} event={e} />)
              : (
                <div className="empty-state">
                  <div className="empty-state__icon">◆</div>
                  <p className="empty-state__msg">Мероприятий не найдено</p>
                  <p className="empty-state__sub">
                    Заходите позже — новые программы добавляются регулярно.
                  </p>
                </div>
              )
            }
          </div>
        </div>
      </section>
    </main>
  )
}
