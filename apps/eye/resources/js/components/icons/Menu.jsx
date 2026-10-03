import React from "react";
import { createSvgIcon } from "@mui/material";

const Menu = createSvgIcon(
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6H20M4 12H12M4 18H20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.5"
    />
  </svg>,
  "Menu"
);

export default Menu;
