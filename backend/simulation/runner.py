import asyncio
import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from simulation import (
    crowd_simulator,
    transport_simulator,
    parking_simulator,
    camera_simulator,
    weather_simulator,
    energy_simulator,
    water_simulator,
    waste_simulator,
    medical_simulator,
    volunteer_simulator
)
from ai import decision_engine

# A global variable to store the latest decision engine results
latest_telemetry_cache = {}

# Keep track of active websocket broadcast callback
broadcast_callback = None

def set_broadcast_callback(cb):
    global broadcast_callback
    broadcast_callback = cb

async def run_simulation_loop():
    """
    Infinite loop running every 5 seconds, triggering simulators,
    updating SQLite, running the AI decision engine, and broadcasting state.
    """
    global latest_telemetry_cache
    print("FIFA ONE AI: Starting Live Simulation loop...")
    
    while True:
        try:
            db: Session = SessionLocal()
            
            # 1. Run all individual simulators
            crowd_simulator.simulate_crowd_fluctuation(db)
            transport_simulator.simulate_transportation(db)
            parking_simulator.simulate_parking_occupancy(db)
            camera_simulator.simulate_camera_scans(db)
            medical_simulator.simulate_medical_events(db)
            volunteer_simulator.simulate_volunteer_movement(db)
            
            # 2. Gather weather state
            w_state = weather_simulator.simulate_weather()
            
            # 3. Gather sustainability metrics
            elec = energy_simulator.get_current_energy()
            wat = water_simulator.get_current_water()
            waste_data = waste_simulator.get_current_waste()
            
            # Save sustainability telemetry in database
            sust = models.SustainabilityMetric(
                electricity_kwh=elec,
                water_liters=wat,
                waste_kg=waste_data["waste_kg"],
                plastic_bottles=waste_data["plastic_bottles"],
                carbon_g=waste_data["carbon_g"],
                food_waste_kg=waste_data["food_waste_kg"]
            )
            db.add(sust)
            db.commit()
            
            # 4. Pull fresh DB records for AI Decision Engine compilation
            crowd_records = db.query(models.Crowd).all()
            parking_records = db.query(models.Parking).all()
            transit_records = db.query(models.Transportation).all()
            emergency_records = db.query(models.Emergency).filter(models.Emergency.status != "Resolved").all()
            
            crowd_list = [{"sector": c.sector, "density": c.density, "queue_time": c.queue_time} for c in crowd_records]
            parking_list = [{"lot_id": p.lot_id, "total_spaces": p.total_spaces, "occupied_spaces": p.occupied_spaces} for p in parking_records]
            transit_list = [{"type": t.type, "line_name": t.line_name, "status": t.status, "estimated_wait": t.estimated_wait} for t in transit_records]
            emergency_list = [{"type": e.type, "location": e.location, "severity": e.severity, "description": e.description} for e in emergency_records]
            
            sust_dict = {
                "electricity_kwh": elec,
                "water_liters": wat,
                "waste_kg": waste_data["waste_kg"],
                "plastic_bottles": waste_data["plastic_bottles"],
                "carbon_g": waste_data["carbon_g"],
                "food_waste_kg": waste_data["food_waste_kg"]
            }
            
            # 5. Compile decisions
            decisions = decision_engine.compile_stadium_decisions(
                crowd_sectors=crowd_list,
                parking_lots=parking_list,
                transit_lines=transit_list,
                emergencies=emergency_list,
                weather_condition=w_state["condition"],
                sustainability_metrics=sust_dict
            )
            
            # 6. Format final telemetry object
            active_match = db.query(models.Match).filter(models.Match.status == "Live").first()
            if not active_match:
                active_match = db.query(models.Match).first()
                
            match_dict = {
                "teams": active_match.teams if active_match else "No Active Match",
                "score": active_match.score if active_match else "0-0",
                "phase": active_match.phase if active_match else "N/A",
                "time_elapsed": active_match.time_elapsed if active_match else 0
            }
            
            # Fluctuate match time & score slowly if live
            if active_match and active_match.status == "Live":
                active_match.time_elapsed += 1
                if active_match.time_elapsed > 90:
                    active_match.status = "Finished"
                # very small chance of a goal
                import random
                if random.random() < 0.04:
                    s1, s2 = map(int, active_match.score.split("-"))
                    if random.choice([True, False]):
                        s1 += 1
                    else:
                        s2 += 1
                    active_match.score = f"{s1}-{s2}"
                db.commit()
            
            # Fetch active alerts
            alert_records = db.query(models.Alert).order_by(models.Alert.timestamp.desc()).limit(10).all()
            alerts_list = [{
                "id": a.id,
                "title": a.title,
                "message": a.message,
                "type": a.type,
                "timestamp": a.timestamp.isoformat()
            } for a in alert_records]
            
            latest_telemetry_cache = {
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "match": match_dict,
                "weather": w_state,
                "sustainability": sust_dict,
                "crowd": crowd_list,
                "parking": parking_list,
                "transportation": transit_list,
                "emergencies": [{"id": e.id, "type": e.type, "location": e.location, "severity": e.severity, "description": e.description, "status": e.status} for e in db.query(models.Emergency).filter(models.Emergency.status != "Resolved").all()],
                "alerts": alerts_list,
                "ai_insights": decisions
            }
            
            # 7. Broadcast via WebSockets
            if broadcast_callback:
                await broadcast_callback(latest_telemetry_cache)
                
            db.close()
            
        except Exception as e:
            print(f"Error in simulation loop: {e}")
            
        await asyncio.sleep(5)
