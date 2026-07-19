import asyncio
import os
import time
from collections import defaultdict
from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import datetime

from database import engine, get_db, Base
import models
import auth
from ai import navigation_ai, assistant_ai, medical_ai, volunteer_ai, multilingual_ai
from simulation import runner

# Initialize DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FIFA ONE AI Smart Stadium OS", version="1.0.0")

# Setup CORS with environment variable fallback
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if "*" not in allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security Headers Middleware ---
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: wss:;"
    return response

# --- Rate Limiting Middleware ---
RATE_LIMIT_WINDOW = 60 # 60 seconds
MAX_REQUESTS_PER_WINDOW = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
request_history: Dict[str, List[float]] = defaultdict(list)

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    if request.url.path in ["/api/auth/login", "/api/auth/register", "/api/emergencies"]:
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        request_history[client_ip] = [t for t in request_history[client_ip] if now - t < RATE_LIMIT_WINDOW]
        if len(request_history[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
            return JSONResponse(
                status_code=429,
                content={"status": "error", "message": "Rate limit exceeded. Please try again in a minute."}
            )
        request_history[client_ip].append(now)
    return await call_next(request)

# --- Global Exception Handlers ---
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail if isinstance(exc.detail, str) else "Request error",
            "detail": exc.detail
        },
        headers=exc.headers
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error occurred",
            "detail": str(exc)
        }
    )


# WebSocket Connection Pool
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                # remove dead connection
                pass

manager = ConnectionManager()

# Setup simulation runner callback
async def websocket_broadcast_callback(data: dict):
    await manager.broadcast(data)

runner.set_broadcast_callback(websocket_broadcast_callback)

@app.on_event("startup")
async def startup_event():
    # Bootstrap mock data
    db = next(get_db())
    bootstrap_database(db)
    db.close()
    
    # Run the simulation background loop
    asyncio.create_task(runner.run_simulation_loop())

# --- Models for Request Body Validation ---
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: str # Fan, Volunteer, Organizer, Security Officer, Medical Staff, Transport Staff, Food Vendor, Cleaning Staff, Media, Admin
    seat: Optional[str] = "Sector 101, Row A, Seat 1"
    parking: Optional[str] = "Parking Lot A"
    language: Optional[str] = "English"
    emergency_contact: Optional[str] = ""
    medical_info: Optional[str] = "None"
    accessibility_requirement: Optional[str] = "None"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ChatQuery(BaseModel):
    query: str
    language: Optional[str] = "English"

class EmergencyRequest(BaseModel):
    type: str # Fire, Medical, Stampede, Lost Child, Power Failure, Weather Alert
    location: str
    severity: str # Low, Medium, High, Critical
    description: str

class RouteRequest(BaseModel):
    start_node: str
    end_node: str
    accessible_only: bool = False

# --- Database Seeding script ---
def bootstrap_database(db: Session):
    # Check if we already have users
    if db.query(models.User).first():
        print("FIFA ONE AI: DB Seeding skipped, tables already populated.")
        return

    print("FIFA ONE AI: Seeding initial tables...")
    
    # 1. Create Default Users (one for each role)
    roles = ["Fan", "Volunteer", "Organizer", "Venue Staff", "Security Officer", "Medical Staff", "Transport Staff", "Food Vendor", "Cleaning Staff", "Media", "Admin"]
    for i, r in enumerate(roles):
        name = f"Demo {r}"
        email = f"{r.lower().replace(' ', '')}@fifa.one"
        fifa_id = f"FIFA-{10000 + i}"
        hashed = auth.get_password_hash("password123")
        
        user = models.User(
            fifa_id=fifa_id,
            name=name,
            email=email,
            phone=f"+1 202 555 01{90+i}",
            hashed_password=hashed,
            role=r,
            seat="Sector 102, Row D, Seat 15" if r in ["Fan", "Media"] else None,
            parking="Parking Lot A" if i % 2 == 0 else "Parking Lot B",
            language="Spanish" if r == "Volunteer" else "English",
            emergency_contact="Fifa Helpdesk (+1-800-FIFA)",
            medical_info="No major allergies" if r == "Fan" else None,
            accessibility_requirement="Wheelchair" if r == "Venue Staff" else "None",
            qr_code=f"QR-{fifa_id}",
            face_id_placeholder="SCAN_VERIFIED",
            digital_stadium_pass=f"PASS-{fifa_id}"
        )
        db.add(user)

    # 2. Add Match Info
    match = models.Match(
        teams="USA vs Mexico",
        score="1-1",
        phase="Quarter Finals",
        time_elapsed=55,
        status="Live"
    )
    db.add(match)

    # 3. Seating Sectors Crowd Density
    sectors = [
        "Gate A (East Entrance)", "Gate B (North Entrance)", "Gate C (West Entrance)", "Gate D (South Entrance)",
        "Section 101", "Section 102", "Section 103", "Section 104", "VIP Box Suites", "Main Concourse"
    ]
    for s in sectors:
        db.add(models.Crowd(sector=s, density=45.0 if "Section" in s else 30.0, queue_time=5))

    # 4. Parking Lots
    db.add(models.Parking(lot_id="Parking Lot A (VIP)", total_spaces=150, occupied_spaces=120))
    db.add(models.Parking(lot_id="Parking Lot B (General)", total_spaces=600, occupied_spaces=350))
    db.add(models.Parking(lot_id="Parking Lot C (Overflow)", total_spaces=400, occupied_spaces=50))

    # 5. Transportation Lines
    db.add(models.Transportation(type="Metro", line_name="Red Line Northbound", status="Normal", estimated_wait=6))
    db.add(models.Transportation(type="Metro", line_name="Blue Line Southbound", status="Normal", estimated_wait=8))
    db.add(models.Transportation(type="Bus", line_name="Express Shuttle B", status="Normal", estimated_wait=4))
    db.add(models.Transportation(type="Taxi", line_name="Main Taxi Queue", status="Normal", estimated_wait=12))

    # 6. Concessions / Food Stands
    db.add(models.Food(stand_id="f1", name="Stadium Burgers & Brew", queue_time=8, rating=4.6, is_veg=True, is_halal=True, is_vegan=False, price_level="$$", nearest_gate="Gate A"))
    db.add(models.Food(stand_id="f2", name="Tacos Campeón", queue_time=12, rating=4.8, is_veg=True, is_halal=False, is_vegan=True, price_level="$", nearest_gate="Gate B"))
    db.add(models.Food(stand_id="f3", name="Pizza Express FIFA", queue_time=5, rating=4.2, is_veg=True, is_halal=True, is_vegan=False, price_level="$$", nearest_gate="Gate D"))

    # 7. Volunteers List
    vols = [
        ("V-201", "Sophia Martinez", "Spanish, English", "Gate B"),
        ("V-202", "Ahmed Al-Fayed", "Arabic, English, French", "Gate D"),
        ("V-203", "Rajesh Kumar", "Hindi, English", "Food Court 1"),
        ("V-204", "Yuki Tanaka", "Japanese, English", "VIP Lounge")
    ]
    for vid, name, langs, loc in vols:
        db.add(models.Volunteer(volunteer_id=vid, name=name, languages=langs, current_location=loc, status="Available"))

    # 8. Medical Staff
    db.add(models.MedicalStaff(staff_id="M-101", name="Dr. Evelyn Carter", current_location="Medical Center Alpha", status="Available"))
    db.add(models.MedicalStaff(staff_id="M-102", name="Dr. Mark Thompson", current_location="Gate C Station", status="Available"))

    # 9. Navigation Nodes and Edges (Stadium Graph)
    nodes = {
        "gate_a": ("Gate A (East Ingress)", 10.0, 50.0, "gate"),
        "gate_b": ("Gate B (North Ingress)", 50.0, 10.0, "gate"),
        "gate_c": ("Gate C (West Ingress)", 90.0, 50.0, "gate"),
        "gate_d": ("Gate D (South Ingress)", 50.0, 90.0, "gate"),
        "vip_entrance": ("VIP Lounge Entry", 50.0, 35.0, "gate"),
        "sec_101": ("Section 101 (East Stand)", 25.0, 50.0, "seat"),
        "sec_102": ("Section 102 (North Stand)", 50.0, 25.0, "seat"),
        "sec_103": ("Section 103 (West Stand)", 75.0, 50.0, "seat"),
        "sec_104": ("Section 104 (South Stand)", 50.0, 75.0, "seat"),
        "vip_box": ("VIP Executive Suites", 50.0, 45.0, "seat"),
        "food_court_1": ("Food Court 1", 30.0, 30.0, "food"),
        "food_court_2": ("Food Court 2", 70.0, 70.0, "food"),
        "medical_station": ("Medical Center Alpha", 70.0, 30.0, "medical"),
        "washroom_1": ("Washrooms North", 35.0, 20.0, "washroom"),
        "washroom_2": ("Washrooms South", 65.0, 80.0, "washroom"),
        "parking_lot_a": ("Parking Lot A (VIP)", 5.0, 20.0, "parking"),
        "parking_lot_b": ("Parking Lot B (General)", 5.0, 80.0, "parking")
    }
    for nid, (label, x, y, nt) in nodes.items():
        db.add(models.NavigationNode(id=nid, label=label, x=x, y=y, node_type=nt))

    edges = [
        ("gate_a", "sec_101", 15.0, True),
        ("gate_b", "sec_102", 15.0, True),
        ("gate_c", "sec_103", 15.0, True),
        ("gate_d", "sec_104", 15.0, True),
        ("gate_a", "food_court_1", 25.0, True),
        ("gate_b", "washroom_1", 10.0, True),
        ("gate_b", "food_court_1", 20.0, True),
        ("gate_c", "medical_station", 20.0, True),
        ("gate_c", "food_court_2", 20.0, True),
        ("gate_d", "washroom_2", 10.0, True),
        ("gate_d", "food_court_2", 20.0, True),
        ("sec_101", "vip_box", 12.0, False), # Stairs only
        ("sec_102", "vip_box", 12.0, False), # Stairs only
        ("vip_entrance", "vip_box", 10.0, True), # Lift/Wheelchair friendly
        ("parking_lot_a", "gate_a", 15.0, True),
        ("parking_lot_b", "gate_d", 20.0, True),
        ("food_court_1", "medical_station", 35.0, True),
        ("food_court_2", "washroom_2", 15.0, True),
        ("sec_101", "sec_102", 25.0, True),
        ("sec_102", "sec_103", 25.0, True),
        ("sec_103", "sec_104", 25.0, True),
        ("sec_104", "sec_101", 25.0, True),
    ]
    for start, end, wt, acc in edges:
        db.add(models.NavigationEdge(start_node=start, end_node=end, weight=wt, accessible=acc))

    db.commit()
    runner.execute_single_step(db)
    print("FIFA ONE AI: DB successfully seeded and telemetry cache initialized.")

# --- Endpoints API ---


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if email or username exists
    exists = db.query(models.User).filter(models.User.email == user_data.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email is already registered.")
        
    fifa_id_count = db.query(models.User).count()
    new_fifa_id = f"FIFA-{10000 + fifa_id_count + 1}"
    
    hashed_pwd = auth.get_password_hash(user_data.password)
    
    new_user = models.User(
        fifa_id=new_fifa_id,
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        hashed_password=hashed_pwd,
        role=user_data.role,
        seat=user_data.seat,
        parking=user_data.parking,
        language=user_data.language,
        emergency_contact=user_data.emergency_contact,
        medical_info=user_data.medical_info,
        accessibility_requirement=user_data.accessibility_requirement,
        qr_code=f"QR-{new_fifa_id}",
        face_id_placeholder="SCAN_VERIFIED",
        digital_stadium_pass=f"PASS-{new_fifa_id}"
    )
    
    db.add(new_user)
    
    # Audit log
    audit = models.AuditLog(
        action="USER_REGISTRATION",
        user_id=new_fifa_id,
        details=f"New user registered with role {user_data.role}."
    )
    db.add(audit)
    db.commit()
    
    return {
        "message": "User registered successfully",
        "fifa_id": new_fifa_id,
        "name": new_user.name,
        "role": new_user.role
    }

@app.post("/api/auth/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = auth.create_access_token(data={"sub": user.fifa_id})
    
    # Audit log
    audit = models.AuditLog(
        action="USER_LOGIN",
        user_id=user.fifa_id,
        details=f"User logged in from portal."
    )
    db.add(audit)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "fifa_id": user.fifa_id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "seat": user.seat,
            "parking": user.parking,
            "language": user.language,
            "accessibility_requirement": user.accessibility_requirement,
            "qr_code": user.qr_code,
            "digital_stadium_pass": user.digital_stadium_pass
        }
    }

@app.get("/api/auth/profile")
def get_profile(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "fifa_id": current_user.fifa_id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "seat": current_user.seat,
        "parking": current_user.parking,
        "language": current_user.language,
        "emergency_contact": current_user.emergency_contact,
        "medical_info": current_user.medical_info,
        "accessibility_requirement": current_user.accessibility_requirement,
        "qr_code": current_user.qr_code,
        "digital_stadium_pass": current_user.digital_stadium_pass
    }

@app.get("/api/telemetry")
def get_telemetry():
    """
    Returns the cached, real-time aggregated metrics computed by simulators + decision engines.
    """
    return runner.latest_telemetry_cache

@app.post("/api/navigation/route")
def get_route(req: RouteRequest, db: Session = Depends(get_db)):
    """
    Computes shortest path based on accessibility rules and crowd densities.
    """
    nodes = db.query(models.NavigationNode).all()
    edges = db.query(models.NavigationEdge).all()
    crowd_sectors = db.query(models.Crowd).all()
    
    nodes_dict = {
        n.id: {"x": n.x, "y": n.y, "label": n.label, "node_type": n.node_type}
        for n in nodes
    }
    
    edges_list = [
        {"start": e.start_node, "end": e.end_node, "weight": e.weight, "accessible": e.accessible}
        for e in edges
    ]
    
    crowd_dict = {c.sector: c.density for c in crowd_sectors}
    
    path, weight, voice_instructions = navigation_ai.solve_dijkstra(
        nodes=nodes_dict,
        edges=edges_list,
        start=req.start_node,
        end=req.end_node,
        accessible_only=req.accessible_only,
        congested_sectors=crowd_dict
    )
    
    # Format coordinate nodes
    coord_path = []
    for step in path:
        coord_path.append({
            "id": step,
            "label": nodes_dict[step]["label"],
            "x": nodes_dict[step]["x"],
            "y": nodes_dict[step]["y"],
            "node_type": nodes_dict[step]["node_type"]
        })
        
    return {
        "path": path,
        "coordinate_path": coord_path,
        "distance_weight": weight,
        "voice_instructions": voice_instructions
    }

@app.get("/api/navigation/nodes")
def get_navigation_nodes(db: Session = Depends(get_db)):
    nodes = db.query(models.NavigationNode).all()
    return [{"id": n.id, "label": n.label, "x": n.x, "y": n.y, "node_type": n.node_type} for n in nodes]

@app.post("/api/emergency/trigger")
def trigger_emergency(req: EmergencyRequest, db: Session = Depends(get_db)):
    """
    Triggers an emergency incident. Runs medical_ai / volunteer matching and auto-dispatches.
    """
    # Create emergency record
    new_emp = models.Emergency(
        type=req.type,
        location=req.location,
        severity=req.severity,
        description=req.description,
        status="Active"
    )
    db.add(new_emp)
    
    # Create alert
    alert = models.Alert(
        title=f"Emergency: {req.type}",
        message=f"[{req.severity} Severity] at {req.location}. {req.description}",
        type="emergency"
    )
    db.add(alert)
    db.commit()
    
    # Trigger matching heuristics
    volunteers = db.query(models.Volunteer).all()
    medics = db.query(models.MedicalStaff).all()
    
    vols_list = [{"volunteer_id": v.volunteer_id, "name": v.name, "x": 50.0, "y": 50.0, "status": v.status} for v in volunteers]
    meds_list = [{"staff_id": m.staff_id, "name": m.name, "x": 70.0, "y": 30.0, "status": m.status} for m in medics]
    
    # We mock coordinate maps of emergency (e.g. Center)
    ecoords = {"x": 50.0, "y": 50.0}
    
    dispatch_results = medical_ai.dispatch_medical_assistance(
        emergency_location=req.location,
        emergency_coords=ecoords,
        staff_list=meds_list,
        volunteer_list=vols_list
    )
    
    # Assign closest volunteer in db
    dispatched_vol = dispatch_results.get("dispatched_volunteer")
    dispatched_staff = dispatch_results.get("dispatched_staff")
    
    resolver_name = "None"
    if dispatched_vol:
        db_vol = db.query(models.Volunteer).filter(models.Volunteer.volunteer_id == dispatched_vol["volunteer_id"]).first()
        if db_vol:
            db_vol.status = "Busy"
            db_vol.assigned_task = f"Respond to emergency at {req.location}"
            resolver_name = db_vol.name
            
    if dispatched_staff:
        db_staff = db.query(models.MedicalStaff).filter(models.MedicalStaff.staff_id == dispatched_staff["staff_id"]).first()
        if db_staff:
            db_staff.status = "Dispatched"
            if resolver_name == "None":
                resolver_name = db_staff.name
            else:
                resolver_name += f" & {db_staff.name}"
                
    # Update emergency with who is dispatched
    new_emp.status = "Dispatched"
    new_emp.resolver_id = resolver_name
    
    # Log audit trail
    audit = models.AuditLog(
        action="EMERGENCY_TRIGGERED",
        details=f"Emergency {req.type} triggered at {req.location}. Dispatched {resolver_name}."
    )
    db.add(audit)
    db.commit()
    
    return {
        "emergency_id": new_emp.id,
        "status": "Dispatched",
        "resolver": resolver_name,
        "ai_recommendation": dispatch_results["recommendation"],
        "staff_eta": dispatch_results["staff_eta_minutes"],
        "volunteer_eta": dispatch_results["volunteer_eta_minutes"]
    }

@app.post("/api/emergency/resolve/{eid}")
def resolve_emergency(eid: int, db: Session = Depends(get_db)):
    emergency = db.query(models.Emergency).filter(models.Emergency.id == eid).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    emergency.status = "Resolved"
    
    # Free up volunteers and medics that were dispatched
    vols = db.query(models.Volunteer).filter(models.Volunteer.assigned_task.contains(emergency.location)).all()
    for v in vols:
        v.status = "Available"
        v.assigned_task = None
        
    meds = db.query(models.MedicalStaff).filter(models.MedicalStaff.status == "Dispatched").all()
    for m in meds:
        m.status = "Available"
        
    audit = models.AuditLog(
        action="EMERGENCY_RESOLVED",
        details=f"Incident {emergency.type} at {emergency.location} marked as manually resolved."
    )
    db.add(audit)
    db.commit()
    
    return {"message": f"Incident {eid} resolved successfully"}

@app.post("/api/assistant/chat")
def chat_with_assistant(req: ChatQuery, current_user: models.User = Depends(auth.get_current_user)):
    user_role = current_user.role if current_user else "Fan"
    res = assistant_ai.get_assistant_response(req.query, user_role, req.language)
    
    # Translate response using multilingual AI if language is not English
    if req.language != "English":
        res["reply"] = multilingual_ai.translate_freeform(res["reply"], req.language)
        
    return res

@app.get("/api/food")
def get_food_stands(db: Session = Depends(get_db)):
    stands = db.query(models.Food).all()
    return [{
        "id": s.stand_id,
        "name": s.name,
        "queue_time": s.queue_time,
        "rating": s.rating,
        "is_veg": s.is_veg,
        "is_halal": s.is_halal,
        "is_vegan": s.is_vegan,
        "price_level": s.price_level,
        "nearest_gate": s.nearest_gate
    } for s in stands]

@app.get("/api/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(50).all()
    return [{
        "id": l.id,
        "timestamp": l.timestamp.isoformat(),
        "user_id": l.user_id,
        "action": l.action,
        "details": l.details
    } for l in logs]

# --- WebSockets endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # immediately send current state
        if runner.latest_telemetry_cache:
            await websocket.send_json(runner.latest_telemetry_cache)
        while True:
            # keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
