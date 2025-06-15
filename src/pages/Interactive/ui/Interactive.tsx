import Adaptive from "@/components/Adaptive";
// import ButtonWar from "@/components/ButtonWar";
import WindowsClone from "@/components/WindowsClone";
import { PageWrapper } from "@/lib/styles";
import { $main } from "@/stores/main/main";
import { useUnit } from "effector-react";

export const Interactive = () => {
  const { isVisibleHeader } = useUnit($main);

  return (
    <PageWrapper isVisibleHeader={isVisibleHeader}>
      {/* <ButtonWar /> */}

      <WindowsClone />

      <Adaptive />
    </PageWrapper>
  );
};
