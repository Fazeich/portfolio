import { StyledInfoIcon, TitleWrapper } from "@/lib/styles";
import Paragraph from "@/shared/Paragraph";
import { Tooltip } from "antd";
import { TooltipWrapper } from "../../lib/styles";

export const AdaptiveTitle = () => {
  return (
    <TitleWrapper>
      <Paragraph text="Адаптация всего и вся" weight={900} size={48} />
      <Tooltip
        title={
          <TooltipWrapper>
            <Paragraph
              text="А тут у нас блок с адаптивностью"
              type="additional"
            />
            <Paragraph text="Развлекайся :)" type="additional" />
          </TooltipWrapper>
        }
      >
        <StyledInfoIcon />
      </Tooltip>
    </TitleWrapper>
  );
};
