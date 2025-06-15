import Contacts from "@/components/Contacts";
import Introduce from "@/components/Introduce";
import Welcome from "@/components/Welcome";
import { PageWrapper } from "@/lib/styles";
import { $main } from "@/stores/main/main";
import { useUnit } from "effector-react";

export const Main = () => {
  const { isVisibleHeader } = useUnit($main);

  return (
    <PageWrapper isVisibleHeader={isVisibleHeader}>
      <Welcome />
      <Introduce />
      <Contacts />
    </PageWrapper>
  );
};
