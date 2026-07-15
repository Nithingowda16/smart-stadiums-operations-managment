import random
from sqlalchemy.orm import Session
import models

def simulate_crowd_fluctuation(db: Session):
    """
    Randomly updates crowd densities in seating sectors and gates to simulate fan arrivals and movement.
    """
    sectors = db.query(models.Crowd).all()
    for sector in sectors:
        # Fluctuates density by +/- 5% (clamp between 10% and 98%)
        change = random.uniform(-6, 8)
        new_density = max(10.0, min(98.0, sector.density + change))
        sector.density = round(new_density, 1)
        
        # Calculate queue time based on density
        if sector.density > 80.0:
            sector.queue_time = int(sector.density * 0.4) # e.g. 90% density = 36 min wait
            sector.gate_status = "Diverting" if "Gate" in sector.sector else "Open"
        elif sector.density > 50.0:
            sector.queue_time = int(sector.density * 0.2)
            sector.gate_status = "Open"
        else:
            sector.queue_time = max(1, int(sector.density * 0.1))
            sector.gate_status = "Open"
            
    db.commit()
