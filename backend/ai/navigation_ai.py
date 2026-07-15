import heapq
from typing import Dict, List, Tuple, Optional

def solve_dijkstra(
    nodes: Dict[str, dict], # id: {x, y, label, node_type}
    edges: List[dict],      # [{start, end, weight, accessible}]
    start: str,
    end: str,
    accessible_only: bool = False,
    congested_sectors: Optional[Dict[str, float]] = None # sector/node_id: density_percentage
) -> Tuple[List[str], float, List[str]]:
    """
    Returns (path_of_nodes, path_weight, dynamic_audio_instructions)
    """
    if start not in nodes or end not in nodes:
        return [], float('inf'), ["Error: Start or destination not in stadium map."]

    # Build adjacency list
    adj = {nid: [] for nid in nodes}
    for e in edges:
        u, v, w, acc = e["start"], e["end"], e["weight"], e["accessible"]
        
        # If accessible routes requested, skip non-accessible edges
        if accessible_only and not acc:
            continue
            
        # Dynamically scale weight based on congestion if active
        weight_u = w
        weight_v = w
        if congested_sectors:
            # If the destination sector is highly congested (>80%), penalize heavily
            density_u = congested_sectors.get(u, 0.0)
            density_v = congested_sectors.get(v, 0.0)
            if density_u > 80.0:
                weight_u *= 5.0 # avoid
            elif density_u > 50.0:
                weight_u *= 1.8
                
            if density_v > 80.0:
                weight_v *= 5.0
            elif density_v > 50.0:
                weight_v *= 1.8

        adj[u].append((v, weight_u))
        adj[v].append((u, weight_v)) # undirected graph

    # Heap elements: (distance, current_node, path)
    pq = [(0.0, start, [start])]
    visited = set()

    while pq:
        dist, current, path = heapq.heappop(pq)

        if current == end:
            # Generate voice instructions
            instructions = []
            for i in range(len(path) - 1):
                n1, n2 = path[i], path[i+1]
                label1 = nodes[n1]["label"]
                label2 = nodes[n2]["label"]
                dir_word = "proceed to"
                if nodes[n2]["node_type"] == "washroom":
                    dir_word = "head towards washrooms at"
                elif nodes[n2]["node_type"] == "food":
                    dir_word = "walk to concession stand at"
                elif nodes[n2]["node_type"] == "medical":
                    dir_word = "urgently proceed to medical aid station at"
                instructions.append(f"From {label1}, {dir_word} {label2}.")
            instructions.append(f"You have arrived at {nodes[end]['label']}.")
            return path, dist, instructions

        if current in visited:
            continue
        visited.add(current)

        for neighbor, weight in adj[current]:
            if neighbor not in visited:
                heapq.heappush(pq, (dist + weight, neighbor, path + [neighbor]))

    return [], float('inf'), ["No accessible or clear path could be found. Please contact nearest steward."]
