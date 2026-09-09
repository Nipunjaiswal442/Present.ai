import React from 'react'
import Wordmark from '@/components/pai/Wordmark'

const OnBoardingSlidebar = ({ step }: { step: number }) => {
    return (
        <div className={`${step === 3 ? "bg-transparent" : "glass"} pai-fall relative m-3 mr-0 hidden w-[280px] shrink-0 overflow-hidden rounded-[28px] md:block`}>
            <div className="sticky top-8 px-7 pt-7">
                <Wordmark href="/" />
                <p className="pai-eyebrow mt-10">Setup</p>
                <p className="mt-2 text-[15px] leading-relaxed text-black/55">
                    Connect a text model, choose how images are made, and you are ready to present.
                </p>
            </div>
            {step !== 3 && (
                <svg aria-hidden className="pointer-events-none absolute -right-24 bottom-0 opacity-70" xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420" fill="none">
                    {[60, 110, 160, 210].map((r) => (
                        <circle key={r} cx="210" cy="260" r={r} stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
                    ))}
                </svg>
            )}
        </div>
    )
}

export default OnBoardingSlidebar
