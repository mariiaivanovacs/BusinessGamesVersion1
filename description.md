Да — и я бы собрал это так: React + Vite для фронта, Decap CMS для админки, Python (лучше FastAPI) для backend, YooKassa для оплаты. Но есть важная оговорка: GitHub Pages — это статический хостинг для HTML/CSS/JS из репозитория, и в документации GitHub прямо сказано, что он не предназначен для бесплатного хостинга онлайн-бизнеса и e-commerce; поэтому сам сайт-витрину там держать можно, а оплату и обработку статусов лучше вынести на отдельный backend.
Вот рабочий план.
Сделай 1 репозиторий с React + Vite.
В нём будут 3 страницы: главная-лендинг, страница мероприятий, страница “о личности”. GitHub Pages публикует именно статические файлы, так что Vite тут подходит нормально.
Подключи Decap CMS как админку.
Decap CMS — это open-source CMS для Git-workflow: контент хранится прямо в Git-репозитории, а конфиг задаётся в admin/config.yml. В docs прямо сказано, что это friendly UI для редакторов, и что конфигурация лежит в папке /admin.
Структура страниц.
Главная: длинный scroll-лендинг с анимациями, блоками бренда, CTA и превью событий.
Мероприятия: показываешь только current и future, а past скрываешь.
О личности: отдельная страница с карточкой биографии, фото и кратким описанием.
Это уже твой UI-код, Decap на него не влияет; он только даёт форму для ввода контента.
Как настроить Decap CMS по сути.
Делай в репозитории папку /admin с двумя файлами: index.html и config.yml. В config.yml заводишь коллекции, например events и about. У Decap есть встроенные поля/виджеты, а новые типы контента задаются через collection fields.
Какие поля нужны админу для события.
Минимум: title, date, time, price, description, image, status.
Я бы добавил ещё payment_type или payment_link не в контент CMS, а в backend-логику, чтобы владелец не ломал оплату случайной правкой.
Для страницы “о личности” — name, role, bio, photo, social_links.
Decap спокойно работает с кастомными полями, потому что его контент-модель задаётся через config.yml.
Оплата через YooKassa.
В документации YooKassa сказано, что все запросы к API нужно отправлять с вашего сервера, и что после создания платежа пользователя обычно отправляют на confirmation_url; также у YooKassa есть webhooks для уведомлений о смене статуса платежа. Значит правильная схема такая: фронт на GitHub Pages → кнопка “Купить билет” → backend создаёт платёж → пользователь уходит на YooKassa → webhook возвращает статус succeeded → backend отмечает билет как купленный и отправляет письмо.
Письмо о покупке.
Это уже не задача GitHub Pages и не Decap. Это делает backend: он ловит webhook payment.succeeded, создаёт заказ/билет в базе и отправляет email через SMTP или почтовый сервис. Сам YooKassa для этого даёт событие-уведомление, а не готовую “авто-почту” для твоего пользователя.





Отлично! Давай сделаем **полную структуру проекта под твой кейс** с React + Vite + Decap CMS + GitHub Pages и разберём, как это загрузить.

---

# 1️⃣ Структура файлов

Представим, что твой проект называется `my-events-site`.
Вот примерная структура:

```
my-events-site/
│
├─ public/
│   ├─ images/              # сюда загружаем картинки (Decap CMS их кладёт сюда)
│   └─ index.html           # шаблон React
│
├─ src/
│   ├─ App.jsx              # главный компонент React
│   ├─ main.jsx             # точка входа React
│   ├─ pages/
│   │    ├─ Home.jsx        # главная страница
│   │    ├─ Events.jsx      # страница событий
│   │    └─ About.jsx       # страница о личности
│   └─ components/
│        ├─ EventCard.jsx   # карточка события
│        └─ Navbar.jsx
│
├─ content/                 # Decap CMS хранит контент здесь
│   ├─ events/              # события
│   │   └─ example-event.md
│   ├─ about_person/
│   │   └─ example-person.md
│   └─ brand_page/
│       └─ example-brand.md
│
├─ admin/                   # Decap CMS админка
│   ├─ index.html
│   └─ config.yml            # CMS config
│
├─ package.json
├─ vite.config.js
└─ README.md
```

---

# 2️⃣ Как загрузить на GitHub Pages

## Шаг 1: Создай репозиторий на GitHub

* Имя репозитория: `my-events-site`
* Поставь **Public**

---

## Шаг 2: Настрой React + Vite

В терминале:

```bash
npm create vite@latest my-events-site
cd my-events-site
npm install
npm run dev
```

* Сайт доступен локально на `http://localhost:5173/`

---

## Шаг 3: Настрой путь для GitHub Pages

В `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/my-events-site/', // имя репозитория
})
```

---

## Шаг 4: Настрой сборку для деплоя

```bash
npm run build
```

* Папка `dist/` → готовые статические файлы

---

## Шаг 5: Заливка на GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/my-events-site.git
git push -u origin main
```

---

## Шаг 6: Включить GitHub Pages

1. Заходим в **Settings → Pages**
2. Источник: **Branch: main, / (root) или /dist**
3. Сохраняем → GitHub даст ссылку `https://USERNAME.github.io/my-events-site/`

> Теперь сайт доступен онлайн

---

# 3️⃣ Как подключить Decap CMS

1. В папке `admin/` положи `index.html` и `config.yml` (как я дал выше)
2. В `config.yml` укажи `backend.repo: username/my-events-site`
3. Когда владелец добавляет событие, Decap создаёт `.md` или `.json` файл в папке `content/`
4. GitHub Pages автоматически обновит сайт после нового коммита

---

# 4️⃣ Как React показывает события

В `Events.jsx`:

```jsx
import eventsData from '../content/events/*.md' // или через import.meta.glob если Vite

export default function Events() {
  const currentEvents = eventsData.filter(e => e.status === 'current' || e.status === 'future');
  return (
    <div>
      {currentEvents.map(event => (
        <EventCard key={event.title} event={event} />
      ))}
    </div>
  );
}
```

* `EventCard.jsx` отвечает за UI карточки
* Кнопка “Купить билет” → `event.payment_link` → ЮKassa

---

# 5️⃣ Для админа

* Папка `/admin` → заходишь на `https://USERNAME.github.io/my-events-site/admin`
* Можешь добавлять события через Decap CMS
* Поля: `title`, `date`, `time`, `price`, `description`, `image`, `status`, `payment_link`

---

💡 **Важно:** GitHub Pages не хранит email и не ловит webhook. Для писем и подтверждения оплаты нужен отдельный **Python backend** на FastAPI или другой хостинг.



Хочешь, чтобы я сделал этот пример?
