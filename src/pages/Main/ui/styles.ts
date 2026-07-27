import styled from "styled-components";

export const StepWrapper = styled.div<{ step: number }>`
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
