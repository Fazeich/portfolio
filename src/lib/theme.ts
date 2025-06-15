export interface ITheme {
  primary: IThemeSection;
  secondary: IThemeSection;
  accent: IThemeSection;
  additional: IThemeSection;
}

export interface IThemeSection {
  text: string;
  background: string;
  link: string;
}

export const LIGHT_THEME: ITheme = {
  primary: {
    text: "#000000",
    background: "#faf9e1",
    link: "#969696",
  },
  secondary: {
    text: "#969696",
    background: "#fffddd",
    link: "",
  },
  accent: {
    text: "#17a2b8",
    background: "#faf6e1",
    link: "",
  },
  additional: {
    text: "#ffffff",
    background: "#fffde0",
    link: "",
  },
};
