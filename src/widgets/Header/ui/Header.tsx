import { useEffect, useRef } from "react";
import { HeaderWrapper, NavLink } from "../lib/styles";
import { PAGES } from "@/lib/router";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_ROUTE, IS_MOBILE } from "@/lib/constants";
import { useUnit } from "effector-react";
import { $main, changeMain } from "@/stores/main/main";

export const Header = () => {
  const navigate = useNavigate();
  const currentRoute = useLocation()?.pathname?.replace(BASE_ROUTE, "");
  const { isVisibleHeader } = useUnit($main);

  return (
    <HeaderWrapper isVisibleHeader={isVisibleHeader}>
      {PAGES.map((page) => (
        <NavLink
          key={page.id}
          text={page.name}
          onClick={() => navigate(`${BASE_ROUTE}${page.link}`)}
          size={24}
          active={Boolean(currentRoute === page.link)}
        />
      ))}
    </HeaderWrapper>
  );
};
