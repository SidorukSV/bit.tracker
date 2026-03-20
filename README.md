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

## Windows: если ошибка про `dockerDesktopLinuxEngine` pipe

Ошибка вида:

- `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`
- `The system cannot find the file specified`

означает, что **Docker Engine не запущен** (или активен не тот контекст/режим).

Что сделать:

1. Запустите **Docker Desktop**.
2. Дождитесь статуса **Engine running**.
3. Переключитесь на **Linux containers** (а не Windows containers).
4. Проверьте контекст:
   ```powershell
   docker context ls
   docker context use default
   ```
5. Проверьте подключение:
   ```powershell
   docker version
   ```
6. После этого снова:
   ```powershell
   cd infra
   docker compose up -d --build
   ```

### PowerShell helper-скрипты

Из каталога `infra`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-docker.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\up.ps1
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
