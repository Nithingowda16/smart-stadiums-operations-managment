import random

def get_current_water() -> float:
    """
    Returns water consumption in liters.
    """
    # Fluctuate around 7500 liters base load
    return round(7500.0 + random.uniform(-1000, 1800), 1)
