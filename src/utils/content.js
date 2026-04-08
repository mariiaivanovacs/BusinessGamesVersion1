/**
 * Frontmatter parser — handles all YAML types used by Decap CMS:
 *   strings, numbers, booleans, string lists, object lists, block scalars (|/|-)
 */
function parseValue(raw) {
  const v = raw.trim().replace(/^["']|["']$/g, '')
  if (v === 'true')  return true
  if (v === 'false') return false
  if (v !== '' && !isNaN(v)) return Number(v)
  return v
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)/)
  if (!match) return { data: {}, body: raw }

  const yaml  = match[1]
  const body  = (match[2] || '').trim()
  const data  = {}
  const lines = yaml.split('\n')
  let i = 0

  while (i < lines.length) {
    const line     = lines[i]
    const keyMatch = line.match(/^([a-zA-Z_][\w_-]*)\s*:\s*(.*)$/)
    if (!keyMatch) { i++; continue }

    const key = keyMatch[1]
    const val = keyMatch[2].trim()

    // ── Block scalar (| or |-) ──────────────────────────────────────────────
    if (val === '|' || val === '|-' || val === '>' || val === '>-') {
      const blockLines = []
      i++
      while (i < lines.length && !/^[a-zA-Z_][\w_-]*\s*:/.test(lines[i]) && !/^\s*-\s/.test(lines[i])) {
        blockLines.push(lines[i].replace(/^ {2}/, ''))
        i++
      }
      data[key] = blockLines.join('\n').trim()
      continue
    }

    // ── YAML list ───────────────────────────────────────────────────────────
    if (val === '' && i + 1 < lines.length && /^\s*-/.test(lines[i + 1])) {
      const items = []
      i++
      while (i < lines.length && /^\s*-/.test(lines[i])) {
        const itemLine   = lines[i]
        const baseIndent = itemLine.indexOf('-')
        const afterDash  = itemLine.slice(baseIndent + 1).trim()

        // Object item: "- key: value"
        const objKeyMatch = afterDash.match(/^([a-zA-Z_][\w_-]*)\s*:\s*(.*)$/)
        if (objKeyMatch) {
          const obj = { [objKeyMatch[1]]: parseValue(objKeyMatch[2]) }
          i++
          // Read continuation keys (deeper indent, not a list marker)
          while (i < lines.length) {
            const cont       = lines[i]
            const contIndent = cont.search(/\S/)
            if (contIndent < 0 || contIndent <= baseIndent || /^\s*-/.test(cont)) break
            const contKey = cont.match(/^\s+([a-zA-Z_][\w_-]*)\s*:\s*(.*)$/)
            if (contKey) obj[contKey[1]] = parseValue(contKey[2])
            i++
          }
          items.push(obj)
        } else {
          // Simple string / commented-out item
          if (!afterDash.startsWith('#')) {
            items.push(afterDash.replace(/^["']|["']$/g, '').trim())
          }
          i++
        }
      }
      data[key] = items
      continue
    }

    // ── Scalar ──────────────────────────────────────────────────────────────
    data[key] = parseValue(val)
    i++
  }

  return { data, body }
}

// ── Resolve a /images/... path to the correct URL under Vite's base ─────────
export function resolveAssetPath(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  const base     = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : '/' + path
  return base + cleanPath
}

// ── Load all events from markdown files (build-time, no server needed) ───────
export function loadEvents() {
  try {
    const modules = import.meta.glob('/content/events/*.md', { as: 'raw', eager: true })
    return Object.entries(modules)
      .map(([path, raw]) => {
        const { data } = parseFrontmatter(raw)
        return {
          ...data,
          slug: path.split('/').pop().replace('.md', ''),
          // Resolve image path so it works under any base URL
          image: data.image ? resolveAssetPath(data.image) : null,
        }
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  } catch {
    return []
  }
}

// ── Load About / speaker profile from markdown ───────────────────────────────
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

// ── Formatting helpers ───────────────────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatPrice(price) {
  if (!price) return 'Бесплатно'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}
