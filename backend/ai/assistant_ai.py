import re
from typing import Dict, Any

def get_assistant_response(query: str, user_role: str, user_lang: str = "English") -> Dict[str, Any]:
    """
    Simulates Generative AI responses based on stadium context and role.
    """
    q = query.lower().strip()
    
    # Generic responses or keyword matching
    if re.search(r"\b(emergency|fire|hurt|injury|medical|doctor)\b", q):
        reply = (
            "⚠️ EMERGENCY DETECTED. I have raised a high-priority distress beacon. "
            "Medical responders and nearby volunteers have been notified. Please stay calm; assistance is on the way."
        )
        action = "trigger_medical"
    elif re.search(r"\b(lost|child|missing|find)\b", q):
        reply = (
            "🚨 LOST PERSON REPORT: Please provide the individual's FIFA ID, name, or last seen location. "
            "I am initiating a search across the stadium's local check-in registry and dispatching volunteers to patrol."
        )
        action = "lost_person_search"
    elif re.search(r"\b(food|eat|hungry|drink|water|concession|burgers?|pizzas?|tacos?)\b", q):

        reply = (
            "🍔 CONCESSIONS: The closest food court is Food Court 1 (near Gate B), which currently has a 4-minute wait time. "
            "They serve Vegetarian, Halal, and Vegan options. Would you like me to draw the route?"
        )
        action = "draw_route_food"
    elif re.search(r"\b(washroom|toilet|restroom|bathroom)\b", q):
        reply = (
            "🚻 RESTROOMS: The nearest restrooms are adjacent to Sector 104 and Gate A. "
            "Both contain wheelchair-accessible stalls. I can highlight the path on your dashboard."
        )
        action = "draw_route_washroom"
    elif re.search(r"\b(parking|car|park)\b", q):
        reply = (
            "🚗 PARKING: Lot A is currently 85% full. Lot C has the shortest exit queue. "
            "Please show your Digital Stadium Pass at the entry barrier."
        )
        action = "parking_info"
    elif re.search(r"\b(seat|ticket|where is my)\b", q):
        reply = (
            "🎫 SEAT LOCATOR: Check your Digital Wallet Pass. You are assigned to Sector 102, Row G, Seat 14. "
            "Please enter via Gate B for the fastest entry route."
        )
        action = "locate_seat"
    else:
        reply = (
            f"Hello! As your FIFA ONE AI Assistant ({user_role} portal), I am monitoring the stadium live. "
            "I can guide you to your seat, show accessible exit routes, place emergency alerts, or find nearby food. "
            "What can I assist you with?"
        )
        action = "general_chat"

    return {
        "reply": reply,
        "action": action,
        "language": user_lang,
        "model": "Local FIFA-ONE-LLM (Offline Core v1.4)"
    }
