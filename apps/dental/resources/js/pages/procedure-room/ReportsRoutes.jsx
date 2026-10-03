import React from "react";
import { Route, Routes } from "react-router-dom";
import PatientItems from "../reports/PatientItems";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/served-procedures"
        element={
          <PatientItems
            module="Procedure Room"
            title="Served Procedures Report"
            consultationType="Procedure"
            status="Served"
          />
        }
      />
      <Route
        path="/pending-procedures"
        element={
          <PatientItems
            module="Procedure Room"
            title="Pending Procedures Report"
            consultationType="Procedure"
            status="Pending,Paid,Billed"
          />
        }
      />
    </Routes>
  );
};

export default ReportsRoutes;
