import React, { useState, useEffect } from "react";
import Contacts from "@/components/Contacts";
import Introduce from "@/components/Introduce";
import Welcome from "@/components/Welcome";
import { PageWrapper } from "@/lib/styles";
import { $main, changeMain } from "@/stores/main/main";
import { useUnit } from "effector-react";
import styled from "styled-components";

const StepWrapper = styled.div<{ step: number }>`
  width: 100%;
  height: 100%;

  ${({ step }) =>
    step < 2
      ? `
      animation: fadeInOut 4s ease-in-out forwards;
      @keyframes fadeInOut {
        0% { opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; }
      }
    `
      : `
      animation: fadeIn 4s ease-in-out forwards;
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    `}
`;

export const Main = () => {
  const { isVisibleHeader } = useUnit($main);
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

  useEffect(() => {
    dispatchChangeMain({ isVisibleHeader: false });
  }, []);

  return (
    <PageWrapper isVisibleHeader={isVisibleHeader}>
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
