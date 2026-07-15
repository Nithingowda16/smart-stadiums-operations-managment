import random
from sqlalchemy.orm import Session
import models

def simulate_volunteer_movement(db: Session):
    """
    Randomly moves volunteers' coordinates or shifts their availability status.
    """
    volunteers = db.query(models.Volunteer).all()
    locations = ["Gate A", "Gate B", "Gate C", "Gate D", "Food Court 1", "Medical Center", "Parking Lot A", "VIP Lounge"]
    
    for v in volunteers:
        # 10% chance of changing location
        if random.random() < 0.10:
            v.current_location = random.choice(locations)
            
        # 5% chance of shifting status between Available / Busy
        if random.random() < 0.05:
            if v.status == "Available":
                v.status = random.choice(["Busy", "On Break"])
            else:
                v.status = "Available"
                
    db.commit()
