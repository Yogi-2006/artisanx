from pydantic import BaseModel
from typing import Optional, Literal

class GuidanceStepResponse(BaseModel):
    instruction_en: Optional[str] = None
    instruction_ta: Optional[str] = None
    instruction_hi: Optional[str] = None
    instruction_te: Optional[str] = None
    instruction_kn: Optional[str] = None
    instruction_ml: Optional[str] = None
    instruction_bn: Optional[str] = None
    instruction_mr: Optional[str] = None
    instruction_ur: Optional[str] = None
