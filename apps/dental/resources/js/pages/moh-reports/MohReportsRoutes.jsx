import React from "react";
import { Route, Routes } from "react-router-dom";
import MonthlyOPDReport from "./MonthlyOPDReport";
import PharmaceuticalConsumption from "./PharmaceuticalConsumption";
import RevenueSummary from "./RevenueSummary";
import IPDReport from "./IPDReport";
import CancerReport from "./CancerReport";
import BirthDeathNotification from "./BirthDeathNotification";

const MohReportsRoutes = () => {
  return (
    <Routes>
      <Route path="/monthly-opd" element={<MonthlyOPDReport />} />
      <Route path="/pharmaceutical-consumption" element={<PharmaceuticalConsumption />} />
      <Route path="/revenue-summary" element={<RevenueSummary />} />
      <Route path="/ipd-report" element={<IPDReport />} />
      <Route path="/cancer-report" element={<CancerReport />} />
      <Route path="/birth-death-notification" element={<BirthDeathNotification />} />
    </Routes>
  );
};

export default MohReportsRoutes;
