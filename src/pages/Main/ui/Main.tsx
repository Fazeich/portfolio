import React, { useState, useEffect } from "react";
import Contacts from "@/components/Contacts";
import Introduce from "@/components/Introduce";
import Welcome from "@/components/Welcome";
import { PageWrapper } from "@/lib/styles";
import { changeMain } from "@/stores/main/main";
import { useUnit } from "effector-react";
import { StepWrapper } from "./styles";

export const Main = () => {
  const dispatchChangeMain = useUnit(changeMain);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 2) {
      dispatchChangeMain({ isVisibleHeader: true });
    }
  }, [step, dispatchChangeMain]);

  return (
    <PageWrapper>
      {step === 0 && (
        <StepWrapper step={0}>
          <Welcome />
        </StepWrapper>
      )}
      {step === 1 && (
        <StepWrapper step={1}>
          <Introduce />
        </StepWrapper>
      )}
      {step === 2 && (
        <StepWrapper step={2}>
          <Contacts />
        </StepWrapper>
      )}
    </PageWrapper>
  );
};
