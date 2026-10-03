import React, { useEffect, useState } from "react";

import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import { SearchTextField } from "../../../components/Table";
import Select from "../../../components/Select";

import { numberFormat, throttle } from "../../../helpers";

const MedicineQuantityDispensed = ({ module, consultationType }) => {
  const [params, setParams] = useState({
    consultation_type: "Pharmacy",
    status: "Served",
    q: undefined,
    report_period: "weekly",
  });

  useEffect(() => {
    document.title = `Medicine Quantity Dispensed Report - ${window.APP_NAME}`;
  }, []);

  const getReportPeriodTitle = () => {
    switch (params.report_period) {
      case "daily":
        return "Daily Report";
      case "weekly":
        return "Weekly Report";
      case "monthly":
        return "Monthly Report";
      case "yearly":
        return "Yearly Report";
      default:
        return "";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Medicine Center" },
        { title: "Reports" },
        { title: "Medicine Quantity Dispensed" },
      ]}
    >
      <Report
        title={`Medicine Quantity Dispensed Report - ${getReportPeriodTitle()}`}
        uri="api/patient-payment-cache-items"
        params={{ ...params, consultation_type: "Pharmacy" }}
        headerTrailingContent={
          <React.Fragment>
            <Select
              label="Report Period"
              options={[
                { id: "daily", name: "Daily" },
                { id: "weekly", name: "Weekly" },
                { id: "monthly", name: "Monthly" },
                { id: "yearly", name: "Yearly" },
              ]}
              optionsLabel="name"
              optionsValue="id"
              value={params.report_period}
              onChange={(value) =>
                setParams({ ...params, report_period: value })
              }
              sx={{ width: 150, mr: 2 }}
            />
            <SearchTextField
              placeholder="Search Medicine"
              onChange={(value) =>
                throttle(() => setParams({ ...params, q: value }), 1000)
              }
              sx={{ width: 200 }}
            />
          </React.Fragment>
        }
        columns={[
          {
            field: "id",
            headerName: "Item Number",
            valueGetter: (item, index) => item.item?.id,
          },
          {
            field: "name",
            headerName: "Medicine Name",
            valueGetter: (item, index) => item.item?.name,
          },
          {
            field: "code",
            headerName: "Medicine Code",
            valueGetter: (item, index) => item.item?.code || 'N/A',
          },
          {
            field: "quantity",
            headerName: "Quantity Dispensed",
            valueGetter: (item, index) => numberFormat(item.quantity || 0),
          },
          {
            field: "unit_price",
            headerName: "Unit Price",
            valueGetter: (item, index) => numberFormat(item.unit_price || 0),
          },
          {
            field: "total_amount",
            headerName: "Total Amount",
            valueGetter: (item, index) => numberFormat((item.unit_price || 0) * (item.quantity || 0)),
          },
          {
            field: "served_at",
            headerName: "Date Dispensed",
            valueGetter: (item, index) => item.served_at,
          },
          {
            field: "server",
            headerName: "Dispensed By",
            valueGetter: (item, index) => item.server?.full_name || 'N/A',
          },
        ]}
      />
    </Page>
  );
};

export default MedicineQuantityDispensed;
