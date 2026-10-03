import React from "react";
import { View } from "@react-pdf/renderer";

const Grid = ({ columns, containerStyle, itemStyle, children }) => {
  columns = columns || 3;

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        ...containerStyle,
      }}
    >
      {children.map((e, i) => (
        <View
          key={i}
          style={{
            width: `${100 / columns}%`,
            marginVertical: 2,
            ...itemStyle,
          }}
        >
          {e}
        </View>
      ))}
    </View>
  );
};

export default Grid;
