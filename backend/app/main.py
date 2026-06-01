from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import products, customers, orders, dashboard


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management System",
    description="A production-ready API for managing products, customers, and orders.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Inventory & Order Management API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
