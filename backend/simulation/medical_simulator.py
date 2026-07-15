import random
from sqlalchemy.orm import Session
import models

def simulate_medical_events(db: Session):
    """
    Randomly generates minor medical emergencies or resolves them.
    """
    # 5% chance of spawning a new incident if total active is low
    active_incidents = db.query(models.Emergency).filter(models.Emergency.status != "Resolved").all()
    
    if len(active_incidents) < 3 and random.random() < 0.08:
        incident_types = [
            ("Medical", "Dehydration reported at East Seating Row F", "Medium"),
            ("Medical", "Heat exhaustion at Gate B entrance", "High"),
            ("Lost Child", "Child separated from parents near Food Court 1", "High"),
            ("Stampede", "Crowd bottleneck alert at Gate C exit staircase", "Critical"),
            ("Power Failure", "Slight lighting flicker in South Concourse B", "Low"),
        ]
        chosen = random.choice(incident_types)
        
        # Check if already exists to avoid duplication
        exists = db.query(models.Emergency).filter(
            models.Emergency.type == chosen[0],
            models.Emergency.description == chosen[1],
            models.Emergency.status != "Resolved"
        ).first()
        
        if not exists:
            new_inc = models.Emergency(
                type=chosen[0],
                location=chosen[1].split(" near ")[-1].split(" at ")[-1],
                severity=chosen[2],
                description=chosen[1],
                status="Active"
            )
            db.add(new_inc)
            
            # Create a corresponding alert in Alerts table
            alert = models.Alert(
                title=f"{chosen[0]} Alert",
                message=f"[{chosen[2]} Severity] {chosen[1]}",
                type="emergency" if chosen[2] in ["High", "Critical"] else "warning"
            )
            db.add(alert)

    # 15% chance to resolve an ongoing incident if someone is assigned
    dispatched_incidents = db.query(models.Emergency).filter(
        models.Emergency.status == "Dispatched"
    ).all()
    
    if dispatched_incidents and random.random() < 0.15:
        to_resolve = random.choice(dispatched_incidents)
        to_resolve.status = "Resolved"
        # Update audit log
        log = models.AuditLog(
            action="EMERGENCY_RESOLVED",
            details=f"Incident {to_resolve.type} ({to_resolve.description}) resolved by responder {to_resolve.resolver_id}."
        )
        db.add(log)
        
    db.commit()
