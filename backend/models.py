from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fifa_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Fan") # Fan, Volunteer, Organizer, Venue Staff, Security Officer, Medical Staff, Transport Staff, Food Vendor, Cleaning Staff, Media, Admin
    seat = Column(String, nullable=True)
    parking = Column(String, nullable=True)
    language = Column(String, default="English")
    emergency_contact = Column(String, nullable=True)
    medical_info = Column(String, nullable=True)
    accessibility_requirement = Column(String, nullable=True) # None, Wheelchair, Visual, Hearing, Cognitive
    qr_code = Column(String, nullable=True)
    face_id_placeholder = Column(String, nullable=True)
    digital_stadium_pass = Column(String, nullable=True)

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    teams = Column(String, nullable=False) # e.g. "USA vs Mexico"
    score = Column(String, default="0-0")
    phase = Column(String, default="Group Stage")
    time_elapsed = Column(Integer, default=0) # in minutes
    status = Column(String, default="Upcoming") # Upcoming, Live, Finished

class Crowd(Base):
    __tablename__ = "crowd"

    id = Column(Integer, primary_key=True, index=True)
    sector = Column(String, unique=True, index=True, nullable=False) # Gate A, Sector 101, VIP, etc.
    density = Column(Float, default=0.0) # Percentage 0 to 100
    queue_time = Column(Integer, default=0) # in minutes
    gate_status = Column(String, default="Open") # Open, Closed, Diverting

class NavigationNode(Base):
    __tablename__ = "navigation_nodes"

    id = Column(String, primary_key=True, index=True) # e.g., "gate_a"
    label = Column(String, nullable=False)
    x = Column(Float, nullable=False) # X coordinate in SVG grid
    y = Column(Float, nullable=False) # Y coordinate in SVG grid
    node_type = Column(String, nullable=False) # gate, food, medical, washroom, parking, seat, normal

class NavigationEdge(Base):
    __tablename__ = "navigation_edges"

    id = Column(Integer, primary_key=True, index=True)
    start_node = Column(String, ForeignKey("navigation_nodes.id"), nullable=False)
    end_node = Column(String, ForeignKey("navigation_nodes.id"), nullable=False)
    weight = Column(Float, default=1.0)
    accessible = Column(Boolean, default=True) # Wheelchair friendly (no stairs)

class Emergency(Base):
    __tablename__ = "emergencies"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # Fire, Medical, Stampede, Lost Child, Power Failure, Weather Alert
    location = Column(String, nullable=False) # Sector or coordinates
    severity = Column(String, default="Medium") # Low, Medium, High, Critical
    resolver_id = Column(String, nullable=True) # ID of volunteer/staff dispatched
    status = Column(String, default="Active") # Active, Dispatched, Resolved
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Parking(Base):
    __tablename__ = "parking"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(String, unique=True, index=True, nullable=False) # Parking A, Parking B, VIP
    total_spaces = Column(Integer, default=500)
    occupied_spaces = Column(Integer, default=0)

class Transportation(Base):
    __tablename__ = "transportation"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # Metro, Bus, Taxi
    line_name = Column(String, nullable=False)
    status = Column(String, default="Normal") # Normal, Delayed, Crowded
    estimated_wait = Column(Integer, default=5) # wait time in minutes

class Food(Base):
    __tablename__ = "food"

    id = Column(Integer, primary_key=True, index=True)
    stand_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    queue_time = Column(Integer, default=5)
    rating = Column(Float, default=4.5)
    is_veg = Column(Boolean, default=False)
    is_halal = Column(Boolean, default=False)
    is_vegan = Column(Boolean, default=False)
    price_level = Column(String, default="$$") # $, $$, $$$
    nearest_gate = Column(String, nullable=True)

class MedicalStaff(Base):
    __tablename__ = "medical_staff"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    current_location = Column(String, default="Medical Center")
    status = Column(String, default="Available") # Available, Dispatched, Off-Duty

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    volunteer_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    languages = Column(String, default="English") # comma-separated list
    current_location = Column(String, default="Gate A")
    assigned_task = Column(String, nullable=True)
    status = Column(String, default="Available") # Available, Busy, On Break

class SustainabilityMetric(Base):
    __tablename__ = "sustainability"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    electricity_kwh = Column(Float, default=0.0)
    water_liters = Column(Float, default=0.0)
    waste_kg = Column(Float, default=0.0)
    plastic_bottles = Column(Integer, default=0)
    carbon_g = Column(Float, default=0.0)
    food_waste_kg = Column(Float, default=0.0)

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    body = Column(String, nullable=False)
    category = Column(String, default="General") # General, Security, Traffic, Event
    target_role = Column(String, default="All") # All, Fan, Volunteer, Security, Medical, etc.
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info") # info, warning, emergency
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    resolved = Column(Boolean, default=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    details = Column(String, nullable=True)
