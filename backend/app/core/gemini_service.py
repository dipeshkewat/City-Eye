"""
CityEye Google Gemini Generative AI Service
Provides multimodal defect analysis, engineering damage reports, and citizen-friendly summaries.
Gracefully falls back to local deterministic templates if offline or if no GEMINI_API_KEY is configured.
"""

import os
import json
import logging
from typing import Optional, Dict, Any
from PIL import Image

from app.core.config import settings

logger = logging.getLogger("cityeye.gemini")

def get_gemini_api_key() -> Optional[str]:
    """Retrieve Gemini API key from settings or environment."""
    key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
    if key and key.strip() and not key.startswith("your-") and len(key.strip()) > 10:
        return key.strip()
    return None


def classify_and_analyze_with_gemini(
    image_path: str,
    location_name: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Multimodal Visual AI Arbiter:
    Inspects the street/road image directly using Google Gemini Vision,
    accurately determines whether the primary problem is a pothole, garbage dump, or waterlogging,
    and returns a structured incident assessment with plain-language summaries.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        return None

    try:
        import google.generativeai as genai
    except ImportError:
        logger.warning("[!] google-generativeai package not installed.")
        return None

    try:
        genai.configure(api_key=api_key)
        preferred_model = settings.GEMINI_MODEL or "gemini-2.5-flash"

        if not os.path.exists(image_path):
            return None

        pil_image = Image.open(image_path)

        prompt = f"""You are the expert municipal computer vision inspector for CityEye (Municipal Surveillance System).
Carefully analyze this street/infrastructure image. Identify the SINGLE primary civic defect shown.
Classify it strictly as one of:
1. "pothole" - Hole, crater, asphalt crack, or cavity in the road surface.
2. "garbage" - Scattered solid waste, trash pile, plastic litter, or roadside dump.
3. "waterlogging" - Standing water pool, flooded roadway, submerged curb/gutter, or stagnant rainwater puddle.

Output ONLY valid JSON without markdown wrapping:
{{
  "primary_defect": "pothole" or "garbage" or "waterlogging",
  "confidence": 0.95,
  "title": "Concise official incident title (e.g. 'Active Pothole Hazard on Road Surface')",
  "description": "Comprehensive engineering assessment detailing physical defect dimensions, structural degradation, immediate hazard to two-wheelers and pedestrians, potential monsoon/traffic disruption, and field observations. Make it clear and structured.",
  "citizen_summary": "Plain-English, easy-to-understand 2-3 sentence summary explaining what the issue is, the potential safety impact on everyday road users or pedestrians, and that the municipal department has been notified for repair.",
  "recommended_department": "Road Maintenance & Infrastructure (PWD)" or "Solid Waste Management Department" or "Stormwater & Drainage Department",
  "severity_label": "low" or "medium" or "high" or "critical",
  "severity_score": 85.0
}}"""

        response = None
        model_used = None
        for m_name in [preferred_model, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                model = genai.GenerativeModel(m_name)
                response = model.generate_content([prompt, pil_image], generation_config={'temperature': 0.1})
                model_used = m_name
                break
            except Exception as m_err:
                logger.info(f"Model {m_name} attempt note: {m_err}")
                continue

        if not response:
            return None

        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        data = json.loads(raw_text)
        
        # Normalize problem type
        raw_type = str(data.get("primary_defect", "")).lower()
        if "water" in raw_type or "flood" in raw_type or "drain" in raw_type or "puddle" in raw_type:
            data["problem_type"] = "waterlogging"
            data["recommended_department"] = "Stormwater & Drainage Department"
        elif "garbage" in raw_type or "trash" in raw_type or "waste" in raw_type or "dump" in raw_type:
            data["problem_type"] = "garbage"
            data["recommended_department"] = "Solid Waste Management Department"
        else:
            data["problem_type"] = "pothole"
            data["recommended_department"] = "Road Maintenance & Infrastructure (PWD)"

        data["generation_source"] = "gemini"
        data["model_used"] = model_used
        print(f"[*] CityEye Gemini Multimodal Visual Classification: {data['problem_type'].upper()} ({data.get('confidence', 0.95)*100:.1f}%)")
        return data

    except Exception as e:
        print(f"[*] Gemini visual classification note ({e}). Continuing to computer vision pipeline.")
        return None
