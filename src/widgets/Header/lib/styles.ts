import Paragraph from "@/shared/Paragraph";
import styled from "styled-components";

export const HeaderWrapper = styled.div<{ isVisibleHeader: boolean }>`
  width: 100%;

  overflow-x: auto;

  transition: height 0.25s ease-in-out;

  height: ${({ isVisibleHeader }) => (isVisibleHeader ? "75px" : "0px")};

  position: sticky;
  top: 0;

  z-index: 10;

  background-color: ${({ theme }) => theme.primary.background};

  box-shadow: 0 0 5px 1px #5f5f5f;

  padding: 0 20px;

  display: flex;
  align-items: center;
  gap: 10px;
`;

export const NavLink = styled(Paragraph)<{ active: boolean }>`
  cursor: pointer;

  height: fit-content;
  width: fit-content;

  color: ${({ active, theme }) =>
    active ? theme.primary.link : theme.primary.text};

  &:hover {
    color: ${({ theme }) => theme.primary.link};
  }

  transition: color 0.25s ease-in-out;
`;
