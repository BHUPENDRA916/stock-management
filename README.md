# Inventory Management System

Hey! Welcome to my inventory and order management system. I built this project to manage products, customers, and orders smoothly. It's a full-stack web app, designed to be completely containerized with Docker.

## Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy (PostgreSQL)
- **Frontend:** React 18, Vite, React Router
- **Database:** PostgreSQL
- **Infrastructure:** Docker & Docker Compose

## Getting Started

If you want to run this locally, the easiest way is using Docker:

1. Clone the repo:
   ```bash
   git clone https://github.com/BHUPENDRA916/stock-management.git
   cd stock-management
   ```

2. Set up your environment variables (I've included an example file):
   ```bash
   cp .env.example .env
   ```

3. Spin up the containers:
   ```bash
   docker compose up --build
   ```

Once it's up, you can hit the frontend at `http://localhost`, and the backend API is at `http://localhost:8000` (along with Swagger docs at `/docs`).

## Features

- **Products & Inventory:** Manage products, enforce unique SKUs, and keep track of stock.
- **Orders:** Creating an order automatically deducts from the inventory. If an order is canceled, the stock is automatically restored. 
- **Customers:** Basic customer directory.
- **Dashboard:** A quick overview with real-time stats and alerts for low-stock items.

## Development (Without Docker)

If you prefer running things bare-metal:

**Backend:**
Navigate into the `backend/` folder, create a virtual environment, install the `requirements.txt`, set your `DATABASE_URL` env variable, and start the server with `uvicorn app.main:app --reload`.

**Frontend:**
Go into `frontend/`, run `npm install`, add a `.env.local` file with `VITE_API_URL=http://localhost:8000`, and start it with `npm run dev`.
