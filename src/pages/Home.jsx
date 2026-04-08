import { Link } from 'react-router-dom'

// Backgrounds
import bgImage  from '/background_el.JPG'
import bg2      from '/background_2.png'

// Partners (same as in footer)
import partner1 from '/partner_1.png'
import partner2 from '/partner_2.png'

const HERO_PARTNERS = [
  { name: 'Асцель — Центр бизнес-трекинга', logo: partner1 },
  { name: 'Международная школа трансформации',    logo: partner2 },
]

// Hero / section images
import teamImg     from '/image_2.jpg'
import billiardsImg from '/image_1.png'

// Silver icons
import chessIcon from '/chess_icon.png'
import arrowIcon from '/arrow_icon.png'
import pinIcon   from '/pin_icon.png'
import globeIcon from '/globe_icon.png'
import wowIcon   from '/wow_icon.png'
import hashIcon  from '/hash_icon.png'
import envelopeIcon from '/envelope_icon.png'

// change wowIcon size 
// wowIcon.style.width = '40px';
// wowIcon.style.height = '40px';


import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import { fetchEvents } from '../utils/content'

// Примеры сценариев (из content.md)
const PROGRAMS = [
  {
    icon: chessIcon,
    title: 'Стратегия vs операционка',
    body: 'Где именно стратегия перестаёт работать — и почему операционка её вытесняет.',
    duration: '',
  },
  {
    icon: arrowIcon,
    title: 'Мышление собственника',
    body: 'Почему команда не берёт уровень бизнеса и не думает как предприниматель.',
    duration: '',
  },
  {
    icon: pinIcon,
    title: 'Принятие решений под давлением',
    body: 'Кто реально влияет на результат — и где решения теряются на пути к действию.',
    duration: '',
  },
  {
    icon: chessIcon,
    title: 'Роль руководителя',
    body: 'Где заканчивается управление и начинается хаос в зоне ответственности.',
    duration: '',
  },
  {
    icon: arrowIcon,
    title: 'Командная динамика',
    body: 'Почему люди не слышат друг друга — и как это влияет на результат бизнеса.',
    duration: '',
  },
]

// Формат фестиваля — 3 блока
const FESTIVAL_BLOCKS = [
  {
    num: '01',
    duration: '40 мин',
    title: 'Как мышление управляет тобой',
    desc: 'Мастер-класс без воды',
    points: [
      'Почему мы принимаем одни и те же плохие решения годами',
      '3 уровня мышления: тактик, стратег, архитектор',
      'Твоя слабая зона и ресурсы новых возможностей — задание на игры',
    ],
  },
  {
    num: '02',
    duration: '150 мин',
    title: 'Игровая зона — 7 столов',
    desc: 'Ты выбираешь игру под свой запрос',
    points: [
      '«Переговори меня, если сможешь» — переговоры на равных',
      '«Время лидера» — мышление лидера и прокачка своих компетенций',
      '«Игра, которая изменит жизнь» — переговоры с тем, кто сильнее',
      '«Прицелься» — фокус и точность в целях',
    ],
  },
  {
    num: '03',
    duration: '30 мин',
    title: 'Вынести мышление в жизнь',
    desc: 'Мастер-класс, где ты',
    points: [
      'Собираешь 3 главных инсайта',
      'Сравниваешь, с чем пришёл и что стало',
      'Создаёшь личный протокол действий',
      'Говоришь первый шаг вслух (публичный контракт)',
    ],
  },
]

// Для кого (из content.md)
const FOR_WHO = [
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="14" r="7" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M30 22l4 4-4 4M34 26H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Предприниматели',
    body: 'Хотите видеть систему управления, а не гипотезы о том, почему бизнес не растёт.',
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="14" r="7" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 28h16M24 28v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'HR',
    body: 'Ищете не «активности для галочки», а форматы, которые реально меняют поведение команды.',
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="14" r="7" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M19 29l5-3 5 3v6l-5 3-5-3v-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Руководители',
    body: 'Нет нужного результата и непонятно, где «слабое звено».',
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="14" r="7" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 32h12M18 36h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Устал от теории',
    body: 'Хочешь практические инструменты, которые работают прямо сейчас.',
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="5.5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="32" cy="16" r="5.5" stroke="currentColor" strokeWidth="2"/>
        <path d="M4 38c0-6.627 5.373-12 12-12h16c6.627 0 12 5.373 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Ищешь окружение',
    body: 'Хочешь быть среди людей, которые тоже идут в рост, а не стоят на месте.',
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="14" r="7" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="14" r="3" fill="currentColor" opacity="0.3"/>
        <path d="M24 31v4M22 33h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Осознанный',
    body: 'Понимаешь: мышление — это основа денег, отношений, здоровья и свободы.',
  },
]

const REVIEWS = [
  {
    text: 'Я не ожидал, что за один день можно так сильно изменить угол зрения. Игры — это честно. Ты не спрячешься за словами.',
    author: 'Участник фестиваля',
  },
  {
    text: 'Я думал, что иду играть в бизнес. А пришёл играть в себя. Рекомендую всем, кто чувствует, что застрял.',
    author: 'Участник фестиваля',
  },
  {
    text: 'Я не предприниматель. Подруга позвала на фестиваль, я шла с мыслью "ну игры так игры". А оказалось, что бизнес-игра — это зеркало. В игре "Переговори меня, если сможешь" я поняла, как часто в жизни отказываюсь от своих желаний, даже не начав торговаться. Спасибо. Очень жду следующего фестиваля.',
    author: 'Участница фестиваля',
  },
]

// Результаты (из content.md)
const RESULTS = [
  { verb: 'Увидеть', text: 'слабые места системы управления' },
  { verb: 'Понять', text: 'где именно теряется результат' },
  { verb: 'Изменить', text: 'модель принятия решений' },
  { verb: 'По-другому выстроить', text: 'работу команды' },
];

export default function Home() {
  const bgUrl  = `url(${bgImage})`
  const bg2Url = `url(${bg2})`

  const [upcomingEvents, setUpcomingEvents] = useState([])
  useEffect(() => {
    fetchEvents().then(data =>
      setUpcomingEvents(
        data.filter(e => e.status === 'current' || e.status === 'future').slice(0, 3)
      )
    )
  }, [])

  return (
    <main>

      {/* ── HERO ── */}
      <section className="hero">
        {/* <div className="hero__bg hero__bg--gradient" /> */}
        <div className="hero__bg" style={{ backgroundImage: bgUrl }} />
        <div className="hero__overlay"  />

        <div className="container hero__content">
          <div className="hero__left">
            <p className="label hero__label">Бизнес-игры, как инструмент решения реальных задач</p>

            <h1 className="hero__title">
              <div>Территория мышления<br /></div>
              <div><em>Фестиваль бизнес-игр</em></div>
            </h1>

            <p className="hero__subtitle">
              Помогаем предпринимателям и руководителям управлять
              своей компанией и жизнью как целостным проектом.
              Не через теорию. А через практический формат.
            </p>

            <div className="hero__actions">
              <Link to="/events" className="btn btn-gold">Мероприятия</Link>
              <Link to="/about" className="btn btn-outline-light">О нас →</Link>
            </div>
          </div>
        </div>

        {/* ── PARTNER BADGES — bottom-right of hero ── */}
        <div className="hero__partners">
          <p className="hero__partners-label">Партнёры</p>
          <div className="hero__partners-list">
            {HERO_PARTNERS.map(p => (
              <div key={p.name} className="hero__partner-badge">
                <img src={p.logo} alt={p.name} className="hero__partner-badge-logo" />
                <span className="hero__partner-badge-name">{p.name}</span>
              </div>
            ))}
          </div>
          {/* small name */}
          <p className="hero__partners-small-name">ИП Крюкова</p>
        </div>

        <div className="hero__scroll">
          <div className="hero__scroll-line" />
          <span>Листать</span>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-strip">
        <div className="container stats-container">
          <div className="stats-strip__grid">
            {[
              { num: '70+',   lbl: 'Сессий' },
              { num: '350+',  lbl: 'Участников' },
              { num: '25+',   lbl: 'Компаний' },
              { num: '4.9/5', lbl: 'Рейтинг' },
            ].map(s => (
              <div key={s.lbl} className="stat-item">
                <div className="stat-item__num">{s.num}</div>
                <div className="stat-item__lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND INTRO ── */}
      <section className="brand-intro">
        <div className="brand-intro__grid">
          <div className="brand-intro__visual">
            <img src={teamImg} alt="Бизнес-игра в процессе" />
          </div>

          <div className="brand-intro__content">
            <div className="section-header__icon-wrapper">
              <img src={pinIcon} alt="" className="section-header__icon" />

              <p className="label brand-intro__label">О проекте</p>
            </div>
            <div className="divider" />
            <h2 className="brand-intro__heading">
              Ошибаться в бизнесе - дорого. В игре - полезно. <br />
            </h2>
            <p className="brand-intro__body">
              У тебя есть знания, навыки, компетенции, но чувствуешь — не хватает деталей.
            </p>
            <p className="brand-intro__body" style={{ marginTop: '0.875rem' }}>
              Представьте: вы заходите в зал, где нет «правильных ответов» и лекций.
              Только живые сценарии, практика в моменте и внедрение изменений.
              <strong> Это формат, где скрытое становится «видимым».</strong>
            </p>

            <div className="brand-pillars-flow" style={{ marginTop: '2rem' }}>
              {[
                { icon: chessIcon, title: 'Наблюдаешь опыт других', body: 'Как принимают решения, как распределяется ответственность, где возникают конфликты.' },
                { icon: hashIcon, title: 'Тестируешь гипотезы', body: 'Проверяете новые модели без риска.' },
                { icon: wowIcon, title: 'Видишь себя в действии', body: 'Как ты реально принимаешь решения: из страха, в дефиците — или из ресурса.' },
              ].map(p => (
                <div key={p.title} className="pillar-flow">
                  <img
                    src={p.icon}
                    alt=""
                    className={`pillar-flow__icon ${p.icon === hashIcon ? 'pillar-flow__icon--hash' : ''}`}
                  />
                  <div>
                    <div className="pillar-flow__title">{p.title}</div>
                    <div className="pillar-flow__body">{p.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <blockquote className="brand-intro__quote">
              «Я пришёл как предприниматель, а ушёл как человек, который наконец понял, почему торможу в жизни целом».
              <cite>— участник прошлого фестиваля</cite>
            </blockquote>
          </div>
        </div>
      </section>


      

      {/* ── BRAND INTRO BANNER (tablet / mobile: horizontal image) ── */}
      <div className="brand-intro__banner">
        <img src={teamImg} alt="Бизнес-игра в процессе" />
      </div>

      

      {/* ── PROGRAMS — примеры сценариев ── */}
     

      {/* ── METHODOLOGY — формат работы ── */}
      <section className="methodology section">
        <div className="methodology__bg" style={{ backgroundImage: bgUrl }} />
        <div className="methodology__overlay" />

        <div className="container methodology__inner">
          {/* Left: format description */}
          <div className="methodology__left">
            <div className="section-header__icon-wrapper">
              <img src={chessIcon} alt="" className="section-header__icon" />
              <p className="label methodology__label">Наш продукт</p>
            </div>
            <div className="divider" />
            <h2 className="methodology__heading">
              Как устроен фестиваль
            </h2>
            <p className="methodology__body">
              3 блока = полная перезагрузка мышления.
              Вы не слушаете лекции. Вы участвуете, тестируете и уходите с личным протоколом действий.
            </p>

            <div className="cycle-flow">
              {FESTIVAL_BLOCKS.map(block => (
                <div key={block.num} className="cycle-flow__item">
                  <div className="cycle-flow__num">{block.num}</div>
                  <div>
                    <div className="cycle-flow__title">{block.title} <span style={{ color: 'var(--c-gold)', fontSize: '0.8em', fontWeight: 400 }}>— {block.duration}</span></div>
                    <div className="cycle-flow__desc">{block.desc}</div>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem', listStyle: 'disc' }}>
                      {block.points.map(pt => (
                        <li key={pt} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', marginBottom: '0.2rem' }}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: «что происходит в бизнесе» */}
          <div className="sample-editorial">
            <div className="sample-editorial__img">
              <img src={billiardsImg} alt="Бизнес-игра в действии" />
            </div>

            
            <h3 className="sample-editorial__title">
              Мы работаем с компаниями, которые хотят не просто «обучить сотрудников»,<br /> а улучшить бизнес-процессы и управляемость.
            </h3>
            <div className="sample-editorial__tag">Что происходит в бизнесе</div>


            <p className="sample-editorial__desc">
              Большинство проблем компании не в рынке и не в команде.
              Они в том, как устроены управление, коммуникация и принятие решений.
              И цена этого — ваше время, энергия и упущенный рост.
            </p>

            <div className="sample-editorial__outcomes">
              {[
                'Команда выполняет задачи, но не думает как бизнес',
                'Ответственность размыта — ключевые решения всё равно на вас',
                'Взаимодействие есть, но результата не даёт',
                'Система не держится без ручного контроля собственника',
              ].map(o => (
                <div key={o} className="sample-editorial__outcome">{o}</div>
              ))}
            </div>

            <div className="sample-editorial__meta">
              {[
                { val: '4–5ч',  lbl: 'Длительность' },
                { val: '8–35',  lbl: 'Участников' },
                { val: 'Live',  lbl: 'Формат' },
                { val: '1 день', lbl: 'Результат' },
              ].map(m => (
                <div key={m.lbl} className="sample-meta-item">
                  <div className="sample-meta-item__val">{m.val}</div>
                  <div className="sample-meta-item__lbl">{m.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


        {/* ── ДЛЯ КОГО ── */}
      <section className="for-who section">
        <div className="container">
          <div className="section-header">
            <div className="section-header__icon-wrapper">
              <img src={globeIcon} alt="" className="section-header__icon" />
              <p className="label section-label for-who__label">Для кого</p>
            </div>
            <h2 className="section-heading">
              Формат выбирают те,<br />кто хочет видеть реальность.
            </h2>
            <p className="section-sub">
              Бизнес-игра — не только тренажёр для предпринимателей, а универсальный инструмент осознанного человека:
              прокачать решения, сломать шаблоны, увидеть свои слепые зоны и выйти с протоколом действий,
              который работает — дома, в карьере и в отношениях.
            </p>
          </div>

          <div className="for-who__grid">
            {FOR_WHO.map(w => (
              <div key={w.title} className="for-who-card">
                <div className="for-who-card__avatar">
                  {w.svg}
                </div>
                <div className="for-who-card__title">{w.title}</div>
                <p className="for-who-card__body">{w.body}</p>
              </div>
            ))}
          </div>

          <p className="for-who__closing">
            Твоя профессия не важна. Важно, что ты интересуешься своей жизнью как целостным проектом.
          </p>

          <h2 className="section-heading" style={{ marginTop: '3rem' }}>
            Результаты программы
          </h2>

          {/* <div className="results-row">
            {RESULTS.map(r => (
              <div key={r} className="result-item">{r}</div>
            ))}
          </div> */}
          
          <div className="results-row">
            {RESULTS.map((r, i) => (
              <div key={i} className="result-item">
                <strong>{r.verb}</strong> {r.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      
    

      {/* ── REVIEWS ── */}
      <section className="reviews">
        <div className="reviews__bg" style={{ backgroundImage: bgUrl }} />
        <div className="reviews__overlay" />
        <div className="container reviews__inner">
          <div className="reviews__header">
            <p className="label reviews__label">Отзывы участников</p>
            <div className="divider" />
          </div>
          <div className="reviews__row">
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-card__stars">★★★★★</div>
                <p className="review-card__text">{r.text}</p>
                <div className="review-card__author">— {r.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS PREVIEW ── */}
      {upcomingEvents.length > 0 && (
        <section className="events-preview">
          <div className="container">
            <div className="events-preview__header">
              <div>
                <div className="section-header__icon-wrapper">
                  <img src={wowIcon} alt="" className="section-header__icon section-events-header__icon" />
                  <p className="label section-label">Ближайшие</p>
                </div>
                <div className="divider" />
                <h2 className="section-heading">Следующие игры</h2>
              </div>
              <Link to="/events" className="btn btn-outline-dark">
                Все мероприятия →
              </Link>
            </div>

            <div className="events-preview__grid">
              {upcomingEvents.map((e, i) => (
                <EventCard key={e.slug} event={e} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA — результат ── */}
      <section className="cta-section">
        <div className="cta-section__bg" style={{ backgroundImage: bg2Url }} />
        <div className="cta-section__overlay" />
        <div className="cta-section__inner">
          <h2 className="cta-section__heading">
            Вы уходите не с идеями.<br />
            <em>С новыми моделями мышления</em>
          </h2>
          {/* <p className="cta-section__body">
            Оставьте заявку — и мы подберём формат под задачу вашей компании.
            Это можно начать применять уже на следующий день.
          </p> */}
          <div className="cta-section__actions">
            <Link to="/events" className="btn btn-gold">Занять место</Link>
            {/* <Link to="/about" className="btn btn-outline-light">О нас</Link> */}
          </div>
        </div>
      </section>

    </main>
  )
}
