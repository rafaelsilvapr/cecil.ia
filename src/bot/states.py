from enum import Enum, auto

class BotState(Enum):
    WAITING_FOR_PDF = auto()
    PROCESSING_PDF = auto()
    REVIEWING_SCRIPT = auto()
    WAITING_FOR_NARRATION_CHOICE = auto()
    WAITING_FOR_VOICE_UPLOAD = auto()
    GENERATING_VIDEO = auto()
