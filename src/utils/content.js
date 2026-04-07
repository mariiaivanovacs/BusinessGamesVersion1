/**
 * Lightweight frontmatter parser — handles the exact fields
 * used by this project's Decap CMS collections.
 * Supports: strings, numbers, lists (- item), booleans.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)/)
  if (!match) return { data: {}, body: raw }

  const yaml = match[1]
  const body = (match[2] || '').trim()
  const data = {}
  const lines = yaml.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const keyMatch = line.match(/^([a-zA-Z_][\w_-]*)\s*:\s*(.*)$/)

    if (keyMatch) {
      const key = keyMatch[1]
      let val = keyMatch[2].trim()

      // YAML list
      if (val === '' && i + 1 < lines.length && /^\s+-\s/.test(lines[i + 1])) {
        const items = []
        i++
        while (i < lines.length && /^\s+-\s/.test(lines[i])) {
          items.push(lines[i].replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, '').trim())
          i++
        }
        data[key] = items
        continue
      }

      // Strip surrounding quotes
      val = val.replace(/^["']|["']$/g, '')

      if (val === 'true')  { data[key] = true;         i++; continue }
      if (val === 'false') { data[key] = false;        i++; continue }
      if (val !== '' && !isNaN(val)) { data[key] = Number(val); i++; continue }
      data[key] = val
    }
    i++
  }

  return { data, body }
}

/**
 * Async: fetch events from backend API.
 * Returns [] on any error so the UI degrades gracefully.
 */
export async function fetchEvents() {
  const api = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${api}/events`)
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    return data
      .map(e => ({ ...e, slug: e.id }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  } catch {
    return []
  }
}

/** @deprecated Use fetchEvents() — kept for any legacy call sites */
export function loadEvents() {
  try {
    const modules = import.meta.glob('/content/events/*.md', { as: 'raw', eager: true })
    return Object.entries(modules)
      .map(([path, raw]) => {
        const { data } = parseFrontmatter(raw)
        return { ...data, slug: path.split('/').pop().replace('.md', '') }
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  } catch {
    return []
  }
}

export function loadAboutPerson() {
  try {
    const modules = import.meta.glob('/content/about_person/*.md', { as: 'raw', eager: true })
    const entries = Object.values(modules)
    if (!entries.length) return null
    return parseFrontmatter(entries[0]).data
  } catch {
    return null
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatPrice(price) {
  if (!price) return 'Free'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}
