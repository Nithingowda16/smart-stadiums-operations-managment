import random
from sqlalchemy.orm import Session
import models

def simulate_parking_occupancy(db: Session):
    """
    Simulates parking lots filling up or discharging cars.
    """
    lots = db.query(models.Parking).all()
    for lot in lots:
        change = random.randint(-5, 10)
        new_occupied = max(0, min(lot.total_spaces, lot.occupied_spaces + change))
        lot.occupied_spaces = new_occupied
        
    db.commit()
