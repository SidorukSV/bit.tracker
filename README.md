# Bit Tracker (MVP scaffold)

Монорепозиторий с базовым каркасом трекера задач:

- **server/** — Node.js + Express API
- **client/** — React (Vite)
- **infra/** — docker-compose и SQL схема для PostgreSQL + MinIO

## Что реализовано

- Команды (иерархия через `parent_team_id`)
- Пользователи и роли: `ADMIN`, `PROJECT_MANAGER`, `MEMBER`
- Проекты -> Доски -> Колонки Канбана -> Задачи
- У задач: описание, сроки, автор, исполнитель, наблюдатели, комментарии
- Пользовательские поля проекта + значения в задачах
- Добавление в проект как всей команды, так и конкретных участников
- Файлы задач в MinIO через presigned URL

## Запуск в Docker (все сервисы сразу)

```bash
cd infra
docker compose up -d --build
```

После старта:

- Frontend: `http://localhost:8080`
- API: `http://localhost:4000`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001` (логин/пароль: `minio` / `minio123`)
- PostgreSQL: `localhost:5432` (`tracker` / `tracker`, база `tracker`)

> SQL схема применяется автоматически при первом создании volume Postgres через `infra/sql/schema.sql`.

Остановка:

```bash
cd infra
docker compose down
```

Полная очистка (включая БД/MinIO данные):

```bash
cd infra
docker compose down -v
```

## Локальный запуск без Docker (опционально)

1. Поднимите отдельно PostgreSQL и MinIO.
2. Примените `infra/sql/schema.sql` к БД `tracker`.
3. Сервер:
   ```bash
   cd server
   cp .env.example .env
   npm install
   npm run dev
   ```
4. Клиент:
   ```bash
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```
