from .schemas import GuidanceStepResponse

def get_current_step() -> GuidanceStepResponse:
    return GuidanceStepResponse()
