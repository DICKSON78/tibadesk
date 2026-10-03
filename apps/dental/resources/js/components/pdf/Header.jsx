import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

const Header = ({ fixed, title, subtitle, dense }) => {
  const getAddressLine = () => {
    let contacts = ["Sarah Dental Clinic"];

    if (window.user.clinic.address) {
      contacts.push(window.user.clinic.address);
    }
    if (window.user.clinic.phone) {
      contacts.push("Phone: " + window.user.clinic.phone);
    }
    if (window.user.clinic.email) {
      contacts.push("Email: " + window.user.clinic.email);
    }

    return contacts.join("\n");
  };

  return (
    <View
      fixed={fixed}
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
        borderTop: "1pt solid #004D40",
        borderBottom: "1pt solid #E65100",
        marginBottom: 16,
        ...(dense && {
          flexDirection: "column",
          marginBottom: 8,
        }),
      }}
    >
      <View style={{ width: 112 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", fontFamily: "Custom" }}>
          <Text style={{ color: "#009688" }}>Sarah Dental</Text>
          <Text style={{ color: "#f44336" }}>{`\nClinic`}</Text>
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.text,
            {
              fontSize: 12,
              fontWeight: "bold",
              textTransform: "uppercase",
              textAlign: "center",
              ...(dense && {
                fontSize: 8,
              }),
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.text,
              {
                fontSize: 10,
                fontWeight: "bold",
                textTransform: "uppercase",
                textAlign: "center",
                ...(dense && {
                  fontSize: 7,
                  paddingVertical: 4,
                }),
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
        {dense ? (
          <Text
            style={[
              styles.text,
              {
                marginTop: 4,
                textAlign: "center",
              },
            ]}
          >
            {`${getAddressLine()}`}
          </Text>
        ) : null}
      </View>
      {!dense ? (
        <View style={{ width: 112 }}>
          <Text
            style={[
              styles.text,
              {
                fontStyle: "italic",
              },
            ]}
          >
            {`${getAddressLine()}`}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 7,
    fontFamily: "Custom",
  },
});

export default Header;
