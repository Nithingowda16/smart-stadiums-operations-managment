from typing import List, Dict, Any

def optimize_transportation(
    parking_lots: List[Dict[str, Any]],
    transit_lines: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Analyzes parking and mass transit times. Generates guidance logic.
    """
    recommendations = []
    
    # Analyze parking
    parking_alert = False
    for lot in parking_lots:
        total = lot.get("total_spaces", 500)
        occupied = lot.get("occupied_spaces", 0)
        pct = (occupied / total) * 100 if total > 0 else 0
        
        if pct >= 95.0:
            recommendations.append(
                f"PARKING EXHAUSTED: Lot {lot.get('lot_id')} is full. Reroute incoming VIP and general parking to Lot C."
            )
            parking_alert = True
        elif pct >= 80.0:
            recommendations.append(
                f"PARKING ADVISORY: Lot {lot.get('lot_id')} is at {pct:.1f}% capacity. Advise arrivals of alternative bays."
            )

    # Analyze transit delay / waits
    slow_transit = []
    fast_transit = []
    for line in transit_lines:
        wait = line.get("estimated_wait", 5)
        name = f"{line.get('type')} - {line.get('line_name')}"
        
        if wait > 15:
            slow_transit.append(name)
        else:
            fast_transit.append(name)

    if slow_transit:
        recommendations.append(
            f"TRANSIT CONGESTION: High delays on {', '.join(slow_transit)}. Advise fans via App Wallet and Dynamic Island to use {fast_transit[0] if fast_transit else 'Buses'} instead."
        )
    else:
        recommendations.append(
            "Mass transit flows are running within normal parameters. Recommending balanced dispersal across Metro Lines and Bus Lanes."
        )

    # Exit strategy suggestion
    best_exit = "Metro Line 1 (West Exit)"
    if any("Metro" in s for s in slow_transit):
        best_exit = "Bus Terminal B (North Exit)"

    return {
        "best_exit_mode": best_exit,
        "parking_divert_required": parking_alert,
        "recommendations": recommendations
    }
