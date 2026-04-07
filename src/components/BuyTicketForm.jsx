import { useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const TICKET_OPTIONS = [
  { key: 'standard', label: 'Стандарт', price: '5 900 ₽', desc: 'Полный день фестиваля' },
  { key: 'vip',      label: 'VIP',      price: '9 900 ₽', desc: 'Фестиваль + индивидуальный разбор после' },
]

export default function BuyTicketForm({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', ticket_type: 'standard' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/create-payment`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка сервера')
      window.location.href = data.confirmation_url
    } catch (err) {
      setError(err.message || 'Не удалось создать платёж. Попробуйте ещё раз.')
      setLoading(false)
    }
  }

  return (
    <div className="buy-form__backdrop" onClick={onClose}>
      <div className="buy-form" onClick={e => e.stopPropagation()}>
        <button className="buy-form__close" onClick={onClose} aria-label="Закрыть">✕</button>
        <h2 className="buy-form__title">Занять место</h2>
        <p className="buy-form__sub">Заполните форму — вас перенаправят на страницу оплаты YooKassa.</p>

        <form onSubmit={handleSubmit} className="buy-form__fields">
          <div className="buy-form__ticket-row">
            {TICKET_OPTIONS.map(opt => (
              <label
                key={opt.key}
                className={`buy-form__ticket-option${form.ticket_type === opt.key ? ' selected' : ''}`}
              >
                <input
                  type="radio"
                  name="ticket_type"
                  value={opt.key}
                  checked={form.ticket_type === opt.key}
                  onChange={set('ticket_type')}
                />
                <div className="buy-form__ticket-label">{opt.label}</div>
                <div className="buy-form__ticket-price">{opt.price}</div>
                <div className="buy-form__ticket-desc">{opt.desc}</div>
              </label>
            ))}
          </div>

          <input
            className="buy-form__input"
            type="text"
            placeholder="Ваше имя *"
            value={form.name}
            onChange={set('name')}
            required
          />
          <input
            className="buy-form__input"
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={set('email')}
            required
          />
          <input
            className="buy-form__input"
            type="tel"
            placeholder="Телефон (необязательно)"
            value={form.phone}
            onChange={set('phone')}
          />

          {error && <p className="buy-form__error">{error}</p>}

          <button type="submit" className="btn btn-gold buy-form__submit" disabled={loading}>
            {loading ? 'Переход к оплате…' : 'Оплатить →'}
          </button>
        </form>
      </div>
    </div>
  )
}
