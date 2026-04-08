import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import img1 from '/image_1.png'
import img2 from '/image_2.jpg'
import img3 from '/image_3.png'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const FALLBACK_IMAGES = [img1, img2, img3]

const EMPTY_EVENT = {
  title: '', description: '', date: '', price: '',
  image: '', payment_link: '',
}

const EMPTY_ABOUT = {
  name: '', role: '', bio: '', photo: '',
  link1: '', link2: '',
  s1num: '', s1lbl: '',
  s2num: '', s2lbl: '',
  s3num: '', s3lbl: '',
}

function authHeaders() {
  const token = localStorage.getItem('admin_token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

function formatDateRu(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d) ? iso : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function pickFallbackImage(id, index) {
  const seed = String(id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), index ?? 0)
  return FALLBACK_IMAGES[seed % FALLBACK_IMAGES.length]
}

/** Auto-derive event status from date */
function deriveStatus(dateStr) {
  if (!dateStr) return 'future'
  const d = new Date(dateStr)
  if (isNaN(d)) return 'future'
  const diffDays = (d - new Date()) / (1000 * 60 * 60 * 24)
  if (diffDays < -1)  return 'past'
  if (diffDays > 14)  return 'future'
  return 'current'
}

const STATUS_LABEL = { future: 'Скоро', current: 'Сейчас', past: 'Прошедшее' }

// ── SVG icons ──────────────────────────────────────────────
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const IconLock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconKey = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
)
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconEye = ({ open }) => open ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

// ── Reusable password field ───────────────────────────────
function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <label className="admin-label">{label}
      <div className="admin-input-wrapper">
        <input
          className="admin-input"
          type={show ? 'text' : 'password'}
          required minLength={8}
          value={value}
          onChange={onChange}
          placeholder={placeholder || '••••••••'}
        />
        <button type="button" className="admin-eye-btn" onClick={() => setShow(v => !v)}
          aria-label={show ? 'Скрыть' : 'Показать'}>
          <IconEye open={show} />
        </button>
      </div>
    </label>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  // ── Events state ──
  const [events, setEvents]       = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [eventsError, setEventsError]     = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState(null)
  const [form, setForm]           = useState(EMPTY_EVENT)
  const [saving, setSaving]       = useState(false)
  const [deleteId, setDeleteId]   = useState(null)

  // ── Password change state ──
  const [showPass, setShowPass]     = useState(false)
  const [passForm, setPassForm]     = useState({ current: '', next: '', confirm: '' })
  const [passSaving, setPassSaving] = useState(false)
  const [passError, setPassError]   = useState('')
  const [passInfo, setPassInfo]     = useState('')

  // ── About state ──
  const [aboutForm, setAboutForm]       = useState(EMPTY_ABOUT)
  const [showAbout, setShowAbout]       = useState(false)
  const [aboutSaving, setAboutSaving]   = useState(false)
  const [aboutError, setAboutError]     = useState('')
  const [aboutInfo, setAboutInfo]       = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError]         = useState('')

  // ── Load events ──
  const loadEvents = useCallback(async () => {
    setLoadingEvents(true); setEventsError('')
    try {
      const res = await fetch(`${API}/admin/events`, { headers: authHeaders() })
      if (res.status === 401) { localStorage.removeItem('admin_token'); navigate('/admin'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const list = Array.isArray(data) ? data : []
      setEvents(list.sort((a, b) => new Date(a.date) - new Date(b.date)))
    } catch (err) {
      setEventsError(err.message || 'Ошибка загрузки')
    } finally {
      setLoadingEvents(false)
    }
  }, [navigate])

  // ── Load about ──
  const loadAbout = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/about`, { headers: authHeaders() })
      if (!res.ok) return
      const d = await res.json()
      // Only accept server-managed relative paths; ignore stale external URLs
      const savedPhoto = (d.photo && d.photo.startsWith('/uploads/')) ? d.photo : ''
      setAboutForm({
        name:  d.name  || '',
        role:  d.role  || '',
        bio:   d.bio   || '',
        photo: savedPhoto,
        link1: d.social_links?.[0] || '',
        link2: d.social_links?.[1] || '',
        s1num: d.stats?.[0]?.num || '',
        s1lbl: d.stats?.[0]?.lbl || '',
        s2num: d.stats?.[1]?.num || '',
        s2lbl: d.stats?.[1]?.lbl || '',
        s3num: d.stats?.[2]?.num || '',
        s3lbl: d.stats?.[2]?.lbl || '',
      })
    } catch { /* silently fail */ }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { navigate('/admin'); return }
    loadEvents()
    loadAbout()
  }, [loadEvents, loadAbout, navigate])

  // ── Event form handlers ──
  function openCreate() {
    setForm(EMPTY_EVENT); setEditId(null); setShowForm(true); setEventsError('')
  }
  function openEdit(ev) {
    setForm({
      title:        ev.title || '',
      description:  ev.description || '',
      date:         ev.date ? ev.date.slice(0, 16) : '',
      price:        ev.price != null ? String(ev.price) : '',
      image:        ev.image || '',
      payment_link: ev.payment_link || '',
    })
    setEditId(ev.id); setShowForm(true); setEventsError('')
  }
  function closeForm() {
    setShowForm(false); setEditId(null); setForm(EMPTY_EVENT); setEventsError('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setEventsError('')
    const body = {
      ...form,
      price:  form.price ? Number(form.price) : null,
      status: deriveStatus(form.date),
    }
    try {
      const url    = editId ? `${API}/admin/events/${editId}` : `${API}/admin/events`
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await loadEvents()
      closeForm()
    } catch (err) {
      setEventsError(err.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setDeleteId(null)
    try {
      const res = await fetch(`${API}/admin/events/${id}`, {
        method: 'DELETE', headers: authHeaders(),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      await loadEvents()
    } catch (err) {
      setEventsError(err.message || 'Ошибка удаления')
    }
  }

  // ── Mark event as past ──
  async function handleMarkPast(id) {
    try {
      const res = await fetch(`${API}/admin/events/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'past' }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      await loadEvents()
    } catch (err) {
      setEventsError(err.message || 'Ошибка обновления статуса')
    }
  }

  // ── Password change ──
  async function handleChangePassword(e) {
    e.preventDefault()
    setPassError(''); setPassInfo('')
    if (passForm.next !== passForm.confirm) { setPassError('Новые пароли не совпадают'); return }
    if (passForm.next.length < 8) { setPassError('Новый пароль минимум 8 символов'); return }
    setPassSaving(true)
    try {
      const res = await fetch(`${API}/admin/change-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPassInfo('Пароль успешно изменён.')
      setPassForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPassError(err.message)
    } finally {
      setPassSaving(false)
    }
  }

  // ── Photo upload ──
  // Upload → persist to about.json immediately so reload never shows a stale path
  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    setPhotoError('')
    const formData = new FormData()
    formData.append('photo', file)
    try {
      const token = localStorage.getItem('admin_token')

      // Step 1: upload file, get back relative path
      const uploadRes = await fetch(`${API}/admin/upload-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Ошибка загрузки')

      const newPhotoUrl = uploadData.url // e.g. /uploads/profile_1234.jpg

      // Step 2: immediately persist the new path into about.json
      // so that on reload the stored path always matches what's on disk
      const currentAbout = await fetch(`${API}/admin/about`, { headers: authHeaders() })
        .then(r => r.ok ? r.json() : {})
      await fetch(`${API}/admin/about`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ ...currentAbout, photo: newPhotoUrl }),
      })

      setAboutForm(f => ({ ...f, photo: newPhotoUrl }))
    } catch (err) {
      setPhotoError(err.message)
    } finally {
      setPhotoUploading(false)
      e.target.value = ''
    }
  }

  // ── About save ──
  async function handleAboutSave(e) {
    e.preventDefault()
    setAboutError(''); setAboutInfo(''); setAboutSaving(true)
    const body = {
      name:  aboutForm.name,
      role:  aboutForm.role,
      bio:   aboutForm.bio,
      photo: aboutForm.photo,
      social_links: [aboutForm.link1, aboutForm.link2].filter(Boolean),
      stats: [
        { num: aboutForm.s1num, lbl: aboutForm.s1lbl },
        { num: aboutForm.s2num, lbl: aboutForm.s2lbl },
        { num: aboutForm.s3num, lbl: aboutForm.s3lbl },
      ],
    }
    try {
      const res = await fetch(`${API}/admin/about`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAboutInfo('Информация сохранена.')
    } catch (err) {
      setAboutError(err.message || 'Ошибка сохранения')
    } finally {
      setAboutSaving(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  // ── Stats ──
  const stats = {
    total:   events.length,
    future:  events.filter(e => e.status === 'future').length,
    current: events.filter(e => e.status === 'current').length,
    past:    events.filter(e => e.status === 'past').length,
  }

  return (
    <div className="admin-dash">

      {/* ── Header ── */}
      <header className="admin-header">
        <div className="admin-header__brand">
          <span className="admin-header__dot" />
          <span className="admin-header__logo">Бизнес Игры</span>
          <span className="admin-header__divider">|</span>
          <span className="admin-header__subtitle">Панель управления</span>
        </div>
        <div className="admin-header__actions">
          <button
            className="admin-btn-sm admin-btn-sm--outline"
            onClick={() => { setShowPass(p => !p); setPassError(''); setPassInfo(''); setPassForm({ current: '', next: '', confirm: '' }) }}
          >
            <IconKey /> Сменить пароль
          </button>
          <button className="admin-btn-sm admin-btn-sm--danger" onClick={handleLogout}>
            <IconLogout /> Выйти
          </button>
        </div>
      </header>

      <div className="admin-content">

        {/* ── Stats strip ── */}
        <div className="admin-stats-strip">
          {[
            { num: stats.total,   lbl: 'Всего',      mod: '' },
            { num: stats.current, lbl: 'Активных',   mod: '--current' },
            { num: stats.future,  lbl: 'Будущих',    mod: '--future' },
            { num: stats.past,    lbl: 'Прошедших',  mod: '--past' },
          ].map(s => (
            <div key={s.lbl} className={`admin-stat ${s.mod ? `admin-stat${s.mod}` : ''}`}>
              <span className="admin-stat__num">{s.num}</span>
              <span className="admin-stat__lbl">{s.lbl}</span>
            </div>
          ))}
        </div>

        {/* ── Change password panel ── */}
        {showPass && (
          <div className="admin-section admin-section--pass">
            <div className="admin-section-header" style={{ paddingBottom: '1.25rem', borderBottom: '1px solid #F0EFE9' }}>
              <h2 className="admin-section-title">Смена пароля</h2>
              <button className="admin-btn-sm admin-btn-sm--outline" style={{ borderColor: 'rgba(45,74,45,0.3)', color: 'var(--c-forest)' }}
                onClick={() => setShowPass(false)}>
                Закрыть
              </button>
            </div>
            <div style={{ paddingTop: '1.5rem' }}>
              {passError && <div className="admin-alert admin-alert--error">{passError}</div>}
              {passInfo  && <div className="admin-alert admin-alert--info">{passInfo}</div>}
              <form onSubmit={handleChangePassword} className="admin-form admin-form--inline">
                <PasswordField
                  label="Текущий пароль"
                  value={passForm.current}
                  onChange={e => setPassForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="Введите текущий пароль"
                />
                <PasswordField
                  label="Новый пароль"
                  value={passForm.next}
                  onChange={e => setPassForm(f => ({ ...f, next: e.target.value }))}
                  placeholder="Минимум 8 символов"
                />
                <PasswordField
                  label="Повторите новый пароль"
                  value={passForm.confirm}
                  onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Повторите новый пароль"
                />
                <button className="admin-btn" type="submit" disabled={passSaving}>
                  {passSaving ? 'Сохранение...' : 'Сохранить пароль →'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── About Us section ── */}
        <div className="admin-section">
          <div className="admin-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <IconUser />
              <h2 className="admin-section-title">О нас</h2>
            </div>
            <button
              className="admin-btn-sm admin-btn-sm--outline"
              style={{ borderColor: 'rgba(45,74,45,0.25)', color: 'var(--c-forest)' }}
              onClick={() => { setShowAbout(v => !v); setAboutError(''); setAboutInfo('') }}
            >
              {showAbout ? 'Свернуть' : 'Редактировать'}
            </button>
          </div>

          {showAbout && (
            <div style={{ padding: '0 2rem 2rem' }}>
              {aboutError && <div className="admin-alert admin-alert--error">{aboutError}</div>}
              {aboutInfo  && <div className="admin-alert admin-alert--info">{aboutInfo}</div>}

              <form onSubmit={handleAboutSave} className="admin-form">

                <div className="admin-form-row">
                  <label className="admin-label">Имя
                    <input className="admin-input" type="text"
                      value={aboutForm.name}
                      onChange={e => setAboutForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Наталья Крюкова"
                    />
                  </label>
                  <label className="admin-label">Должность / роль
                    <input className="admin-input" type="text"
                      value={aboutForm.role}
                      onChange={e => setAboutForm(f => ({ ...f, role: e.target.value }))}
                      placeholder="Спикер"
                    />
                  </label>
                </div>

                <div className="admin-label">Фото профиля
                  <div className="admin-photo-upload">
                    {aboutForm.photo && aboutForm.photo.startsWith('/uploads/') && (
                      <img
                        src={`${API}${aboutForm.photo}`}
                        alt="Фото профиля"
                        className="admin-photo-preview"
                      />
                    )}
                    <div className="admin-photo-actions">
                      <label className={`admin-btn-sm admin-btn-sm--outline ${photoUploading ? 'admin-btn-sm--disabled' : ''}`}>
                        {photoUploading ? 'Загрузка...' : (aboutForm.photo ? 'Заменить фото' : 'Загрузить фото')}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={handlePhotoUpload}
                          disabled={photoUploading}
                        />
                      </label>
                      {aboutForm.photo && (
                        <button
                          type="button"
                          className="admin-btn-sm admin-btn-sm--danger"
                          onClick={() => { setAboutForm(f => ({ ...f, photo: '' })); setPhotoError('') }}
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                    {photoError && <span className="admin-photo-error">{photoError}</span>}
                  </div>
                </div>

                <label className="admin-label">Биография
                  <textarea className="admin-input admin-textarea" rows={6}
                    value={aboutForm.bio}
                    onChange={e => setAboutForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Расскажите о себе..."
                  />
                </label>

                {/* Stats */}
                <div className="admin-about-stats">
                  <p className="admin-about-stats__title">Статистика (3 показателя)</p>
                  {[
                    { numKey: 's1num', lblKey: 's1lbl', placeholder: '70+', lblPlaceholder: 'Сессий' },
                    { numKey: 's2num', lblKey: 's2lbl', placeholder: '25+', lblPlaceholder: 'Компаний' },
                    { numKey: 's3num', lblKey: 's3lbl', placeholder: '350+', lblPlaceholder: 'Участников' },
                  ].map((s, i) => (
                    <div key={i} className="admin-about-stat-row">
                      <input className="admin-input admin-about-stat-num"
                        type="text"
                        value={aboutForm[s.numKey]}
                        onChange={e => setAboutForm(f => ({ ...f, [s.numKey]: e.target.value }))}
                        placeholder={s.placeholder}
                      />
                      <input className="admin-input admin-about-stat-lbl"
                        type="text"
                        value={aboutForm[s.lblKey]}
                        onChange={e => setAboutForm(f => ({ ...f, [s.lblKey]: e.target.value }))}
                        placeholder={s.lblPlaceholder}
                      />
                    </div>
                  ))}
                </div>

                {/* Social links */}
                <div className="admin-form-row">
                  <label className="admin-label">Ссылка 1
                    <input className="admin-input" type="url"
                      value={aboutForm.link1}
                      onChange={e => setAboutForm(f => ({ ...f, link1: e.target.value }))}
                      placeholder="https://t.me/username"
                    />
                  </label>
                  <label className="admin-label">Ссылка 2
                    <input className="admin-input" type="url"
                      value={aboutForm.link2}
                      onChange={e => setAboutForm(f => ({ ...f, link2: e.target.value }))}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </label>
                </div>

                <div className="admin-form-actions">
                  <button type="submit" className="admin-btn" disabled={aboutSaving}>
                    {aboutSaving ? 'Сохранение...' : 'Сохранить изменения'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ── Events section ── */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Мероприятия</h2>
            <button className="admin-btn" onClick={openCreate}>
              <IconPlus /> Добавить
            </button>
          </div>

          {eventsError && <div className="admin-alert admin-alert--error" style={{ margin: '0 2rem 1rem' }}>{eventsError}</div>}

          {/* ── Create / Edit modal ── */}
          {showForm && (
            <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && closeForm()}>
              <div className="admin-modal">
                <div className="admin-modal-header">
                  <h3>{editId ? 'Редактировать мероприятие' : 'Новое мероприятие'}</h3>
                  <button className="admin-modal-close" onClick={closeForm} aria-label="Закрыть">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {eventsError && <div className="admin-alert admin-alert--error">{eventsError}</div>}

                <form onSubmit={handleSave} className="admin-form">
                  <label className="admin-label">Название *
                    <input className="admin-input" type="text" required
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Фестиваль бизнес-игр"
                    />
                  </label>

                  <label className="admin-label">Описание
                    <textarea className="admin-input admin-textarea" rows={3}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Краткое описание мероприятия..."
                    />
                  </label>

                  <div className="admin-form-row">
                    <label className="admin-label">Дата и время *
                      <input className="admin-input" type="datetime-local" required
                        value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      />
                      {form.date && (
                        <span className="admin-derived-status">
                          Статус: <strong>{STATUS_LABEL[deriveStatus(form.date)]}</strong>
                        </span>
                      )}
                    </label>
                    <label className="admin-label">Цена (₽)
                      <input className="admin-input" type="number" min={0} step={100}
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="5900"
                      />
                    </label>
                  </div>

                  <label className="admin-label">
                    URL афиши / изображения
                    <span className="admin-label-hint"> — если пусто, подбирается стандартный</span>
                    <input className="admin-input" type="url"
                      value={form.image}
                      onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                      placeholder="https://example.com/poster.jpg"
                    />
                  </label>

                  <label className="admin-label">
                    Ссылка Продамус
                    <span className="admin-label-hint"> — хранится только на сервере</span>
                    <input className="admin-input admin-input--secure" type="url"
                      value={form.payment_link}
                      onChange={e => setForm(f => ({ ...f, payment_link: e.target.value }))}
                      placeholder="https://prodamus.ru/..."
                    />
                  </label>

                  <div className="admin-form-actions">
                    <button type="button" className="admin-btn-sm admin-btn-sm--outline"
                      style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--c-text-muted)' }}
                      onClick={closeForm}>
                      Отмена
                    </button>
                    <button type="submit" className="admin-btn" disabled={saving}>
                      {saving ? 'Сохранение...' : (editId ? 'Сохранить изменения' : 'Создать мероприятие')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Delete confirm ── */}
          {deleteId && (
            <div className="admin-modal-overlay">
              <div className="admin-modal admin-modal--sm">
                <h3>Удалить мероприятие?</h3>
                <p className="admin-modal-danger-hint">Это действие нельзя отменить.</p>
                <div className="admin-form-actions" style={{ marginTop: '1.5rem' }}>
                  <button className="admin-btn-sm admin-btn-sm--outline"
                    style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--c-text-muted)' }}
                    onClick={() => setDeleteId(null)}>Отмена</button>
                  <button className="admin-btn-sm admin-btn-sm--danger" onClick={() => handleDelete(deleteId)}>Удалить</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Events table ── */}
          {loadingEvents ? (
            <div className="admin-loading">
              <div className="admin-spinner" /> Загрузка...
            </div>
          ) : events.length === 0 ? (
            <div className="admin-empty">
              <p>Мероприятий пока нет.</p>
              <button className="admin-btn" onClick={openCreate} style={{ marginTop: '1rem' }}>
                <IconPlus /> Создать первое
              </button>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-th admin-th--img" />
                    <th className="admin-th">Название</th>
                    <th className="admin-th">Дата</th>
                    <th className="admin-th">Статус</th>
                    <th className="admin-th">Цена</th>
                    <th className="admin-th admin-th--links">Ссылки</th>
                    <th className="admin-th admin-th--actions" />
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, i) => {
                    const thumb  = ev.image || pickFallbackImage(ev.id, i)
                    const status = ev.status === 'past' ? 'past' : deriveStatus(ev.date)
                    return (
                      <tr key={ev.id} className={`admin-tr admin-tr--${status}`}>
                        <td className="admin-td admin-td--img">
                          <img src={thumb} alt="" className="admin-thumb" />
                        </td>
                        <td className="admin-td admin-td--title">
                          <span className="admin-ev-title">{ev.title}</span>
                          {ev.description && (
                            <span className="admin-ev-desc">{ev.description}</span>
                          )}
                        </td>
                        <td className="admin-td admin-td--date">{formatDateRu(ev.date)}</td>
                        <td className="admin-td">
                          <span className={`admin-tag admin-tag--${status}`}>
                            {STATUS_LABEL[status]}
                          </span>
                        </td>
                        <td className="admin-td admin-td--price">
                          {ev.price != null
                            ? <span className="admin-ev-price">{Number(ev.price).toLocaleString('ru-RU')} ₽</span>
                            : <span className="admin-ev-free">—</span>}
                        </td>
                        <td className="admin-td admin-td--links">
                          {ev.payment_link && (
                            <span className="admin-secure-badge"><IconLock /> Продамус</span>
                          )}
                          {ev.image && (
                            <a href={ev.image} target="_blank" rel="noopener noreferrer" className="admin-image-preview-link">
                              <IconLink /> Афиша
                            </a>
                          )}
                        </td>
                        <td className="admin-td admin-td--actions">
                          {status !== 'past' && (
                            <button
                              className="admin-btn-sm admin-btn-sm--outline admin-btn-past"
                              onClick={() => handleMarkPast(ev.id)}
                              title="Отметить как завершённое"
                            >
                              Завершилось
                            </button>
                          )}
                          <button className="admin-btn-icon" onClick={() => openEdit(ev)} title="Редактировать">
                            <IconEdit />
                          </button>
                          <button className="admin-btn-icon admin-btn-icon--danger" onClick={() => setDeleteId(ev.id)} title="Удалить">
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
