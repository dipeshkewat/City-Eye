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


def generate_defect_analysis_with_gemini(
    image_path: str,
    problem_type: str,
    severity_label: str,
    severity_score: float,
    confidence: float,
    location_name: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Analyzes an infrastructure defect image using Google Gemini Multimodal API.
    Returns structured incident report metadata, or None if unavailable/fails.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        return None

    try:
        import google.generativeai as genai
    except ImportError:
        logger.warning("[!] google-generativeai package not installed. Skipping Gemini analysis.")
        return None

    try:
        genai.configure(api_key=api_key)
        model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        model = genai.GenerativeModel(model_name)

        # Prepare multimodal image input
        pil_image = None
        if os.path.exists(image_path):
            try:
                pil_image = Image.open(image_path)
            except Exception as img_err:
                logger.warning(f"[!] Could not open image for Gemini: {img_err}")

        prompt = f"""You are the senior municipal AI infrastructure inspection analyst for CityEye (Municipal Corporation).
Analyze this CCTV surveillance frame and defect metadata:
- Detected Defect: {problem_type.upper()}
- Severity Rating: {severity_label.upper()} (Score: {severity_score}/100)
- AI Detection Confidence: {confidence * 100:.1f}%
- Camera Location: {location_name or 'City Road Network'}

Produce an official municipal incident report. Output ONLY a valid JSON object matching this schema without markdown fences:
{{
  "title": "Concise official incident title (max 75 characters)",
  "description": "Comprehensive engineering assessment detailing physical defect dimensions, structural degradation, immediate hazard to two-wheelers and pedestrians, potential monsoon/traffic disruption, and field observations.",
  "citizen_summary": "Clear, reassuring 1-2 sentence status summary for the citizen transparency portal.",
  "recommended_department": "Exact department name: 'Road Maintenance & Infrastructure (PWD)', 'Solid Waste Management Department', or 'Stormwater & Drainage Department'",
  "urgency": "Low, Medium, High, or Critical",
  "remediation_recommendation": "Technical field instructions for the dispatched work crew (e.g. cold-mix bitumen patching, drain clearance, hydraulic skip loader)."
}}"""

        content = [prompt]
        if pil_image:
            content.append(pil_image)

        response = model.generate_content(
            content,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2,
            )
        )

        raw_text = response.text.strip()
        # Clean potential markdown wrapping if present
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        data = json.loads(raw_text)
        data["generation_source"] = "gemini"
        data["model_used"] = model_name
        print(f"[*] CityEye Gemini analysis successfully generated: {data.get('title')}")
        return data

    except Exception as e:
        print(f"[*] Note: Gemini API analysis unavailable ({e}). Using deterministic template fallback.")
        return None
