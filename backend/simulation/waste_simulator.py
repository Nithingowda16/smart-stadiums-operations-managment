import random
from typing import Dict, Any

def get_current_waste() -> Dict[str, Any]:
    """
    Returns waste measurements in kg, bottles, carbon.
    """
    return {
        "waste_kg": round(1200.0 + random.uniform(-200, 500), 1),
        "plastic_bottles": random.randint(300, 1200),
        "carbon_g": round(800.0 + random.uniform(-100, 300), 1),
        "food_waste_kg": round(300.0 + random.uniform(-50, 150), 1)
    }
