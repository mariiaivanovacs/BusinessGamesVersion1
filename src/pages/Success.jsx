import { Link, useSearchParams } from 'react-router-dom'

export default function Success() {
  const [params] = useSearchParams()
  const ticket = params.get('ticket') === 'vip' ? 'VIP' : 'Стандарт'

  return (
    <main className="success-page">
      <div className="success-page__inner">
        <div className="success-page__icon">✓</div>
        <h1 className="success-page__title">Оплата прошла!</h1>
        <p className="success-page__body">
          Билет «{ticket}» — ваше место забронировано.
          <br />Подтверждение придёт на почту в течение нескольких минут.
        </p>
        <Link to="/" className="btn btn-gold">На главную</Link>
      </div>
    </main>
  )
}
