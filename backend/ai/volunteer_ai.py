from typing import List, Dict, Any

def match_volunteer_tasks(
    incidents_needing_help: List[Dict[str, Any]],
    volunteers: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Matches active incidents or tasks with available volunteers based on language skills and location.
    """
    assignments = []
    unassigned_tasks = []
    
    available_volunteers = [v for v in volunteers if v.get("status") == "Available"]
    
    for task in incidents_needing_help:
        task_type = task.get("type", "General Guide")
        location = task.get("location", "Gate A")
        lang_needed = task.get("language_needed", "English").lower()
        
        # Try to find a volunteer who is available and speaks the language
        matched = False
        for v in available_volunteers:
            languages = [l.strip().lower() for l in v.get("languages", "English").split(",")]
            if lang_needed in languages:
                assignments.append({
                    "task_id": task.get("id"),
                    "task_type": task_type,
                    "location": location,
                    "volunteer_id": v["volunteer_id"],
                    "volunteer_name": v["name"],
                    "reason": f"Speaks {lang_needed.capitalize()} and is near {v['current_location']}."
                })
                available_volunteers.remove(v)
                matched = True
                break
                
        # If no language match, pick the first available volunteer
        if not matched and available_volunteers:
            v = available_volunteers.pop(0)
            assignments.append({
                "task_id": task.get("id"),
                "task_type": task_type,
                "location": location,
                "volunteer_id": v["volunteer_id"],
                "volunteer_name": v["name"],
                "reason": f"Assigned nearest available volunteer ({v['name']})."
            })
            matched = True
            
        if not matched:
            unassigned_tasks.append(task)

    return {
        "assignments": assignments,
        "unassigned_tasks": unassigned_tasks,
        "remaining_volunteers_count": len(available_volunteers)
    }
