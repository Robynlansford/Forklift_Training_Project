"""
Tour-Ready Telehandler Safety Training — optional CLI trainer.

The demo product is the Next.js app in tourready-operator/ (npm run dev →
http://localhost:3000). This CLI covers a small subset of modules for
offline terminals. It does not replace the web curriculum.
"""

import os

# Interactive questions for a subset of modules. Remaining markdown files
# can still be read in this CLI — they are not "coming soon."
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
    "capstone_scenario.md": [
        {
            "q": "What is the correct first action when approaching a rigging zone?",
            "options": ["A. Drive straight in", "B. Perform an Up-Look scan", "C. Honk the horn loudly"],
            "answer": "B",
            "feedback": "Correct! Always do the Up-Look first."
        }
    ]
}

MODULES = [
    "Module_0_Basic_Telehandler_Forklift_Controls.md",
    "Module_1_Fork_Pocket_Logistics.md",
    "Module_2_Fork_Slot_Anatomy.md",
    "Module_3_Ground_Crew_Choreography.md",
    "Module_4_Heavy_Physics_Venue_Dynamics.md",
    "Module_5_Night_Chaos.md",
    "module_6_rigging.md",
    "Module_7_Fatigue_Pressure.md",
    "capstone_scenario.md",
]


def main():
    print("\n" + "=" * 70)
    print("   TOUR-READY TELEHANDLER SAFETY TRAINING")
    print("   CLI subset — full platform: tourready-operator/ (localhost:3000)")
    print("=" * 70)
    print("Choose a module. Modules without quiz items open as a briefing.\n")

    for i, m in enumerate(MODULES, 1):
        label = m.replace(".md", "").replace("_", " ")
        kind = "quiz" if m in QUESTIONS else "briefing"
        print(f"{i}. {label}  [{kind}]")

    print(f"{len(MODULES) + 1}. Exit")

    choice = input("\nEnter choice: ").strip()
    if choice.isdigit() and 1 <= int(choice) <= len(MODULES):
        run_interactive_module(MODULES[int(choice) - 1])
    else:
        print("Goodbye. Stay safe out there.")


def print_briefing(module_name):
    if not os.path.isfile(module_name):
        print(f"Briefing file not found: {module_name}")
        print("Use the TourReady Operator web app for the full curriculum.")
        return
    print("\n--- Briefing (read-only) ---\n")
    with open(module_name, encoding="utf-8") as f:
        print(f.read())
    print("\n--- End briefing ---")
    print("Free-text scenarios for this module live in the web trainer.")


def run_interactive_module(module_name):
    print(f"\n=== Training: {module_name.replace('.md', '').replace('_', ' ')} ===")

    if module_name in QUESTIONS:
        for q in QUESTIONS[module_name]:
            print("\n" + q["q"])
            for opt in q["options"]:
                print(opt)
            answer = input("\nYour answer (A/B/C): ").strip().upper()

            if answer == q["answer"]:
                print("Correct.")
            else:
                print("Not quite.")
            print(q["feedback"])
            input("\nPress Enter to continue...")
    else:
        print_briefing(module_name)

    input("\nModule complete. Press Enter to return to menu...")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTraining ended. Stay safe.")
