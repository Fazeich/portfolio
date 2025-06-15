import { uniqueId } from "lodash";

import { IPage } from "./types";

import Main from "@/pages/Main";
import Interactive from "@/pages/Interactive";
import Landings from "@/pages/Landings";

export const PAGES: IPage[] = [
  {
    id: uniqueId(),
    component: <Main />,
    name: "Главная",
    link: "/",
  },
  {
    id: uniqueId(),
    component: <Interactive />,
    name: "Интерактивность",
    link: "/interactive",
  },
  // {
  //   id: uniqueId(),
  //   component: <Landings />,
  //   name: "Ленденги",
  //   link: "/landings",
  // },
];
