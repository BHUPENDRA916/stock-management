from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("", response_model=schemas.DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock = (
        db.query(models.Product)
        .filter(models.Product.quantity <= LOW_STOCK_THRESHOLD)
        .all()
    )
    return schemas.DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock,
    )
