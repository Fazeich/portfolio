import { WelcomeWrapper } from "../lib/styles";
import Paragraph from "@/shared/Paragraph";
import { IS_MOBILE } from "@/lib/constants";

export const Welcome = () => {
  return (
    <WelcomeWrapper>
      <Paragraph
        className="smooth_text"
        text="Привет!"
        style={{
          fontSize: IS_MOBILE ? "15vw" : "10vw",
        }}
        weight={500}
      />
    </WelcomeWrapper>
  );
};
