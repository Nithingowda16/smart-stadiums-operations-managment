import random
from sqlalchemy.orm import Session
import models

def simulate_camera_scans(db: Session):
    """
    Simulates optical ticket scanning and automated face checking at gates.
    Occasionally triggers suspicious alerts if scanner detects issues.
    """
    gates = ["Gate A", "Gate B", "Gate C", "Gate D", "VIP Entry"]
    chosen_gate = random.choice(gates)
    
    # Simulate standard check-in
    user = db.query(models.User).filter(models.User.role == "Fan").order_by(models.User.id).first()
    user_name = user.name if user else "Unknown Fan"
    
    log = models.AuditLog(
        action="TICKET_SCAN",
        user_id=user.fifa_id if user else "FIFA-MOCK-ID",
        details=f"Successful digital pass scan at {chosen_gate} for {user_name}."
    )
    db.add(log)
    
    # 5% chance of simulating suspicious tailgating / gate jumping alert
    if random.random() < 0.05:
        alert = models.Alert(
            title="Intrusion Detected",
            message=f"CCTV camera scanned tailgate warning at {chosen_gate}. Directing security to verify.",
            type="warning"
        )
        db.add(alert)
        
    db.commit()
