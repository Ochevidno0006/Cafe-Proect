# Деплой в продакшен (Neon + Render + Netlify — бесплатно)

Тот же паттерн, что и в твоих прошлых проектах (sugar-erp, exchange-crm,
cash-register-crm). Я не могу сам зайти на эти сайты из своей песочницы —
но весь код и конфиги уже готовы, тебе останется покликать интерфейсы
минут 15-20. Если что-то не сойдётся — пришли мне текст ошибки, разберём.

## Важно знать заранее

**Загруженные фото на Render free tier не сохраняются навсегда.** Бесплатный
диск на Render — временный: при "засыпании" сервиса (после 15 мин простоя)
или редеплое загруженные через админку фото удаляются. Это не баг, а
особенность бесплатного тарифа. Варианты:
- Смириться на старте (для первого запуска и тестов гостей — нормально)
- Платный Render-диск с постоянным хранилищем (~$1/мес за GB)
- Позже подключить облачное хранилище (Cloudflare R2 / S3) — могу помочь,
  когда дойдёт до дела

Категории, блюда, цены, тексты — в PostgreSQL, никуда не денутся. Только
именно загруженные картинки уязвимы к этому.

## Шаг 1 — GitHub

Если ещё не запушено:
```bash
cd cafe-menu-saas
git init
git add .
git commit -m "Cafe Menu SaaS — initial version"
```
Создай пустой репозиторий на github.com и запушь (`git remote add origin ...`, `git push -u origin main`).

## Шаг 2 — Neon (бесплатный PostgreSQL)

1. neon.tech → Sign up → New Project (регион ближе к Душанбе — например Europe/Frankfurt)
2. Скопируй **Connection string** (вариант "Pooled connection") — выглядит как
   `postgres://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`
3. Сохрани его — понадобится в Render как `DATABASE_URL`

## Шаг 3 — Render (бэкенд)

1. render.com → New → Blueprint → подключи свой GitHub-репозиторий
2. Render сам найдёт `render.yaml` в корне и предложит создать сервис
   `cafe-menu-saas-api`
3. При создании впиши переменные (они помечены как "не синхронизировать" в
   render.yaml, Render сам спросит):
   - `DATABASE_URL` — строка из Neon (шаг 2)
   - `SUPERADMIN_PHONE` — свой номер, например `+992937000000`
   - `SUPERADMIN_PASSWORD` — надёжный пароль (не из .env.example!)
   - `CLIENT_ORIGIN` — пока оставь пустым, вернёшься сюда после шага 4
4. Деплой запустится сам. Первый старт выполнит `npm run migrate` (внутри
   `start:prod`) и поднимет сервер.
5. Проверь: открой `https://<твой-сервис>.onrender.com/health` — должно
   быть `{"status":"ok"}`

## Шаг 4 — Netlify (два сайта: админка и клиентское меню)

**Клиентское меню:**
1. netlify.com → Add new site → Import from GitHub → выбери репозиторий
2. Base directory: `client-menu`, Build command: `npm run build`, Publish
   directory: `client-menu/dist`
3. Environment variables → добавь `VITE_API_BASE` = адрес с шага 3
   (`https://<твой-сервис>.onrender.com`)
4. **Не добавляй `VITE_CAFE_SLUG`** — тогда одно клиентское приложение
   обслуживает вообще все кафе платформы, slug берётся из адресной строки
   (`/chaihona-vostok-...`)
5. Deploy → получишь адрес вида `https://cafe-menu-xxxx.netlify.app`

**Админ-панель** — повтори то же самое отдельным сайтом:
1. Base directory: `admin-panel`, Build command: `npm run build`, Publish:
   `admin-panel/dist`
2. Environment variable: `VITE_API_BASE` = тот же адрес Render
3. Deploy → получишь второй адрес, например `https://cafe-admin-xxxx.netlify.app`

## Шаг 5 — вернуться в Render и разрешить CORS

1. Render → твой сервис → Environment → `CLIENT_ORIGIN` = оба адреса
   Netlify через запятую, без пробелов:
   ```
   https://cafe-admin-xxxx.netlify.app,https://cafe-menu-xxxx.netlify.app
   ```
2. Save → сервис передеплоится автоматически

## Шаг 6 — создать первого Super Admin в проде

Render → твой сервис → Shell (вкладка вверху) → выполни:
```bash
npm run seed:superadmin
```
Использует `SUPERADMIN_PHONE`/`SUPERADMIN_PASSWORD`, которые ты задал на шаге 3.

Опционально — то же самое демо-кафе, что у меня в тестах:
```bash
npm run seed:demo
```

## Шаг 7 — проверка

1. Открой адрес админки → зарегистрируй кафе (или войди под demo/superadmin)
2. Добавь категорию, блюдо → «Опубликовать меню»
3. Открой `https://cafe-menu-xxxx.netlify.app/<slug-твоего-кафе>` (slug
   виден в админке на вкладке «Ссылки») → должно отобразиться меню

## Если что-то не работает

- **CORS-ошибка в консоли браузера** → проверь `CLIENT_ORIGIN` на Render —
  должен точно совпадать с адресами Netlify, без слэша на конце
- **502/503 на Render** → бесплатный тариф "засыпает" после простоя, первый
  запрос может занять 30-50 секунд, это нормально
- **`DATABASE_URL` ошибка подключения** → в Neon строка должна включать
  `?sslmode=require`, и на Render должна стоять `DATABASE_SSL=true`
  (уже в render.yaml)
