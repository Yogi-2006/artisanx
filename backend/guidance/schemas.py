from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class GuidanceStepSchema(BaseModel):
    id: str
    workflow_id: str
    step_order: int
    screen_name: Optional[str] = None
    target_id: Optional[str] = None
    gesture_type: Optional[str] = None
    instruction_en: Optional[str] = None
    instruction_ta: Optional[str] = None
    instruction_hi: Optional[str] = None
    instruction_te: Optional[str] = None
    instruction_kn: Optional[str] = None
    instruction_ml: Optional[str] = None
    instruction_bn: Optional[str] = None
    instruction_mr: Optional[str] = None
    instruction_ur: Optional[str] = None
    fallback_instruction_en: Optional[str] = None
    fallback_instruction_ta: Optional[str] = None
    fallback_instruction_hi: Optional[str] = None
    fallback_instruction_te: Optional[str] = None
    fallback_instruction_kn: Optional[str] = None
    fallback_instruction_ml: Optional[str] = None
    fallback_instruction_bn: Optional[str] = None
    fallback_instruction_mr: Optional[str] = None
    fallback_instruction_ur: Optional[str] = None
    expected_event: Optional[str] = None
    expected_condition: Optional[str] = None

class GuidanceWorkflowSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    target_role: Optional[str] = None
    is_active: bool
    steps: List[GuidanceStepSchema] = []

class StartGuidanceRequest(BaseModel):
    workflow_id: str

class StepCompleteRequest(BaseModel):
    workflow_id: str
    step_id: str

class WorkflowActionRequest(BaseModel):
    workflow_id: str

class GuidanceEventRequest(BaseModel):
    event_type: str
    workflow_id: str
    step_id: Optional[str] = None
    screen_name: Optional[str] = None
    target_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class GuidanceSettingsRequest(BaseModel):
    guidance_level: Optional[str] = None
    dont_show_again: Optional[bool] = None
    workflow_id: Optional[str] = None
