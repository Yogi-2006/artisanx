import { create } from 'zustand';
import { GuidanceStep } from '../types/guidance';

interface GuidanceState {
    activeWorkflowId: string | null;
    currentStep: GuidanceStep | null;
    startGuide: (workflowId: string) => void;
    stopGuide: () => void;
}

export const useGuidanceStore = create<GuidanceState>((set) => ({
    activeWorkflowId: null,
    currentStep: null,
    startGuide: (workflowId) => set({ activeWorkflowId: workflowId }),
    stopGuide: () => set({ activeWorkflowId: null, currentStep: null }),
}));
