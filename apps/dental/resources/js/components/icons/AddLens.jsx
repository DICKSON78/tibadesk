import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlassPlus } from "@fortawesome/free-solid-svg-icons";

const AddLens = ({ className = "w-5 h-5", ...rest }) => (
  <FontAwesomeIcon icon={faMagnifyingGlassPlus} className={className} {...rest} />
);

export default AddLens;
