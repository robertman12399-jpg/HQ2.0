# FizMat HQ — штаб репетитора

Одностраничное приложение (PWA) для репетитора: расписание, ученики, платежи, финансы,
задачи. Работает офлайн, данные хранятся локально и синхронизируются с вашим Google
Диском. Весь код — в одном файле `index.html`.

## Быстрый запуск (GitHub Pages)

1. Создайте репозиторий и залейте файлы из этой папки (файл `index.html` и иконки
   должны лежать в корне репозитория).
2. Settings → Pages → Source: `Deploy from a branch`, ветка `main`, папка `/root`.
3. Откройте выданный адрес `https://<user>.github.io/<repo>/`. Нужен HTTPS — Pages его
   даёт автоматически; без него не заработают офлайн-режим и вход через Google.

Всё приложение статическое — подойдёт любой хостинг (Netlify, Vercel, свой сервер).

## Настройка Google (Диск + Календарь)

В файл уже вшит рабочий публичный `client_id`, но для своего сайта надёжнее сделать
собственный — иначе вход/синхронизация могут не подняться на вашем домене, а Google
Calendar API у чужого проекта может быть не включён.

В [Google Cloud Console](https://console.cloud.google.com/):

1. **APIs & Services → Enabled APIs → Enable APIs** — включите **Google Drive API** и
   (для календаря) **Google Calendar API**.
2. **OAuth consent screen** — заполните, в разделе Scopes добавьте:
   - `https://www.googleapis.com/auth/drive.appdata` — синхронизация данных;
   - `https://www.googleapis.com/auth/calendar.events` — обмен с календарём.
3. **Credentials → Create credentials → OAuth client ID → Web application.**
   В **Authorized JavaScript origins** добавьте адрес сайта
   (`https://<user>.github.io` и `http://localhost:5173` для локальной разработки).
4. Скопируйте `Client ID` и подставьте в `index.html` вместо значения `GDRIVE_CLIENT_ID`
   (в самом верху скрипта). В сборке — то же значение в `build-vite/src/main.jsx`.

Google Календарь в приложении — **бета, обмен вручную и только добавление** (ничего не
удаляется): Настройки → Google Календарь → «Отправить неделю» / «Загрузить события».

## Данные и резервные копии

- Данные лежат в `localStorage` и дублируются в `IndexedDB` того же домена, а при входе
  через Google — ещё и в скрытой папке приложения на вашем Диске.
- Настройки → Резервная копия → «Экспорт JSON» делает полную копию; «Импорт JSON»
  восстанавливает.
- Удаления можно отменить в течение 8 секунд (кнопка «Отменить» внизу экрана).

## Сборка без Babel (опционально, быстрее)

Сейчас `index.html` компилирует JSX в браузере через `babel-standalone` (~3 МБ).
В папке `build-vite/` — тот же код, собираемый заранее (быстрее старт, можно включить
строгий CSP без `unsafe-eval`). Запуск:

```bash
cd build-vite
npm install
npm run build     # статика в dist/
```

Подробности и оговорки — в `build-vite/README.md`. Полный список изменений — в
`CHANGES.md`.
