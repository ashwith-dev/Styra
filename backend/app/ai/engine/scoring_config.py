"""Scoring weight configuration for the outfit scoring engine.

All weights are tunable and sum to 1.0. No hardcoded values in engine logic.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ScoringWeights:
    """Weights for each scoring dimension in the outfit scorer."""

    season_match: float = 0.12
    weather_match: float = 0.12
    occasion_match: float = 0.12
    color_harmony: float = 0.15
    style_compatibility: float = 0.13
    material_compatibility: float = 0.08
    embedding_similarity: float = 0.10
    completeness: float = 0.08
    confidence: float = 0.05
    missing_data_penalty: float = 0.05


DEFAULT_WEIGHTS = ScoringWeights()

# ── Builder limits ──
# Hard cap on scored combinations per request. Combined with the builder's
# round-robin seed expansion, 2000 combos cover every seed core with room
# to spare while keeping scoring time within the latency budget.
MAX_COMBINATIONS = 2000
MAX_CANDIDATES_PER_SLOT = 15

# ── Return limits ──
DEFAULT_TOP_N = 5
MAX_TOP_N = 20

# ── Diversity / sampling ──
# Size of the top-scored pool the fallback sampler picks from when the
# LLM stylist is unavailable.
FALLBACK_SAMPLE_TOP_K = 3
# Hard deadline for a Gemini stylist call. On timeout the endpoint
# falls back to weighted sampling so requests never hang on a slow LLM.
STYLIST_TIMEOUT_SECONDS = 12.0
# Weight floor so every candidate in the pool stays selectable even with
# a near-zero score.
MIN_SAMPLE_WEIGHT = 0.05
# How many of the user's most recently generated outfits are
# deprioritised so consecutive requests surface fresh combinations.
RECENT_OUTFIT_EXCLUDE_COUNT = 5
