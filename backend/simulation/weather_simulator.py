import random
from sqlalchemy.orm import Session
import models

# Shared weather state in memory
current_weather = {
    "temperature_c": 24.5,
    "condition": "Clear", # Clear, Cloudy, Light Rain, Heavy Rain, Thunderstorm
    "wind_kph": 12.0
}

def simulate_weather():
    """
    Simulates changing weather.
    """
    conditions = ["Clear", "Clear", "Cloudy", "Cloudy", "Light Rain", "Heavy Rain", "Thunderstorm"]
    current_weather["condition"] = random.choice(conditions)
    current_weather["temperature_c"] = round(current_weather["temperature_c"] + random.uniform(-0.5, 0.5), 1)
    current_weather["wind_kph"] = round(max(0.0, current_weather["wind_kph"] + random.uniform(-2, 2)), 1)
    
    return current_weather
