import { PageWrapper } from "@/lib/styles";
import { $main } from "@/stores/main/main";
import { useUnit } from "effector-react";

export const Landings = () => {
  const { isVisibleHeader } = useUnit($main);

  return <PageWrapper isVisibleHeader={isVisibleHeader}>Landings</PageWrapper>;
};
