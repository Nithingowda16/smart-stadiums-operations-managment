import math
from typing import List, Dict, Any

def dispatch_medical_assistance(
    emergency_location: str,
    emergency_coords: Dict[str, float], # {x, y}
    staff_list: List[Dict[str, Any]],     # [{id, name, x, y, status}]
    volunteer_list: List[Dict[str, Any]]  # [{id, name, x, y, status}]
) -> Dict[str, Any]:
    """
    Finds the closest available medical staff and volunteer to dispatch.
    Computes Euclidean distances and estimated arrival times (ETA).
    """
    ex, ey = emergency_coords.get("x", 50.0), emergency_coords.get("y", 50.0)
    
    closest_staff = None
    min_staff_dist = float('inf')
    
    for staff in staff_list:
        if staff.get("status") != "Available":
            continue
        sx = staff.get("x", 0.0)
        sy = staff.get("y", 0.0)
        dist = math.sqrt((sx - ex)**2 + (sy - ey)**2)
        if dist < min_staff_dist:
            min_staff_dist = dist
            closest_staff = staff

    closest_volunteer = None
    min_vol_dist = float('inf')
    for vol in volunteer_list:
        if vol.get("status") != "Available":
            continue
        vx = vol.get("x", 0.0)
        vy = vol.get("y", 0.0)
        dist = math.sqrt((vx - ex)**2 + (vy - ey)**2)
        if dist < min_vol_dist:
            min_vol_dist = dist
            closest_volunteer = vol

    # Speed metrics: Staff travels at 3 grid units per minute, Volunteer at 4 units per minute
    staff_eta = round((min_staff_dist / 3.0), 1) if closest_staff else 99.0
    vol_eta = round((min_vol_dist / 4.0), 1) if closest_volunteer else 99.0
    
    recommendation = ""
    if closest_staff and closest_volunteer:
        recommendation = (
            f"DISPATCH SUGGESTION: Alert nearest Medic {closest_staff['name']} (ETA: {staff_eta}m) "
            f"and volunteer {closest_volunteer['name']} (ETA: {vol_eta}m) to secure the location at {emergency_location}."
        )
    elif closest_staff:
        recommendation = f"DISPATCH SUGGESTION: Alert Medic {closest_staff['name']} (ETA: {staff_eta}m)."
    elif closest_volunteer:
        recommendation = f"DISPATCH SUGGESTION: Alert volunteer {closest_volunteer['name']} (ETA: {vol_eta}m) as no medics are free."
    else:
        recommendation = "ALERT: No medical or volunteer units are currently available. Escalate to Stadium Command."

    return {
        "dispatched_staff": closest_staff,
        "dispatched_volunteer": closest_volunteer,
        "staff_eta_minutes": staff_eta,
        "volunteer_eta_minutes": vol_eta,
        "recommendation": recommendation
    }
