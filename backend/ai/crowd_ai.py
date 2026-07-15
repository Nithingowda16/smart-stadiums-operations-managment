from typing import List, Dict, Any

def analyze_crowd_metrics(sectors: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes stadium crowd densities.
    Returns recommendations, bottleneck zones, and critical sectors.
    """
    critical_sectors = []
    warning_sectors = []
    recommendations = []
    
    total_density = 0.0
    for s in sectors:
        density = s.get("density", 0.0)
        name = s.get("sector", "Unknown Sector")
        total_density += density
        
        if density >= 85.0:
            critical_sectors.append(name)
            # Crowd control triggers
            if "Gate" in name:
                recommendations.append(
                    f"CRITICAL: {name} density is at {density:.1f}%. Redirect fans to adjacent gates immediately."
                )
            else:
                recommendations.append(
                    f"CROWD ALERT: {name} is bottlenecked ({density:.1f}%). Deploy staff to regulate movement."
                )
        elif density >= 70.0:
            warning_sectors.append(name)
            
    avg_density = total_density / len(sectors) if sectors else 0.0
    
    # Global crowd strategy
    if avg_density > 80.0:
        recommendations.append(
            "SYSTEM ACTION: Overall stadium capacity exceeds 80%. Enable exit-flow buffering and pre-open transport gates."
        )
    elif avg_density > 60.0 and len(critical_sectors) == 0:
        recommendations.append(
            "OPTIMIZATION: Smooth crowd distribution. Maintain normal gate operations."
        )
        
    return {
        "average_density": avg_density,
        "critical_sectors": critical_sectors,
        "warning_sectors": warning_sectors,
        "recommendations": recommendations,
        "risk_level": "High" if critical_sectors else ("Medium" if warning_sectors else "Low")
    }
