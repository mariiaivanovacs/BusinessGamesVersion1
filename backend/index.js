require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid')
const fs         = require('fs')
const path       = require('path')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const crypto     = require('crypto')
const multer     = require('multer')

// ── Config ────────────────────────────────────────────────
const PORT         = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const DATA_FILE    = path.join(__dirname, 'participants.json')
const EVENTS_FILE  = path.join(__dirname, 'events.json')
const ADMIN_FILE   = path.join(__dirname, 'admin.json')
const ABOUT_FILE   = path.join(__dirname, 'about.json')
const UPLOADS_DIR  = path.join(__dirname, 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR)

// ── Multer — photo upload (memory storage so we control file lifecycle) ──
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MIME_TO_EXT  = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }

const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Разрешены только изображения (jpg, png, webp)'))
  },
})

/** Delete all profile_* files from UPLOADS_DIR */
function deleteAllProfilePhotos() {
  try {
    fs.readdirSync(UPLOADS_DIR)
      .filter(f => f.startsWith('profile_'))
      .forEach(f => { try { fs.unlinkSync(path.join(UPLOADS_DIR, f)) } catch {} })
  } catch {}
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change_this_jwt_secret') {
  console.warn('[SECURITY] JWT_SECRET is not set or is using the default. Set a strong secret in .env!')
}
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_jwt_secret'

// ── Email transporter ─────────────────────────────────────
const mailer = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// ── In-memory code store ──────────────────────────────────
const pendingCodes = new Map() // email → { code, expiresAt, purpose }

// ── App ───────────────────────────────────────────────────
const app = express()

app.use(cors({
  origin: [FRONTEND_URL, /\.timeweb\.cloud$/, /localhost/],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use('/webhook', express.raw({ type: 'application/json' }))
app.use(bodyParser.json())
app.use('/uploads', express.static(UPLOADS_DIR))

// ── File helpers ──────────────────────────────────────────
function readJSON(file, defaultVal) {
  if (!fs.existsSync(file)) return defaultVal
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch { return defaultVal }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
}

// ── Admin helpers ─────────────────────────────────────────
function getAdmin() {
  const admin = readJSON(ADMIN_FILE, null)
  if (!admin) {
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@businessgames.ru'
    const defaultPass  = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
    const hashed = bcrypt.hashSync(defaultPass, 10)
    const newAdmin = { email: defaultEmail, passwordHash: hashed }
    writeJSON(ADMIN_FILE, newAdmin)
    console.log(`[admin] Created default admin: ${defaultEmail}`)
    return newAdmin
  }
  return admin
}

function saveAdmin(data) { writeJSON(ADMIN_FILE, data) }

// ── About helpers ─────────────────────────────────────────
const DEFAULT_ABOUT = {
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

function getAbout() {
  return readJSON(ABOUT_FILE, DEFAULT_ABOUT)
}

// ── JWT middleware ────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.admin = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' })
  }
}

// ── Send email helper ─────────────────────────────────────
async function sendMail(to, subject, html) {
  await mailer.sendMail({
    from: `"Бизнес Игры" <${process.env.SMTP_USER}>`,
    to, subject, html,
  })
}

// ── Participants helpers ──────────────────────────────────
function loadParticipants() { return readJSON(DATA_FILE, []) }

function saveParticipant(record) {
  const list = loadParticipants()
  list.push(record)
  writeJSON(DATA_FILE, list)
}

// ══════════════════════════════════════════════════════════
//  ROUTES
// ══════════════════════════════════════════════════════════

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── PUBLIC: About ─────────────────────────────────────────
app.get('/about', (_req, res) => {
  res.json(getAbout())
})

// ── PUBLIC: Events list (payment_link hidden) ─────────────
app.get('/events', (_req, res) => {
  const data = readJSON(EVENTS_FILE, [])
  const events = Array.isArray(data) ? data : []
  const safe = events.map(({ payment_link, ...rest }) => rest) // eslint-disable-line no-unused-vars
  res.json(safe)
})

// ── PUBLIC: Buy-ticket redirect ───────────────────────────
app.get('/events/:id/buy', (req, res) => {
  const events = readJSON(EVENTS_FILE, [])
  const event  = events.find(e => e.id === req.params.id)
  if (!event) return res.status(404).json({ error: 'Event not found' })
  if (!event.payment_link) return res.status(404).json({ error: 'No payment link set' })
  res.redirect(302, event.payment_link)
})

// ──────────────────────────────────────────────────────────
//  ADMIN AUTH
// ──────────────────────────────────────────────────────────

app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })

  const admin = getAdmin()
  if (email.toLowerCase() !== admin.email.toLowerCase()) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const match = bcrypt.compareSync(password, admin.passwordHash)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  const code = String(crypto.randomInt(100000, 999999))
  pendingCodes.set(admin.email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    purpose: 'login',
  })

  try {
    await sendMail(
      admin.email,
      'Код подтверждения входа — Бизнес Игры',
      `<p>Ваш код подтверждения: <strong style="font-size:1.5em">${code}</strong></p>
       <p>Код действителен 10 минут. Не передавайте его никому.</p>`
    )
    res.json({ message: 'Code sent to admin email' })
  } catch (err) {
    console.error('[login] mail error:', err.message)
    res.status(500).json({ error: 'Failed to send verification email' })
  }
})

app.post('/admin/verify-code', (req, res) => {
  const { email, code } = req.body
  if (!email || !code) return res.status(400).json({ error: 'email and code required' })

  const entry = pendingCodes.get(email.toLowerCase())
  if (!entry || entry.purpose !== 'login') {
    return res.status(400).json({ error: 'No pending verification. Please log in again.' })
  }
  if (Date.now() > entry.expiresAt) {
    pendingCodes.delete(email.toLowerCase())
    return res.status(400).json({ error: 'Code expired. Please log in again.' })
  }
  if (entry.code !== String(code).trim()) {
    return res.status(401).json({ error: 'Invalid code' })
  }

  pendingCodes.delete(email.toLowerCase())
  const token = jwt.sign({ email: email.toLowerCase(), role: 'admin' }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token })
})

// ── Change password (authenticated — confirms current password) ───
app.post('/admin/change-password', requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword required' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Пароль минимум 8 символов' })
    }

    const admin = getAdmin()
    const match = bcrypt.compareSync(currentPassword, admin.passwordHash)
    if (!match) return res.status(401).json({ error: 'Текущий пароль неверен' })

    admin.passwordHash = bcrypt.hashSync(newPassword, 10)
    saveAdmin(admin)
    res.json({ message: 'Пароль успешно изменён' })
  } catch (err) {
    console.error('[change-password] error:', err.message)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// ── Password reset via email (login page "forgot password") ──────
app.post('/admin/request-password-reset', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'email required' })

  const admin = getAdmin()
  if (email.toLowerCase() !== admin.email.toLowerCase()) {
    return res.json({ message: 'If this email is registered, a reset code was sent.' })
  }

  const code = String(crypto.randomInt(100000, 999999))
  pendingCodes.set(admin.email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000,
    purpose: 'reset',
  })

  try {
    await sendMail(
      admin.email,
      'Сброс пароля — Бизнес Игры',
      `<p>Вы запросили сброс пароля.</p>
       <p>Код подтверждения: <strong style="font-size:1.5em">${code}</strong></p>
       <p>Код действителен 15 минут. Если вы не запрашивали сброс — проигнорируйте это письмо.</p>`
    )
  } catch (err) {
    console.error('[reset] mail error:', err.message)
  }

  res.json({ message: 'If this email is registered, a reset code was sent.' })
})

app.post('/admin/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'email, code, and newPassword required' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const entry = pendingCodes.get(email.toLowerCase())
  if (!entry || entry.purpose !== 'reset') {
    return res.status(400).json({ error: 'No pending reset. Request a new code.' })
  }
  if (Date.now() > entry.expiresAt) {
    pendingCodes.delete(email.toLowerCase())
    return res.status(400).json({ error: 'Code expired. Request a new code.' })
  }
  if (entry.code !== String(code).trim()) {
    return res.status(401).json({ error: 'Invalid code' })
  }

  const admin = getAdmin()
  admin.passwordHash = bcrypt.hashSync(newPassword, 10)
  saveAdmin(admin)
  pendingCodes.delete(email.toLowerCase())

  res.json({ message: 'Password updated successfully' })
})

// ──────────────────────────────────────────────────────────
//  ADMIN: PHOTO UPLOAD
// ──────────────────────────────────────────────────────────

app.post('/admin/upload-photo', requireAuth, (req, res) => {
  uploadPhoto.single('photo')(req, res, (err) => {
    if (err) {
      // Multer errors (type mismatch, size limit) → always JSON
      return res.status(400).json({ error: err.message })
    }
    if (!req.file) return res.status(400).json({ error: 'Файл не получен' })

    // Delete ALL existing profile photos — only one is ever needed
    deleteAllProfilePhotos()

    // Write the new file from memory buffer with correct extension from MIME type
    const ext      = MIME_TO_EXT[req.file.mimetype] || '.jpg'
    const filename = `profile_${Date.now()}${ext}`
    const destPath = path.join(UPLOADS_DIR, filename)
    try {
      fs.writeFileSync(destPath, req.file.buffer)
    } catch (writeErr) {
      console.error('[upload-photo] write error:', writeErr.message)
      return res.status(500).json({ error: 'Не удалось сохранить файл' })
    }

    res.json({ url: `/uploads/${filename}` })
  })
})

// ──────────────────────────────────────────────────────────
//  ADMIN: ABOUT
// ──────────────────────────────────────────────────────────

app.get('/admin/about', requireAuth, (_req, res) => {
  res.json(getAbout())
})

app.put('/admin/about', requireAuth, (req, res) => {
  const { name, role, bio, photo, social_links, stats } = req.body
  const current = getAbout()

  // Only accept relative /uploads/ paths or empty; reject external URLs
  let newPhoto = current.photo
  if (typeof photo === 'string') {
    const trimmed = photo.trim()
    if (!trimmed || trimmed.startsWith('/uploads/')) {
      newPhoto = trimmed || null
    }
    // else: ignore any external URL — keep existing value
  }

  // Clean up old uploaded file if it changed
  if (current.photo && current.photo !== newPhoto && current.photo.startsWith('/uploads/')) {
    const oldFile = path.join(UPLOADS_DIR, path.basename(current.photo))
    if (fs.existsSync(oldFile)) {
      try { fs.unlinkSync(oldFile) } catch (e) {
        console.warn('[about] could not delete old photo:', e.message)
      }
    }
  }

  const updated = {
    name:         typeof name  === 'string' ? name.trim()  : current.name,
    role:         typeof role  === 'string' ? role.trim()  : current.role,
    bio:          typeof bio   === 'string' ? bio.trim()   : current.bio,
    photo:        newPhoto,
    social_links: Array.isArray(social_links)
      ? social_links.map(s => (s || '').trim()).filter(Boolean)
      : current.social_links,
    stats: Array.isArray(stats)
      ? stats.slice(0, 3).map(s => ({ num: (s.num || '').trim(), lbl: (s.lbl || '').trim() }))
      : current.stats,
  }
  writeJSON(ABOUT_FILE, updated)
  res.json(updated)
})

// ──────────────────────────────────────────────────────────
//  ADMIN: EVENTS CRUD (requires JWT)
// ──────────────────────────────────────────────────────────

app.get('/admin/events', requireAuth, (_req, res) => {
  const data = readJSON(EVENTS_FILE, [])
  res.json(Array.isArray(data) ? data : [])
})

app.post('/admin/events', requireAuth, (req, res) => {
  const { title, description, date, price, image, payment_link, status } = req.body
  if (!title || !date) return res.status(400).json({ error: 'title and date are required' })

  const events = readJSON(EVENTS_FILE, [])
  const event = {
    id:           uuidv4(),
    title:        title.trim(),
    description:  (description || '').trim(),
    date,
    price:        price ? Number(price) : null,
    image:        (image || '').trim() || null,
    payment_link: (payment_link || '').trim() || null,
    status:       status || 'future',
    created_at:   new Date().toISOString(),
  }
  events.push(event)
  writeJSON(EVENTS_FILE, events)
  res.status(201).json(event)
})

app.put('/admin/events/:id', requireAuth, (req, res) => {
  const events = readJSON(EVENTS_FILE, [])
  const idx = events.findIndex(e => e.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Event not found' })

  const { title, description, date, price, image, payment_link, status } = req.body
  const updated = {
    ...events[idx],
    title:        (title || events[idx].title).trim(),
    description:  (description !== undefined ? description : events[idx].description).trim(),
    date:         date || events[idx].date,
    price:        price !== undefined ? (price ? Number(price) : null) : events[idx].price,
    image:        image !== undefined ? ((image || '').trim() || null) : events[idx].image,
    payment_link: payment_link !== undefined ? ((payment_link || '').trim() || null) : events[idx].payment_link,
    status:       status || events[idx].status,
    updated_at:   new Date().toISOString(),
  }
  events[idx] = updated
  writeJSON(EVENTS_FILE, events)
  res.json(updated)
})

app.delete('/admin/events/:id', requireAuth, (req, res) => {
  const events = readJSON(EVENTS_FILE, [])
  const idx = events.findIndex(e => e.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Event not found' })
  events.splice(idx, 1)
  writeJSON(EVENTS_FILE, events)
  res.json({ message: 'Deleted' })
})

// ── Legacy participants endpoint ──────────────────────────
app.get('/participants', (req, res) => {
  const token = req.headers['x-admin-token']
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  res.json(loadParticipants())
})

// ── Start ─────────────────────────────────────────────────
getAdmin() // ensure admin.json exists on first boot

app.listen(PORT, () => {
  console.log(`Business Games backend running on port ${PORT}`)
  console.log(`  Frontend origin: ${FRONTEND_URL}`)
})
