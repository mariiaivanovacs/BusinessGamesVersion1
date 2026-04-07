import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ── Step machine: 'login' | 'code' | 'forgot' | 'forgot-code'
export default function AdminLogin() {
  const navigate = useNavigate()

  const [step, setStep]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode]         = useState('')
  const [newPass, setNewPass]   = useState('')
  const [newPass2, setNewPass2] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')
  const [showPassword, setShowPassword]   = useState(false)
  const [showNewPass, setShowNewPass]     = useState(false)
  const [showNewPass2, setShowNewPass2]   = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка входа')
      setInfo('Код отправлен на почту администратора. Проверьте входящие.')
      setStep('code')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${API}/admin/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Неверный код')
      localStorage.setItem('admin_token', data.token)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotRequest(e) {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      await fetch(`${API}/admin/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setInfo('Если почта зарегистрирована, вы получите письмо с кодом.')
      setStep('forgot-code')
    } catch {
      setInfo('Если почта зарегистрирована, вы получите письмо с кодом.')
      setStep('forgot-code')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    if (newPass !== newPass2) { setError('Пароли не совпадают'); setLoading(false); return }
    if (newPass.length < 8)   { setError('Пароль минимум 8 символов'); setLoading(false); return }
    try {
      const res = await fetch(`${API}/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: newPass }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка сброса пароля')
      setInfo('Пароль успешно изменён. Войдите с новым паролем.')
      setStep('login')
      setCode(''); setNewPass(''); setNewPass2('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">Бизнес Игры</div>
        <div className="admin-login-title">
          {step === 'login'      && 'Вход в панель управления'}
          {step === 'code'       && 'Введите код из письма'}
          {step === 'forgot'     && 'Восстановление пароля'}
          {step === 'forgot-code'&& 'Введите код из письма'}
        </div>

        {error && <div className="admin-alert admin-alert--error">{error}</div>}
        {info  && <div className="admin-alert admin-alert--info">{info}</div>}

        {/* ── Step 1: Login ── */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="admin-form">
            <label className="admin-label">Email
              <input
                className="admin-input"
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@yourdomain.ru"
                autoComplete="username"
              />
            </label>
            <label className="admin-label">Пароль
              <div className="admin-input-wrapper">
                <input
                  className="admin-input"
                  type={showPassword ? 'text' : 'password'} required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </label>
            <button className="admin-btn" type="submit" disabled={loading}>
              {loading ? 'Проверка...' : 'Войти →'}
            </button>
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => { setStep('forgot'); setError(''); setInfo('') }}
            >
              Забыли пароль?
            </button>
          </form>
        )}

        {/* ── Step 2: Email code ── */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="admin-form">
            <p className="admin-hint">
              Код отправлен на <strong>{email}</strong>. Введите его ниже.
            </p>
            <label className="admin-label">Код подтверждения
              <input
                className="admin-input admin-input--code"
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                pattern="\d{6}"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
              />
            </label>
            <button className="admin-btn" type="submit" disabled={loading}>
              {loading ? 'Проверка...' : 'Подтвердить →'}
            </button>
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => { setStep('login'); setCode(''); setError(''); setInfo('') }}
            >
              ← Назад
            </button>
          </form>
        )}

        {/* ── Forgot password: enter email ── */}
        {step === 'forgot' && (
          <form onSubmit={handleForgotRequest} className="admin-form">
            <p className="admin-hint">Укажите email администратора — на него придёт код для сброса пароля.</p>
            <label className="admin-label">Email
              <input
                className="admin-input"
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@yourdomain.ru"
              />
            </label>
            <button className="admin-btn" type="submit" disabled={loading}>
              {loading ? 'Отправка...' : 'Отправить код →'}
            </button>
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => { setStep('login'); setError(''); setInfo('') }}
            >
              ← Назад
            </button>
          </form>
        )}

        {/* ── Forgot password: code + new password ── */}
        {step === 'forgot-code' && (
          <form onSubmit={handleResetPassword} className="admin-form">
            <label className="admin-label">Код из письма
              <input
                className="admin-input admin-input--code"
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                pattern="\d{6}"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
              />
            </label>
            <label className="admin-label">Новый пароль
              <div className="admin-input-wrapper">
                <input
                  className="admin-input"
                  type={showNewPass ? 'text' : 'password'} required minLength={8}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Минимум 8 символов"
                />
                <button
                  type="button"
                  className="admin-eye-btn"
                  onClick={() => setShowNewPass(v => !v)}
                  aria-label={showNewPass ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showNewPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </label>
            <label className="admin-label">Повторите пароль
              <div className="admin-input-wrapper">
                <input
                  className="admin-input"
                  type={showNewPass2 ? 'text' : 'password'} required minLength={8}
                  value={newPass2}
                  onChange={e => setNewPass2(e.target.value)}
                  placeholder="Повторите пароль"
                />
                <button
                  type="button"
                  className="admin-eye-btn"
                  onClick={() => setShowNewPass2(v => !v)}
                  aria-label={showNewPass2 ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showNewPass2 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </label>
            <button className="admin-btn" type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сменить пароль →'}
            </button>
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => { setStep('login'); setCode(''); setError(''); setInfo('') }}
            >
              ← Назад ко входу
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
