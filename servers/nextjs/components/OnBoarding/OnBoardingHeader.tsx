import React from 'react'
import { MixpanelEvent, trackEvent } from '@/utils/mixpanel'

const STEPS = ["Text Provider", "Image Provider", "Web Search", "Finish Setup"];

const OnBoardingHeader = ({
    currentStep,
    providerStep,
    setStep,
    setProviderStep,
}: {
    currentStep: number,
    providerStep: number,
    setStep: (step: number) => void,
    setProviderStep: (step: number) => void,
}) => {
    const activeStep = currentStep === 3 ? 4 : providerStep;

    const goToStep = (target: number) => {
        if (target >= activeStep) return;
        trackEvent(MixpanelEvent.Onboarding_Back_Clicked, {
            from_step_number: activeStep,
            to_step_number: target,
            source: "progress_header",
        });
        setProviderStep(target);
        setStep(2);
    };

    return (
        <div className='pai-fall sticky top-6 z-20 mb-12 mt-6 flex items-center justify-end'>
            <div className='glass-pill flex items-center gap-1 px-2 py-1.5'>
                {STEPS.map((label, index) => {
                    const number = index + 1;
                    return (
                        <React.Fragment key={label}>
                            {index > 0 && <div className='mx-1 h-px w-4 bg-black/10' />}
                            <button
                                type="button"
                                onClick={() => goToStep(number)}
                                className={`flex items-center gap-1 ${number < activeStep ? "cursor-pointer" : "cursor-default"}`}
                            >
                                <div className={`${activeStep === number ? 'bg-black text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,.8)]' : number < activeStep ? 'bg-black/10 text-black' : 'border border-black/10 text-black/50'} flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all`}>
                                    {number}
                                </div>
                                <p className={`hidden pr-1 text-xs xl:block ${activeStep === number ? 'font-medium text-black' : 'text-black/55'}`}>{label}</p>
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    )
}

export default OnBoardingHeader
