import sys
import os
import traceback

# Add current folder to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

print("=" * 60)
print("FIFA ONE AI: BACKEND TELEMETRY DIAGNOSTIC UTILITY")
print("=" * 60)

modules = [
    ("database", "database"),
    ("models", "models"),
    ("auth", "auth"),
    ("ai.navigation_ai", "navigation_ai"),
    ("ai.assistant_ai", "assistant_ai"),
    ("ai.multilingual_ai", "multilingual_ai"),
    ("ai.sustainability_ai", "sustainability_ai"),
    ("ai.decision_engine", "decision_engine"),
    ("simulation.runner", "simulation runner"),
    ("main", "main entrypoint")
]

failures = 0
for mod_path, label in modules:
    print(f"Testing {label} [{mod_path}]...")
    try:
        __import__(mod_path)
        print(f"  --> SUCCESS")
    except Exception as e:
        print(f"  --> [ERROR] Failed to load {label}:")
        traceback.print_exc(file=sys.stdout)
        failures += 1
        print("-" * 40)

print("=" * 60)
if failures == 0:
    print("DIAGNOSTICS PASSED! Your backend code is 100% syntactically correct.")
    print("You can run 'uvicorn main:app --reload' within the backend directory.")
else:
    print(f"DIAGNOSTICS FAILED with {failures} import error(s). Please check tracebacks above.")
print("=" * 60)
input("\nPress Enter to exit...")
