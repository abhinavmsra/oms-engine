# 📦 Order Management System (OMS)

A prototype Order Management System (OMS) built with Node.js and PostgreSQL, supporting a volume-based discounting model.

### 📋 Features
- ✅ Volume-based discounts for products.

- ✅ Built-in support for calculating shipping costs per kilogram per kilometer.

- ✅ PostgreSQL integration for data storage.

- ✅ Docker support for containerized development and deployment.


### 🛠️ Tech Stack
- Backend: Node.js (Express)

- Database: PostgreSQL

- Containerization: Docker

- Testing: Jest

### 📦 Project Structure
The project is organized into the following directories and files:
```
  ├── src/
  |     ├── controllers/       # Handles incoming API requests and calls appropriate services
  |     ├── db/                # Database connection, models, and query helpers
  |     ├── migrations/        # SQL migration scripts for schema changes
  |     ├── routes/            # API route definitions and middleware integration
  |     ├── serializers/       # Handles data serialization and API response formatting
  |     ├── services/          # Business logic and core processing
  |     ├── types/             # TypeScript types and interfaces
  |     ├── utils/             # Utility functions and reusable helpers
  |     ├── seeds.sql          # Seed data for initializing the database
  |     └── index.ts           # Entry point for the Express server
  ├── tests/                   # Unit and Integration Tests
  ├── db_erd.png               # ERD diagram for the database schema
  ├── docker-compose.yml       # Docker Compose for local dev setup
  ├── Dockerfile               # Docker setup for dev environment
  ├── eslint.config.mjs        # EsLint configuration
  ├── jest.config.ts           # Jest configuration
  ├── nodemon.json             # Nodemon configuration
  ├── package.json             # Node.js dependencies and scripts
  ├── pnpm-lock.yaml           # PNPM lockfile
  ├── README.md                # Project documentation
  ├── release.config.js        # Semantic release configuration
  └── tsconfig.json            # TypeScript configuration
```

### 🐳 Getting Started with Docker

#### 1. Clone the repository:

```bash
git clone https://github.com/abhinavmsra/oms-engine.git
cd oms-engine
```

---

#### 2. Install Docker:

Ensure Docker is installed on your machine. If not, you can follow the official installation guide here: [Get Docker](https://docs.docker.com/get-docker/)

---

#### 3. Build and start the containers:
```bash
docker-compose up --build -d
```

---

#### 4. Run Database Migrations (with Docker):
```bash
docker compose exec -it dev bash
cd src/
sqlx migrate run
```

This step runs the database migrations inside the running Docker container.

- `docker compose exec -it dev bash`:
  - Runs an interactive shell (bash) inside the running container named `dev`.
  - The container name `dev` is specified in the `docker-compose.yml` file.

- `cd src/`
  - Navigates to the `src/` directory where your migration files and project code are stored.

- `sqlx migrate run`
  - Executes the database migrations using SQLx, a Rust-based SQL toolkit.
  - SQLx reads the migration files (e.g., /src/migrations) and applies them to your PostgreSQL database.
  - This step ensures the database schema is up-to-date with the latest table definitions and constraints.

---
✅ Why SQLx?
  - SQLx is a type-safe SQL toolkit for Rust, which provides a safe and efficient way to interact with databases.
  - SQLx is being used as the migration tool in this project for database version control.
  - SQLx is pre-installed in the Dockerfile so it can be directly used inside the container.

---

#### 5. Seed the Database (with Docker):
```bash
docker compose exec -it dev bash
psql -U app -h db -d oms_development < src/seeds.sql
```

This step seeds the database with initial data for development purposes.

  - `docker compose exec -it dev bash`:
    - Runs an interactive shell (bash) inside the running container named `dev`.
    - The container name `dev` is specified in the `docker-compose.yml` file.

  - `psql -U app -h db -d oms_development < src/seeds.sql`
    - Uses the `psql` command-line tool to import the seed data from `src/seeds.sql` into the `oms_development` database.
    - The seed data includes sample products, warehouses, and shipping rates.


### 🧪 Running Tests
```bash
pnpm run test
```

### 📖 API Documentation Access

The Order Management System (OMS) provides interactive API documentation using Swagger UI.

#### 🚀 Accessing the API Documentation

The API documentation is served using a Swagger UI container. To access the documentation:

- Open your browser and navigate to: http://localhost:8080

- The Swagger UI will load the API documentation from the `./docs/apidocs.yml` file.


#### 📦 Generating the API Docs:

Ensure `apidocs.yml` file is up to date. It is managed manually for now.

### 🚀 Deployment

To deploy the OMS system, you can use services like:
	- Heroku
	- DigitalOcean
	- AWS ECS / Lambda
