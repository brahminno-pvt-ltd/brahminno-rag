import re

INJECTION_PATTERNS = [
    r"ignore (all |previous )?instructions",
    r"you are now",
    r"pretend (you are|to be)",
    r"disregard (your|all)",
    r"system prompt",
    r"jailbreak",
]

def sanitize_query(query: str) -> str:
    lower = query.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lower):
            return "[Prompt injection detected. Please ask a genuine question about your documents.]"
    return query[:2000]
