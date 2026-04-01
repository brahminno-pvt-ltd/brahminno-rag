# LangChain 0.3+: memory is managed manually via message history
from langchain_core.messages import HumanMessage, AIMessage

_histories: dict[str, list] = {}

def get_history(session_id: str) -> list:
    if session_id not in _histories:
        _histories[session_id] = []
    return _histories[session_id]

def add_exchange(session_id: str, human: str, ai: str, max_turns: int = 10):
    history = get_history(session_id)
    history.append(HumanMessage(content=human))
    history.append(AIMessage(content=ai))
    # Keep only last max_turns exchanges (2 messages each)
    if len(history) > max_turns * 2:
        _histories[session_id] = history[-(max_turns * 2):]

def reset_memory(session_id: str):
    _histories.pop(session_id, None)
