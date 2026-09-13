import { useEffect, useCallback, useRef } from 'react';
import { useGuidanceStore } from '../stores/guidanceStore';
import type { GuidanceStep } from '../types/guidance';

export function useGuidance() {
    const store = useGuidanceStore();
    const eventListenerCleanup = useRef<(() => void) | null>(null);

    // Derived State
    const steps = store.currentWorkflow?.steps || [];
    const totalSteps = steps.length;
    const currentStep: GuidanceStep | null = totalSteps > 0 ? steps[store.currentStepIndex] : null;
    const canGoNext = store.currentStepIndex < totalSteps - 1;
    const canGoPrevious = store.currentStepIndex > 0;
    const progressPercentage = totalSteps > 0 ? ((store.currentStepIndex) / (totalSteps - 1)) * 100 : 0;

    const findTargetElement = useCallback((targetId: string): DOMRect | null => {
        const el = document.querySelector(`[data-guide-id="${targetId}"]`);
        if (el) {
            return el.getBoundingClientRect();
        }
        return null;
    }, []);

    const scrollToTarget = useCallback((targetId: string) => {
        const el = document.querySelector(`[data-guide-id="${targetId}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
    }, []);

    const waitForElement = useCallback((targetId: string, timeout = 3000): Promise<Element | null> => {
        return new Promise((resolve) => {
            const el = document.querySelector(`[data-guide-id="${targetId}"]`);
            if (el) {
                return resolve(el);
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(`[data-guide-id="${targetId}"]`);
                if (element) {
                    resolve(element);
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    }, []);

    // Cleanup event listeners
    const clearEventObservation = useCallback(() => {
        if (eventListenerCleanup.current) {
            eventListenerCleanup.current();
            eventListenerCleanup.current = null;
        }
    }, []);

    const observeEvent = useCallback((expectedEvent: string) => {
        clearEventObservation();

        const handler = () => {
            // Auto advance when event occurs
            if (useGuidanceStore.getState().isActive && useGuidanceStore.getState().status === 'active') {
                useGuidanceStore.getState().nextStep();
            }
        };

        window.addEventListener(expectedEvent, handler);

        eventListenerCleanup.current = () => {
            window.removeEventListener(expectedEvent, handler);
        };
    }, [clearEventObservation]);

    // Automatically clean up observation when step changes or guide stops
    useEffect(() => {
        return () => clearEventObservation();
    }, [currentStep?.id, store.isActive, clearEventObservation]);

    // Set up auto-advance observation if current step has an expected event
    useEffect(() => {
        if (store.isActive && store.status === 'active' && currentStep?.expected_event) {
            observeEvent(currentStep.expected_event);
        }
    }, [store.isActive, store.status, currentStep, observeEvent]);

    return {
        ...store,
        currentStep,
        totalSteps,
        canGoNext,
        canGoPrevious,
        progressPercentage,
        findTargetElement,
        scrollToTarget,
        waitForElement,
        observeEvent
    };
}
