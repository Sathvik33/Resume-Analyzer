import json
import re
import logging
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from prompt_template import RESUME_ANALYZER_PROMPT

logger = logging.getLogger(__name__)


def get_llm():
    """Initialize the Ollama LLM with Qwen 2.5."""
    return ChatOllama(
        model="qwen2.5:7b",
        temperature=0.1,
        num_predict=4096,
    )


def build_chain():
    """Build the LangChain analysis chain."""
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert resume analyzer. You MUST respond with ONLY valid JSON. No explanations, no markdown, just the JSON object."),
        ("human", RESUME_ANALYZER_PROMPT),
    ])
    chain = prompt | llm
    return chain


def extract_json(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown code blocks."""
    logger.info(f"Raw LLM response (first 500 chars): {text[:500]}")

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try finding JSON object boundaries
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            pass

    raise ValueError(f"Could not extract valid JSON from LLM response. Response starts with: {text[:200]}")


async def analyze_resume(jd_text: str, resume_text: str) -> dict:
    """Run the resume analysis chain and return structured JSON."""
    logger.info("Starting resume analysis...")
    chain = build_chain()

    logger.info("Invoking LLM chain...")
    response = await chain.ainvoke({
        "jd_text": jd_text,
        "resume_text": resume_text,
    })

    logger.info(f"LLM response type: {type(response)}")
    logger.info(f"LLM response content length: {len(response.content)}")

    result = extract_json(response.content)
    logger.info(f"Successfully parsed JSON with keys: {list(result.keys())}")

    # Ensure all required keys exist with defaults
    defaults = {
        "match_score": 0,
        "summary": "",
        "jd_analysis": {
            "required_skills": [],
            "tools_technologies": [],
            "experience_level": "",
            "responsibilities": []
        },
        "resume_analysis": {
            "present_skills": [],
            "missing_skills": [],
            "partial_matches": [],
            "irrelevant_sections": []
        },
        "gap_analysis": [],
        "improvements": {
            "skills_to_add": [],
            "projects_to_add": [],
            "keywords_to_add": [],
            "resume_tips": []
        },
        "optimized_bullets": [],
        "template_suggestions": {
            "recommended_format": "modern",
            "reason": ""
        }
    }

    for key, default_val in defaults.items():
        if key not in result:
            result[key] = default_val
        elif isinstance(default_val, dict):
            for sub_key, sub_default in default_val.items():
                if sub_key not in result[key]:
                    result[key][sub_key] = sub_default

    return result

