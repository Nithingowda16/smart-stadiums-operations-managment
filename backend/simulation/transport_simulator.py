import random
from sqlalchemy.orm import Session
import models

def simulate_transportation(db: Session):
    """
    Randomly fluctuates transit wait times and status.
    """
    lines = db.query(models.Transportation).all()
    for line in lines:
        change = random.choice([-1, 0, 1, 2])
        new_wait = max(2, min(45, line.estimated_wait + change))
        line.estimated_wait = new_wait
        
        if new_wait > 20:
            line.status = "Delayed"
        elif new_wait > 10:
            line.status = "Crowded"
        else:
            line.status = "Normal"
            
    db.commit()
