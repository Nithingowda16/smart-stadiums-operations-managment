from typing import List, Dict, Any

def evaluate_security_risk(
    incidents: List[Dict[str, Any]], 
    critical_crowd_count: int,
    weather_condition: str
) -> Dict[str, Any]:
    """
    Computes overall risk score (0-100) and outputs recommendations.
    """
    base_score = 10.0 # Standard low-level operating score
    
    # Increase based on active incident count and severity
    for inc in incidents:
        severity = inc.get("severity", "Low").lower()
        if severity == "critical":
            base_score += 35
        elif severity == "high":
            base_score += 20
        elif severity == "medium":
            base_score += 10
        else:
            base_score += 5

    # Crowd bottlenecks
    base_score += (critical_crowd_count * 8)
    
    # Weather penalty
    if weather_condition.lower() in ["thunderstorm", "heavy rain", "hurricane"]:
        base_score += 15
        
    risk_score = min(100.0, base_score)
    
    # Determine level and actionable rules
    if risk_score >= 75.0:
        level = "CRITICAL"
        recommendations = [
            "ACTIVATE LOCKDOWN MODE on congested gates.",
            "Broadcast emergency evacuation paths to all Organizer and Security displays.",
            "Deploy all available backup tactical units to Main Concourses."
        ]
    elif risk_score >= 40.0:
        level = "MEDIUM"
        recommendations = [
            "Increase perimeter sweep frequency.",
            "Put medical and first-response teams on standby.",
            "Monitor crowd ingress nodes via CCTV."
        ]
    else:
        level = "LOW"
        recommendations = [
            "Maintain standard stadium patrol protocols.",
            "Monitor standard entry lanes."
        ]
        
    return {
        "score": risk_score,
        "risk_level": level,
        "recommendations": recommendations
    }
