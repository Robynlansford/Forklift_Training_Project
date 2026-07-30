"""
Tour-Ready Telehandler Safety Training Agent
Interactive Learning Mode - Questions + Immediate Feedback
"""

import json
import os
import sys
from telehandler_engine import TelehandlerSafetyEngine, GROUND_DERATE

PROGRESS_FILE = "progress.json"

# Simple interactive questions for each module (expandable)
QUESTIONS = {
    "Module_0_Basic_Telehandler_Forklift_Controls.md": [
        {
            "q": "Which side should you always approach the forklift from?",
            "options": ["A. Right side", "B. Left side", "C. Either side"],
            "answer": "B",
            "feedback": "Correct! Always approach from the left side for safety."
        },
        {
            "q": "What should you do with the forks before driving with a load?",
            "options": ["A. Keep them high", "B. Keep them low and tilted slightly back", "C. Keep them fully tilted forward"],
            "answer": "B",
            "feedback": "Correct. Low load + slight back tilt is the safe way to travel."
        }
    ],
    # Add more questions for other modules as needed...
    "capstone_scenario.md": [
        {
            "q": "What is the correct first action when approaching a rigging zone?",
            "options": ["A. Drive straight in", "B. Perform an Up-Look scan", "C. Honk the horn loudly"],
            "answer": "B",
            "feedback": "Correct! Always do the Up-Look first."
        }
    ]
}

def main():
    print("\n" + "="*70)
    print("   TOUR-READY TELEHANDLER SAFETY TRAINING")
    print("   Interactive Learning Mode")
    print("="*70)
    print("Choose a module to train interactively.\n")

    # For now, list available modules (you can expand this)
    modules = ["Module_0_Basic_Telehandler_Forklift_Controls.md", "Module_1_Fork_Pocket_Logistics.md", 
               "Module_3_Ground_Crew_Choreography.md", "capstone_scenario.md"]
    
    for i, m in enumerate(modules, 1):
        print(f"{i}. {m.replace('.md', '').replace('_', ' ')}")
    
    print(f"{len(modules)+1}. Exit")

    choice = input("\nEnter choice: ").strip()
    if choice.isdigit() and 1 <= int(choice) <= len(modules):
        mod = modules[int(choice)-1]
        run_interactive_module(mod)
    else:
        print("Goodbye. Stay safe out there.")

def run_interactive_module(module_name):
    print(f"\n=== Training: {module_name.replace('.md', '').replace('_', ' ')} ===")
    
    if module_name in QUESTIONS:
        for q in QUESTIONS[module_name]:
            print("\n" + q["q"])
            for opt in q["options"]:
                print(opt)
            answer = input("\nYour answer (A/B/C): ").strip().upper()
            
            if answer == q["answer"]:
                print("✅ Correct!")
            else:
                print("❌ Not quite.")
            print(q["feedback"])
            input("\nPress Enter to continue...")
    else:
        print("This module is currently informational. Full interactive questions coming soon.")
    
    input("\nModule complete. Press Enter to return to menu...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTraining ended. Stay safe.")