import random

def get_current_energy() -> float:
    """
    Returns electricity consumption in kWh.
    """
    # Fluctuate around 11000 kWh base load
    return round(11000.0 + random.uniform(-1500, 2500), 1)
