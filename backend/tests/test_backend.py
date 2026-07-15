import pytest
from ai import navigation_ai, assistant_ai, multilingual_ai, sustainability_ai

def test_dijkstra_normal_route():
    # Mock nodes and edges
    nodes = {
        "n1": {"x": 0.0, "y": 0.0, "label": "Node 1", "node_type": "gate"},
        "n2": {"x": 10.0, "y": 0.0, "label": "Node 2", "node_type": "seat"},
        "n3": {"x": 20.0, "y": 0.0, "label": "Node 3", "node_type": "seat"}
    }
    edges = [
        {"start": "n1", "end": "n2", "weight": 5.0, "accessible": True},
        {"start": "n2", "end": "n3", "weight": 4.0, "accessible": True}
    ]
    
    path, weight, instructions = navigation_ai.solve_dijkstra(nodes, edges, "n1", "n3")
    assert path == ["n1", "n2", "n3"]
    assert weight == 9.0
    assert "You have arrived at Node 3" in instructions[-1]

def test_dijkstra_accessibility_block():
    nodes = {
        "n1": {"x": 0.0, "y": 0.0, "label": "Node 1", "node_type": "gate"},
        "n2": {"x": 10.0, "y": 0.0, "label": "Node 2 (Stairs)", "node_type": "seat"},
        "n3": {"x": 20.0, "y": 0.0, "label": "Node 3", "node_type": "seat"},
        "n4": {"x": 10.0, "y": 10.0, "label": "Node 4 (Ramp)", "node_type": "normal"}
    }
    edges = [
        # Normal path with stairs (n1 -> n2 -> n3)
        {"start": "n1", "end": "n2", "weight": 2.0, "accessible": False},
        {"start": "n2", "end": "n3", "weight": 2.0, "accessible": True},
        # Accessible ramp path (n1 -> n4 -> n3)
        {"start": "n1", "end": "n4", "weight": 4.0, "accessible": True},
        {"start": "n4", "end": "n3", "weight": 4.0, "accessible": True}
    ]
    
    # Check regular path (takes the shorter stairs route)
    path, weight, _ = navigation_ai.solve_dijkstra(nodes, edges, "n1", "n3", accessible_only=False)
    assert path == ["n1", "n2", "n3"]
    assert weight == 4.0
    
    # Check accessible-only path (must take the ramp)
    path_acc, weight_acc, _ = navigation_ai.solve_dijkstra(nodes, edges, "n1", "n3", accessible_only=True)
    assert path_acc == ["n1", "n4", "n3"]
    assert weight_acc == 8.0

def test_assistant_triggers():
    res = assistant_ai.get_assistant_response("I need a doctor, my leg hurts", "Fan")
    assert res["action"] == "trigger_medical"
    assert "EMERGENCY" in res["reply"]
    
    res_food = assistant_ai.get_assistant_response("where can I buy some burgers?", "Fan")
    assert res_food["action"] == "draw_route_food"
    assert "concessions" in res_food["reply"].lower()

def test_multilingual_mapping():
    es_welcome = multilingual_ai.translate_phrase("welcome", "Spanish")
    assert "Bienvenido" in es_welcome
    
    fr_emergency = multilingual_ai.translate_phrase("emergency_alert", "French")
    assert "Urgence" in fr_emergency

def test_sustainability_heuristics():
    metrics = {
        "electricity_kwh": 14000.0,
        "water_liters": 9000.0,
        "waste_kg": 1800.0,
        "carbon_g": 900.0,
        "food_waste_kg": 450.0
    }
    analysis = sustainability_ai.analyze_sustainability(metrics)
    assert analysis["eco_rating"] in ["C", "D"]
    assert len(analysis["sustainability_actions"]) > 0
    assert any("Dim lights" in a or "AC temperature" in a for a in analysis["sustainability_actions"])

# --- Endpoint Integration Tests using TestClient ---
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from main import app

client = TestClient(app)

def test_api_concessions():
    response = client.get("/api/food")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "name" in data[0]

def test_api_navigation_nodes():
    response = client.get("/api/navigation/nodes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "id" in data[0]

def test_api_calculate_route():
    payload = {
        "start_node": "gate_a",
        "end_node": "sec_101",
        "accessible_only": False
    }
    response = client.post("/api/navigation/route", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "coordinate_path" in data
    assert "voice_instructions" in data

def test_api_telemetry():
    response = client.get("/api/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert "match" in data
    assert "crowd" in data

def test_api_auth_flow():
    reg_payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "phone": "1234567890",
        "password": "testpassword123",
        "role": "Fan",
        "seat": "Sector 101, Row A, Seat 10",
        "parking": "Parking Lot B",
        "language": "English",
        "emergency_contact": "999999999",
        "medical_info": "None",
        "accessibility_requirement": "None"
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code in [201, 400]
    
    login_payload = {
        "email": "testuser@example.com",
        "password": "testpassword123"
    }
    login_response = client.post("/api/auth/login", json=login_payload)
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "testuser@example.com"

