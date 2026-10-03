import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faUser,
  faMoneyBillWave,
  faTags,
  faCircleCheck,
  faStethoscope,
  faPills,
  faTooth,
  faArrowTrendDown,
  faUserPlus,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../components/Modal";
import { Header as PageHeader } from "../../components/Page";
import InfoCard from "./InfoCard";
import Filters from "./Filters";
import StockAlertsNotification from "../../components/StockAlertsNotification";
import ChartWrapper from "../../components/ChartWrapper";

import { colors, appTheme as theme } from "../../themes/app";
import { useFetch, useToast } from "../../hooks";
import {
  formatDateForDb,
  formatError,
  numberFormat,
  round,
  getWeekStartDate,
} from "../../helpers";

const Dashboard = ({ setSmsBalance = () => {} }) => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();

  const [params, setParams] = useState({
    clinic_id: undefined,
    start_date: getWeekStartDate(),
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/dashboard",
    {
      ...params,
      clinic: undefined,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data && setSmsBalance && typeof setSmsBalance === "function") {
      setSmsBalance(data.summary.sms_balance);
    }
  }, [data, setSmsBalance]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openFiltersModal = () => {
    const component = (
      <Filters
        modal={modalRef.current}
        params={params}
        setParams={setParams}
      />
    );
    modalRef.current.open("Filter", component, "sm");
  };

  const navigateToFinancialManagement = () => navigate("/financial-management/dashboard");
  const navigateToReception = () => navigate("/reception/dashboard");
  const navigateToConsultationRoom = () => navigate("/consultation-room/dashboard");
  const navigateToMedicineCenter = () => navigate("/medicine-center/medicines");
  const navigateToProcedureRoom = () => navigate("/procedure-room/dashboard");
  const navigateToPatientRecords = () => navigate("/patient-records/patients");

  return (
    <div>
      <PageHeader
        title="Dashboard"
        trailing={
          <button
            type="button"
            onClick={openFiltersModal}
            title="Show filters"
            aria-label="Show filters"
            className="btn btn-secondary btn-sm"
          >
            <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        }
      />

      {loading ? (
        <div className="h-1 w-full overflow-hidden rounded-full bg-mist-200 mb-4">
          <div className="h-full w-1/2 bg-azure-600 animate-progress" />
        </div>
      ) : null}

      {data && (
        <>
          <StockAlertsNotification />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 mb-6">
            <InfoCard
              title="Total Sales"
              count={numberFormat(data.summary.total_sales)}
              icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
              color={colors.purple[600]}
              onClick={navigateToFinancialManagement}
            />
            <InfoCard
              title="Expenses"
              count={numberFormat(data.summary.expenses)}
              icon={<FontAwesomeIcon icon={faArrowTrendDown} />}
              color={theme.palette.warning.main}
              onClick={navigateToFinancialManagement}
            />
            <InfoCard
              title="Net Profit"
              count={numberFormat(data.summary.total_sales - data.summary.expenses)}
              icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
              color={colors.cyan[500]}
              onClick={navigateToFinancialManagement}
            />
            <InfoCard
              title="Total Discount"
              count={numberFormat(data.summary.discount)}
              icon={<FontAwesomeIcon icon={faTags} />}
              color={colors.pink[400]}
              onClick={navigateToFinancialManagement}
            />
            <InfoCard
              title="Consultation"
              count={numberFormat(data.summary.consultation)}
              icon={<FontAwesomeIcon icon={faStethoscope} />}
              color={colors.green[400]}
              onClick={navigateToConsultationRoom}
            />
            <InfoCard
              title="Pharmacy"
              count={numberFormat(data.summary.pharmacy)}
              icon={<FontAwesomeIcon icon={faPills} />}
              color={colors.teal[400]}
              onClick={navigateToMedicineCenter}
            />
            <InfoCard
              title="Procedure"
              count={numberFormat(data.summary.procedure)}
              icon={<FontAwesomeIcon icon={faListCheck} />}
              color={colors.lime[600]}
              onClick={navigateToProcedureRoom}
            />
            <InfoCard
              title="Registered Patients"
              count={numberFormat(data.summary.new_patients)}
              icon={<FontAwesomeIcon icon={faUserPlus} />}
              color={theme.palette.warning.main}
              onClick={navigateToReception}
            />
            <InfoCard
              title="Total Patients"
              count={numberFormat(data.summary.patient_visits)}
              icon={<FontAwesomeIcon icon={faUser} />}
              color={colors.teal[400]}
              onClick={navigateToPatientRecords}
            />
            <InfoCard
              title="Consulted Patients"
              count={numberFormat(data.summary.consulted_patients)}
              icon={<FontAwesomeIcon icon={faCircleCheck} />}
              color={colors.green[500]}
              onClick={navigateToConsultationRoom}
            />
          </div>

          <div className="card mb-5">
                <h2 className="text-base font-semibold text-navy-900 mb-4">Sales by Category</h2>
                  <ChartWrapper
                    options={{
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        foreColor: theme.palette.text.primary,
                        background: "transparent",
                        toolbar: { show: false },
                      },
                      plotOptions: {
                        bar: {
                          borderRadius: 0, borderRadiusApplication: "end", borderRadiusWhenStacked: "last", distributed: true,
                        },
                      },
                      colors: [colors.purple[600], colors.teal[400], colors.orange[300], colors.cyan[300], colors.pink[300], colors.green[400]],
                      stroke: { show: false },
                      dataLabels: { enabled: false },
                      grid: { show: false, borderColor: theme.palette.divider },
                      xaxis: { axisBorder: { show: false, color: theme.palette.divider }, axisTicks: { show: true, color: theme.palette.divider, height: 6 } },
                      yaxis: { axisBorder: { show: false, color: theme.palette.divider }, axisTicks: { show: true, color: theme.palette.divider, width: 6 }, labels: { formatter: (val) => numberFormat(val) } },
                      tooltip: { theme: "dark", fillSeriesColor: true },
                      legend: { show: false },
                    }}
                    series={[{
                      name: "Sales",
                      data: [
                        { x: "Consultation", y: data.summary.consultation || 0 },
                        { x: "Pharmacy", y: data.summary.pharmacy || 0 },
                        { x: "Dental Lab", y: data.summary.dental_lab || 0 },
                        { x: "Procedure", y: data.summary.procedure || 0 },
                        { x: "Others", y: data.summary.others || 0 },
                      ],
                    }]}
                    type="bar"
                    height="300"
                  />
              </div>

          <div className="card mb-5">
                <h2 className="text-base font-semibold text-navy-900 mb-4">Sales vs Expenses</h2>
                  <ChartWrapper
                    options={{
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        foreColor: theme.palette.text.primary,
                        background: "transparent",
                        toolbar: { show: false },
                      },
                      plotOptions: { bar: { borderRadius: 8, borderRadiusApplication: "around", borderRadiusWhenStacked: "all" } },
                      colors: [colors.purple[400], theme.palette.warning.main],
                      stroke: { show: false },
                      dataLabels: { enabled: false },
                      grid: { show: false, borderColor: theme.palette.divider },
                      xaxis: { axisBorder: { show: false, color: theme.palette.divider }, axisTicks: { show: true, color: theme.palette.divider, height: 6 } },
                      yaxis: { axisBorder: { show: false, color: theme.palette.divider }, axisTicks: { show: true, color: theme.palette.divider, width: 6 }, labels: { formatter: (val) => numberFormat(val) } },
                      tooltip: { theme: "dark", fillSeriesColor: true },
                    }}
                    series={[
                      { name: "Sales", data: (data.statistics.yearly || []).map((e) => ({ x: e.month, y: e.statistics.find((f) => f.name === "total_sales")?.amount || 0 })) },
                      { name: "Expenses", data: (data.statistics.yearly || []).map((e) => ({ x: e.month, y: e.statistics.find((f) => f.name === "expenses")?.amount || 0 })) },
                    ]}
                    type="bar"
                    height="300"
                  />
              </div>

          <div className="card mb-5">
                <h2 className="text-base font-semibold text-navy-900 mb-4">Payments by Channel</h2>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics.payments_by_channel || []).map((e) => e.name),
                      chart: { fontFamily: theme.typography.fontFamily, background: "transparent", toolbar: { show: false } },
                      plotOptions: { pie: { dataLabels: { offset: -16 } } },
                      colors: [colors.teal[400], colors.red[400], colors.cyan[500], colors.green[500], colors.indigo[400], colors.purple[400], colors.lime[600], colors.pink[400], colors.yellow[500]],
                      stroke: { show: false, width: 3 },
                      dataLabels: { style: { fontSize: 10, fontWeight: 400 }, dropShadow: { enabled: false } },
                      tooltip: { y: { formatter: (val) => numberFormat(val) } },
                      legend: { position: "bottom", labels: { colors: (data.statistics.payments_by_channel || []).map(() => theme.palette.text.secondary), useSeriesColors: false }, markers: { width: 14, height: 8, radius: 4 } },
                    }}
                    series={(data.statistics.payments_by_channel || []).map((e) => e.amount)}
                    type="pie"
                    height={300}
                  />
              </div>

          <div className="card mb-5">
                <h2 className="text-base font-semibold text-navy-900 mb-4">Expenses by Category</h2>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics.expenses_by_category || []).map((e) => e.name),
                      chart: { fontFamily: theme.typography.fontFamily, background: "transparent", toolbar: { show: false } },
                      plotOptions: { pie: { dataLabels: { offset: -16 } } },
                      colors: [colors.teal[400], colors.red[400], colors.cyan[400], colors.deepOrange[300], colors.lime[600], colors.pink[400], colors.purple[400], colors.green[500], colors.yellow[500]],
                      stroke: { show: false, width: 3 },
                      dataLabels: { style: { fontSize: 10, fontWeight: 400 }, dropShadow: { enabled: false } },
                      tooltip: { y: { formatter: (val) => numberFormat(val) } },
                      legend: { position: "bottom", labels: { colors: (data.statistics.expenses_by_category || []).map(() => theme.palette.text.secondary), useSeriesColors: false }, markers: { width: 14, height: 8, radius: 4 } },
                    }}
                    series={(data.statistics.expenses_by_category || []).map((e) => e.amount)}
                    type="pie"
                    height={300}
                  />
              </div>

          <div className="card mb-5">
              <h2 className="text-base font-semibold text-navy-900 mb-4">Patient Registration</h2>
              <ChartWrapper
                options={{
                  chart: { fontFamily: theme.typography.fontFamily, foreColor: theme.palette.text.primary, background: "transparent", toolbar: { show: false } },
                  colors: [colors.teal[400], colors.pink[400], theme.palette.info.main],
                  stroke: { show: true, width: [3, 3, 3], curve: "smooth" },
                  dataLabels: { enabled: false },
                  grid: { show: false, borderColor: theme.palette.divider },
                  xaxis: { axisBorder: { show: false, color: theme.palette.divider }, axisTicks: { show: true, color: theme.palette.divider, height: 6 } },
                  yaxis: { axisBorder: { show: false, color: theme.palette.divider }, axisTicks: { show: true, color: theme.palette.divider, width: 6 }, labels: { formatter: (val) => numberFormat(val) } },
                  tooltip: { theme: "dark", fillSeriesColor: true },
                }}
                series={[
                  { name: "Male", data: (data.statistics.yearly || []).map((e) => ({ x: e.month, y: e.statistics.find((f) => f.name === "new_patients_male")?.amount || 0 })) },
                  { name: "Female", data: (data.statistics.yearly || []).map((e) => ({ x: e.month, y: e.statistics.find((f) => f.name === "new_patients_female")?.amount || 0 })) },
                  { name: "Total", data: (data.statistics.yearly || []).map((e) => ({ x: e.month, y: (e.statistics.find((f) => f.name === "new_patients_male")?.amount || 0) + (e.statistics.find((f) => f.name === "new_patients_female")?.amount || 0) })) },
                ]}
                type="line"
                height="300"
              />
          </div>

          <div className="card mb-5">
              <h2 className="text-base font-semibold text-navy-900 mb-4">Consultations by Item</h2>
              {(data.statistics.consultations_by_item || []).map((e, i, a) => (
                <ChartWrapper
                  key={e.id}
                  options={{
                    chart: { fontFamily: theme.typography.fontFamily, foreColor: theme.palette.text.primary, background: "transparent", stacked: true, sparkline: { enabled: true }, toolbar: { show: false } },
                    plotOptions: { bar: { horizontal: true, barHeight: 12, borderRadius: 6, borderRadiusApplication: "around", borderRadiusWhenStacked: "all", colors: { backgroundBarColors: [theme.palette.background.default], backgroundBarRadius: 6 } } },
                    title: { floating: true, offsetX: -8, offsetY: 6, text: e.name, style: { fontSize: 12, fontWeight: 400 } },
                    subtitle: { floating: true, align: "right", offsetX: 8, offsetY: 6, text: numberFormat(e.consultations), style: { fontSize: 12 } },
                    colors: [[colors.cyan[500], colors.pink[400], colors.teal[400], colors.green[500], colors.yellow[600]][i % 3]],
                    stroke: { show: false },
                    dataLabels: { enabled: false },
                    grid: { show: false },
                    xaxis: { axisBorder: { show: false }, axisTicks: { show: true, height: 6 } },
                    yaxis: { max: 100, axisBorder: { show: false }, axisTicks: { show: true, width: 6 } },
                    tooltip: { theme: "dark", fillSeriesColor: true },
                  }}
                  series={[{ name: "Percentage", data: [round((e.consultations / (a.reduce((acc, f) => acc + f.consultations, 0) || 1)) * 100, 2)] }]}
                  type="bar"
                  height="64"
                />
              ))}
          </div>

          <div className="card mb-5">
              <h2 className="text-base font-semibold text-navy-900 mb-4">Top Diagnosis</h2>
              {(data.statistics.top_diagnosis || []).map((e, i, a) => (
                <ChartWrapper
                  key={e.id}
                  options={{
                    chart: { fontFamily: theme.typography.fontFamily, foreColor: theme.palette.text.primary, background: "transparent", stacked: true, sparkline: { enabled: true }, toolbar: { show: false } },
                    plotOptions: { bar: { horizontal: true, barHeight: 12, borderRadius: 6, borderRadiusApplication: "around", borderRadiusWhenStacked: "all", colors: { backgroundBarColors: [theme.palette.background.default], backgroundBarRadius: 6 } } },
                    title: { floating: true, offsetX: -8, offsetY: 6, text: `${e.code} ${e.name}`.trim(), style: { fontSize: 12, fontWeight: 400 } },
                    subtitle: { floating: true, align: "right", offsetX: 8, offsetY: 6, text: numberFormat(e.consultations), style: { fontSize: 12 } },
                    colors: [[colors.teal[400], colors.purple[400], colors.cyan[500], colors.pink[400], colors.indigo[400], colors.lime[600], colors.green[500], colors.red[400], colors.yellow[600]][i % 9]],
                    stroke: { show: false },
                    dataLabels: { enabled: false },
                    grid: { show: false },
                    xaxis: { axisBorder: { show: false }, axisTicks: { show: true, height: 6 } },
                    yaxis: { max: 100, axisBorder: { show: false }, axisTicks: { show: true, width: 6 } },
                    tooltip: { theme: "dark", fillSeriesColor: true },
                  }}
                  series={[{ name: "Percentage", data: [round((e.consultations / (a.reduce((acc, f) => acc + f.consultations, 0) || 1)) * 100, 2)] }]}
                  type="bar"
                  height="64"
                />
              ))}
          </div>

          <Modal ref={modalRef} />
        </>
      )}
    </div>
  );
};

export default Dashboard;