export interface GuidanceStep {
    id: string;
    workflow_id: string;
    step_order: number;
    target_id: string;
    gesture_type: string;
    instruction_en: string;
    instruction_ur: string;
}
