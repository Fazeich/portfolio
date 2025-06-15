import { AdaptiveWrapper } from "../lib/styles";
import { AdaptiveTitle } from "./components/AdaptiveTitle";
import { AdaptiveDesktop } from "./components/AdaptiveDesktop";
import { IS_MOBILE } from "@/lib/constants";
import { AdaptiveMobile } from "./components/AdaptiveMobile";

export const Adaptive = () => {
  return (
    <AdaptiveWrapper>
      <AdaptiveTitle />

      {IS_MOBILE ? <AdaptiveMobile /> : <AdaptiveDesktop />}
    </AdaptiveWrapper>
  );
};
