import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import DispensingRequests from "./dispensing-requests/DispensingRequests";
import DispensingRequestItems from "./dispensing-requests/DispensingRequestItems";

const DispensingRoutes = ({ consultationType, stockItem }) => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path=""
        element={
          <DispensingRequests
            consultationType={consultationType}
            stockItem={stockItem}
          />
        }
      />
      <Route
        path=":patientId/:paymentCacheId"
        element={
          <DispensingRequestItems
            consultationType={consultationType}
            stockItem={stockItem}
          />
        }
      />
      <Route
        path="reports/*"
        element={<div>Reports coming soon</div>}
      />
    </Routes>
  );
};

export default DispensingRoutes;
