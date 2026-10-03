import React from "react";
import { Text, View } from "@react-pdf/renderer";

const Footer = ({ textStyle, ...rest }) => {
  return (
    <View
      fixed
      style={{
        position: "absolute",
        width: "100%",
        bottom: 10,
        marginHorizontal: 24,
      }}
    >
      <Text
        {...rest}
        style={{
          fontSize: 7,
          fontFamily: "Custom",
          textAlign: "center",
          color: "grey",
          ...textStyle,
        }}
      />
    </View>
  );
};

export default Footer;
