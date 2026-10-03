import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const Menu = ({ className = "w-6 h-6", ...rest }) => (
  <FontAwesomeIcon icon={faBars} className={className} {...rest} />
);

export default Menu;
