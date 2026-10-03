import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const Heart = ({ className = "w-5 h-5", ...rest }) => (
  <FontAwesomeIcon icon={faHeart} className={`${className} text-[#cc0000]`} {...rest} />
);

export default Heart;
