from typing import Dict, Any

def analyze_sustainability(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes stadium resource usage (electricity, water, waste) and outputs actionable green recommendations.
    """
    electricity = metrics.get("electricity_kwh", 0.0)
    water = metrics.get("water_liters", 0.0)
    waste = metrics.get("waste_kg", 0.0)
    food_waste = metrics.get("food_waste_kg", 0.0)
    carbon = metrics.get("carbon_g", 0.0)
    
    recommendations = []
    actions = []
    
    # Heuristics based on typical values
    if electricity > 12000.0:
        recommendations.append("Energy surge detected in West Concourse.")
        actions.append("ACTION: Dim lights by 15% in unoccupied luxury suites and VIP corridors.")
        actions.append("ACTION: Increase AC temperature threshold by 1.5°C in administrative areas.")
    else:
        recommendations.append("Energy consumption is optimal.")
        
    if water > 8000.0:
        recommendations.append("Abnormal water consumption rates in East sector bathrooms.")
        actions.append("ACTION: Deploy cleaning staff to inspect for leaking toilets or valves.")
    else:
        recommendations.append("Water distribution flow rates within bounds.")
        
    if food_waste > 400.0:
        recommendations.append("High food waste reported from main food stands.")
        actions.append("ACTION: Distribute surplus food logs to volunteer coordinators for donation routing.")

    if waste > 1500.0:
        actions.append("ACTION: Route additional waste bins and cleanup crews to North Concourse.")

    # Calculate overall eco efficiency rating (A to F)
    total_score = 100
    if electricity > 15000: total_score -= 20
    if water > 10000: total_score -= 15
    if food_waste > 500: total_score -= 15
    if waste > 2000: total_score -= 10
    
    if total_score >= 85:
        rating = "A"
    elif total_score >= 70:
        rating = "B"
    elif total_score >= 55:
        rating = "C"
    else:
        rating = "D"

    return {
        "efficiency_score": total_score,
        "eco_rating": rating,
        "recommendations": recommendations,
        "sustainability_actions": actions,
        "co2_saved_kg": round(carbon * 0.0004, 1) # simple carbon offset formula
    }
