"""
Telehandler Safety Engine — Concert & Festival Production
Processes operational inputs and returns safety status with domain-specific reasoning.
"""
from dataclasses import dataclass
from typing import Optional
import math

# Ground-type derating multipliers per concert/festival environment
GROUND_DERATE = {
    "CONCRETE": 1.0,
    "ASPHALT": 1.0,
    "GRAVEL": 0.95,
    "FESTIVAL_MUD": 0.70,
    "STAGE_DECK": 0.85,
    "GRASS": 0.80,
    "DYNAMIC_TRUSS": 0.75,
    "LED_WALL": 0.65,
}

@dataclass
class SafetyResult:
    status: str
    reasoning: str
    derated_capacity_lbs: float = 0.0
    estimated_impact_force_lbs: Optional[float] = None

class TelehandlerSafetyEngine:
    """Evaluates operational conditions for concert/festival telehandler operations."""

    def evaluate(self, *,
                 load_weight_lbs: float,
                 ground_type: str = "CONCRETE",
                 wind_speed_mph: float = 0.0,
                 rigging_zone_clear: bool = True,
                 stop_command_used: str = "",
                 command_echoed: bool = False,
                 pushers_present: int = 0,
                 pushers_cleared_halo_zone: bool = True,
                 boom_angle_degrees: float = 0.0,
                 lift_height_ft: float = 0.0,
                 reach_ft: float = 0.0,
                 time_of_day_hrs: int = 12,
                 shift_duration_hrs: float = 0.0
                 ) -> SafetyResult:

        base_capacity_lbs = 10_000.0

        # PHASE 1: BLOCKER CHECKS
        if not rigging_zone_clear:
            fall_height = max(lift_height_ft, 60.0)
            impact_force = self._calc_falling_object_impact(weight_lbs=2.0, drop_height_ft=fall_height)
            return SafetyResult(
                status="BLOCKER",
                reasoning=f"Rigging zone NOT clear. Overhead hazard confirmed (est. {impact_force:.0f} lb impact force from typical rig height). STOP operations until cleared.",
                estimated_impact_force_lbs=impact_force,
            )

        if stop_command_used.upper() != "STOP":
            return SafetyResult(
                status="BLOCKER",
                reasoning=f"Invalid command received: '{stop_command_used}'. Standard lexicon requires 'STOP'. Do not proceed.",
            )

        if not command_echoed:
            return SafetyResult(
                status="BLOCKER",
                reasoning="'STOP' was NOT echoed by riggers/ground crew. Confirmation required before proceeding.",
            )

        # PHASE 2: HARD_STOP CHECKS
        if wind_speed_mph > 15.0:
            return SafetyResult(
                status="HARD_STOP",
                reasoning=f"Wind speed {wind_speed_mph:.1f} mph exceeds 15 mph safety threshold. Tip-over risk with elevated load.",
            )

        ground_derate = GROUND_DERATE.get(ground_type.upper(), 0.7)
        fatigue_derate = self._calc_fatigue_modifier(time_of_day_hrs, shift_duration_hrs)
        reach_derate = max(1.0 - (reach_ft / 25.0), 0.5)

        final_capacity = base_capacity_lbs * ground_derate * fatigue_derate * reach_derate
        final_capacity = max(final_capacity, 100.0)

        if load_weight_lbs > final_capacity:
            return SafetyResult(
                status="HARD_STOP",
                reasoning=f"Load {load_weight_lbs:.0f} lbs exceeds derated capacity {final_capacity:.0f} lbs. Reduce load or shorten reach.",
                derated_capacity_lbs=final_capacity,
            )

        # PHASE 3: CAUTION CHECKS
        if pushers_present > 0 and not pushers_cleared_halo_zone:
            return SafetyResult(
                status="CAUTION",
                reasoning=f"Pushers ({pushers_present}) detected in 3-ft halo zone. Hold movement until clear.",
                derated_capacity_lbs=final_capacity,
            )

        if pushers_present > 0:
            return SafetyResult(
                status="CAUTION",
                reasoning=f"Ground crew ({pushers_present}) on load. Maintain slow speed.",
                derated_capacity_lbs=final_capacity,
            )

        # PHASE 4: GO
        return SafetyResult(
            status="GO",
            reasoning="All safety checks passed. Maintain Up-Look protocol and 'STOP' readiness.",
            derated_capacity_lbs=final_capacity,
        )

    @staticmethod
    def _calc_falling_object_impact(weight_lbs: float, drop_height_ft: float) -> float:
        g = 32.2
        velocity = math.sqrt(2 * g * drop_height_ft)
        mass = weight_lbs / g
        return mass * velocity

    @staticmethod
    def _calc_fatigue_modifier(time_of_day_hrs: int, shift_duration_hrs: float) -> float:
        modifier = 1.0
        if 23 <= time_of_day_hrs or 0 <= time_of_day_hrs < 7:
            modifier *= 0.95
        if shift_duration_hrs > 12:
            modifier *= max(0.8, 1.0 - (shift_duration_hrs - 12) * 0.05)
        elif shift_duration_hrs > 10:
            modifier *= 0.90
        return modifier


if __name__ == "__main__":
    engine = TelehandlerSafetyEngine()
    r = engine.evaluate(load_weight_lbs=5000, rigging_zone_clear=False)
    print(f"Test Rigging: {r.status} | {r.reasoning}")
    
    r2 = engine.evaluate(load_weight_lbs=4200, wind_speed_mph=18)
    print(f"Test Wind: {r2.status} | {r2.reasoning}")