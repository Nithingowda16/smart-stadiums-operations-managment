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
