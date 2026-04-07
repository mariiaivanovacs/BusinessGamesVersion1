# Как добавить мероприятие

Events are stored as Markdown files in `/content/events/`. Each file = one event card on the site.

---

## 1. Create the file

Create a new `.md` file in `/content/events/`. The filename becomes the URL slug — use lowercase Latin letters and hyphens:

```
content/events/festival-may-2026.md
```

---

## 2. Fill in the frontmatter

Copy this template and fill in your values:

```markdown
---
title: "Название мероприятия"
date: "2026-05-15 10:00"
time: "10:00 — 18:00"
price: 5900
description: "Короткое описание — отображается на карточке."
image: ""
status: "future"
payment_link: ""
tags:
  - мышление
  - переговоры
---

Полное описание мероприятия (необязательно, пока не используется на сайте).
```

### Field reference

| Field | Type | Description |
|---|---|---|
| `title` | string | Название — отображается на карточке |
| `date` | `"YYYY-MM-DD HH:MM"` | Дата и время начала — используется для сортировки |
| `time` | string | Время в читаемом виде: `"10:00 — 18:00"` |
| `price` | number | Цена в рублях. Оставьте `0` для бесплатного входа |
| `description` | string | Краткое описание (1–2 предложения) |
| `image` | string | Путь к изображению из `/public/images/`, например `"/images/event.jpg"`. Оставьте `""` если нет |
| `status` | `"future"` / `"current"` / `"past"` | `future` — предстоящее, `current` — идёт сейчас, `past` — прошедшее (скрыто на странице мероприятий) |
| `payment_link` | string | Ссылка на оплату / регистрацию. Оставьте `""` если нет |
| `tags` | list | Список тегов — каждый тег с новой строки, начиная с `  - ` |

---

## 3. Adding an image (optional)

1. Put the image file in `/public/images/` (JPG or PNG, recommended width ≥ 800px).
2. Set `image: "/images/your-file.jpg"` in the frontmatter.

---

## 4. Hiding past events

Set `status: "past"` — the event disappears from the Events page automatically but is still kept in the file.

---

## 5. Via the CMS (Decap)

The site includes Decap CMS at `/admin`. Open it in the browser while the dev server is running, log in with your Git credentials, and use the visual editor — it writes the `.md` file for you.

```
http://localhost:5173/admin
```
