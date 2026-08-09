"""AI engine constants and configuration.

Placeholder values for the AI outfit engine pipeline. All values are
tunable and intended to be moved to runtime configuration when backends
are wired in.
"""

# ── Embedding ──
EMBEDDING_DIMENSIONS = 1024
EMBEDDING_MODEL_NAME = "BAAI/bge-m3"

# ── Similarity ──
SIMILARITY_THRESHOLD = 0.65
MAX_VECTOR_SEARCH_RESULTS = 50

# ── Outfit generation ──
MAX_CANDIDATES_PER_SLOT = 15
MAX_COMBINATIONS = 5000
MAX_OUTFITS_RETURNED = 10

# ── Scoring weights ──
WEIGHT_COLOUR_HARMONY = 0.25
WEIGHT_STYLE_COMPATIBILITY = 0.20
WEIGHT_SEASON_FIT = 0.15
WEIGHT_OCCASION_FIT = 0.15
WEIGHT_CONFIDENCE = 0.10
WEIGHT_COMPLETENESS = 0.10
WEIGHT_SIMILARITY = 0.05

# ── Weather ──
WEATHER_CONDITIONS = {
    "clear": {"temperature": "warm", "precipitation": "none"},
    "cloudy": {"temperature": "mild", "precipitation": "none"},
    "rain": {"temperature": "cool", "precipitation": "rain"},
    "snow": {"temperature": "cold", "precipitation": "snow"},
    "hot": {"temperature": "hot", "precipitation": "none"},
}

# ── Seasons ──
SEASONS = ["spring", "summer", "fall", "winter"]

SEASON_TEMPERATURE_RANGES = {
    "spring": {"min": 10, "max": 20},
    "summer": {"min": 20, "max": 40},
    "fall": {"min": 5, "max": 18},
    "winter": {"min": -10, "max": 10},
}

# ── Occasions ──
OCCASIONS = ["casual", "business", "formal", "sporty", "party", "date", "beach", "travel"]

# ── LLM ──
LLM_MODEL_NAME = "placeholder-llm-model"
LLM_TEMPERATURE = 0.7
LLM_MAX_TOKENS = 2048

# ── Pipeline ──
PIPELINE_TIMEOUT_SECONDS = 30.0
MAX_RETRIES = 2
