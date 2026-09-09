"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import OnBoardingSlidebar from "./OnBoarding/OnBoardingSlidebar";
import OnBoardingHeader from "./OnBoarding/OnBoardingHeader";
import PresentonMode from "./OnBoarding/PresentonMode";
import FinalStep from "./OnBoarding/FinalStep";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<number>(2)
  const [providerStep, setProviderStep] = useState<number>(1)
  const config = useSelector((state: RootState) => state.userConfig);

  const canChangeKeys = config.can_change_keys;

  useEffect(() => {
    if (!canChangeKeys) {
      router.push("/upload");
    }
  }, [canChangeKeys, router]);

  if (!canChangeKeys) {
    return null;
  }

  return (

    <div className="pai-canvas relative flex min-h-screen">
      <OnBoardingSlidebar step={step} />
      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-6 md:pl-14 md:pr-8">

        <OnBoardingHeader currentStep={step} providerStep={providerStep} setStep={setStep} setProviderStep={setProviderStep} />
        {step === 2 && <PresentonMode providerStep={providerStep} setStep={setStep} setProviderStep={setProviderStep} />}
        {step === 3 && <FinalStep />}
      </main>
    </div>
  );
}
