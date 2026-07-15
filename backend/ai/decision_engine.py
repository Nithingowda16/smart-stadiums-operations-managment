from typing import Dict, Any, List
from ai import crowd_ai, security_ai, transport_ai, sustainability_ai

def compile_stadium_decisions(
    crowd_sectors: List[Dict[str, Any]],
    parking_lots: List[Dict[str, Any]],
    transit_lines: List[Dict[str, Any]],
    emergencies: List[Dict[str, Any]],
    weather_condition: str,
    sustainability_metrics: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Orchestrates live telemetry through specialized AI modules.
    Returns unified intelligence recommendations.
    """
    # 1. Run Crowd AI
    crowd_result = crowd_ai.analyze_crowd_metrics(crowd_sectors)
    
    # 2. Run Security AI
    critical_crowd_count = len(crowd_result["critical_sectors"])
    security_result = security_ai.evaluate_security_risk(
        incidents=emergencies,
        critical_crowd_count=critical_crowd_count,
        weather_condition=weather_condition
    )
    
    # 3. Run Transport AI
    transport_result = transport_ai.optimize_transportation(
        parking_lots=parking_lots,
        transit_lines=transit_lines
    )
    
    # 4. Run Sustainability AI
    sustainability_result = sustainability_ai.analyze_sustainability(sustainability_metrics)
    
    # Consolidate Recommendations
    all_recommendations = []
    all_recommendations.extend(crowd_result["recommendations"])
    all_recommendations.extend(security_result["recommendations"])
    all_recommendations.extend(transport_result["recommendations"])
    all_recommendations.extend(sustainability_result["sustainability_actions"])
    
    # Default message if all is silent
    if not all_recommendations:
        all_recommendations.append("All operations are performing within standard thresholds.")
        
    return {
        "status": "Operational",
        "stadium_risk_score": security_result["score"],
        "stadium_risk_level": security_result["risk_level"],
        "average_crowd_density": crowd_result["average_density"],
        "best_exit_mode": transport_result["best_exit_mode"],
        "eco_rating": sustainability_result["eco_rating"],
        "co2_saved_kg": sustainability_result["co2_saved_kg"],
        "recommendations": all_recommendations,
        "raw_subsystems": {
            "crowd": crowd_result,
            "security": security_result,
            "transport": transport_result,
            "sustainability": sustainability_result
        }
    }
