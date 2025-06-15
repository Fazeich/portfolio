import { IS_MOBILE } from "@/lib/constants";
import { WindowsCloneWrapper } from "../lib/styles";
import { WindowsCloneTitle } from "./components/WindowsCloneTitle";
import { WindowsCloneDesktop } from "./components/WindowsCloneDesktop";
import { WindowsCloneMobile } from "./components/WindowsCloneMobile";

export const WindowsClone = () => {
  return (
    <WindowsCloneWrapper>
      <WindowsCloneTitle />
      {IS_MOBILE ? <WindowsCloneMobile /> : <WindowsCloneDesktop />}
    </WindowsCloneWrapper>
  );
};
