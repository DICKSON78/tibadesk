import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNotificationContext } from "../contexts/NotificationContext";

import {
  faAddressCard as JobTitlesIconDef,
  faAddressBook as ClinicDetailsIconDef,
  faCircleCheck as DoneIconDef,
  faChevronDown as ExpandLessIconDef,
  faChevronRight as ExpandMoreIconDef,
  faUsers as PeopleIconDef,
  faHouse as HomeIconDef,
  faHourglassHalf as WaitingIconDef,
  faCircleInfo as InfoIconDef,
  faBoxesStacked as ItemsIconDef,
  faBox as InventoryIconDef,
  faLightbulb as IdeaDevelopmentIconDef,
  faBook as ReportsIconDef,
  faBullhorn as OutreachProgrammesIconDef,
  faHospital as ClinicsIconDef,
  faMagnifyingGlassLocation as MarketResearchIconDef,
  faUserGear as UserManagementIconDef,
  faPills as MedicineIconDef,
  faComment as MessageIconDef,
  faMoneyBill as PaymentModesIconDef,
  faCreditCard as PaymentChannelsIconDef,
  faBug as DiseasesIconDef,
  faPhoneVolume as CommunicationLogsIconDef,
  faCalendarDay as PatientsToReturnIconDef,
  faPaperPlane as MarketingStrategiesIconDef,
  faGear as SettingsIconDef,
  faStar as VipIconDef,
  faListCheck as DailyActivitiesIconDef,
  faStopwatch as WaitingTimeIconDef,
  faArrowTrendDown as ExpensesIconDef,
  faTriangleExclamation as WarningIconDef,
  faTableColumns as DepartmentsIconDef,
  faHandshake as CollaboratorsIconDef,
  faPlus as AddIconDef,
} from "@fortawesome/free-solid-svg-icons";

const iconProps = { className: "w-[18px] h-[18px] shrink-0" };

const makeIcon = (icon) => {
  const Component = ({ className = "" }) => (
    <FontAwesomeIcon
      icon={icon}
      className={`${iconProps.className} ${className}`.trim()}
    />
  );
  Component.displayName = icon.iconName;
  return Component;
};

const AddIcon = makeIcon(AddIconDef);
const JobTitlesIcon = makeIcon(JobTitlesIconDef);
const ClinicDetailsIcon = makeIcon(ClinicDetailsIconDef);
const DoneIcon = makeIcon(DoneIconDef);
const ExpandLessIcon = makeIcon(ExpandLessIconDef);
const ExpandMoreIcon = makeIcon(ExpandMoreIconDef);
const PeopleIcon = makeIcon(PeopleIconDef);
const HomeIcon = makeIcon(HomeIconDef);
const WaitingIcon = makeIcon(WaitingIconDef);
const InfoIcon = makeIcon(InfoIconDef);
const ItemsIcon = makeIcon(ItemsIconDef);
const InventoryIcon = makeIcon(InventoryIconDef);
const IdeaDevelopmentIcon = makeIcon(IdeaDevelopmentIconDef);
const ReportsIcon = makeIcon(ReportsIconDef);
const OutreachProgrammesIcon = makeIcon(OutreachProgrammesIconDef);
const ClinicsIcon = makeIcon(ClinicsIconDef);
const MarketResearchIcon = makeIcon(MarketResearchIconDef);
const UserManagementIcon = makeIcon(UserManagementIconDef);
const MedicineIcon = makeIcon(MedicineIconDef);
const MessageIcon = makeIcon(MessageIconDef);
const PaymentModesIcon = makeIcon(PaymentModesIconDef);
const PaymentChannelsIcon = makeIcon(PaymentChannelsIconDef);
const DiseasesIcon = makeIcon(DiseasesIconDef);
const CommunicationLogsIcon = makeIcon(CommunicationLogsIconDef);
const PatientsToReturnIcon = makeIcon(PatientsToReturnIconDef);
const MarketingStrategiesIcon = makeIcon(MarketingStrategiesIconDef);
const SettingsIcon = makeIcon(SettingsIconDef);
const VipIcon = makeIcon(VipIconDef);
const DailyActivitiesIcon = makeIcon(DailyActivitiesIconDef);
const WaitingTimeIcon = makeIcon(WaitingTimeIconDef);
const ExpensesIcon = makeIcon(ExpensesIconDef);
const WarningIcon = makeIcon(WarningIconDef);
const DepartmentsIcon = makeIcon(DepartmentsIconDef);
const CollaboratorsIcon = makeIcon(CollaboratorsIconDef);


const SingleLevelMenuItem = ({ item, setDrawerOpen, location, navigate }) => {
  const isSelected = () => {
    if (location.pathname === item.to) {
      return true;
    }

    if (location.pathname.indexOf(item.to) === 0) {
      const nextChars = location.pathname.substring(item.to.length);
      if (/^\/.+/.test(nextChars)) {
        return true;
      }
    }

    return false;
  };

  if (item.subheader) {
    return <div className="sidebar-section">{item.title}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => {
        navigate(item.to);
        if (typeof setDrawerOpen === "function") {
          setDrawerOpen(false);
        }
      }}
      className={`sidebar-link w-full text-left ${isSelected() ? "sidebar-link-active" : ""}`}
    >
      {item.icon ? <span className="w-9 flex justify-center">{item.icon}</span> : null}
      <span className="truncate">{item.title}</span>
      {item.badge > 0 ? (
        <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      ) : null}
    </button>
  );
};

const MultiLevelMenuItem = ({ item, location, generateMenuTree }) => {
  const [open, setOpen] = useState(false);
  const isActive = location.pathname.indexOf(item.to) === 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`sidebar-link w-full text-left ${isActive ? "sidebar-link-active" : ""}`}
      >
        {item.icon ? <span className="w-9 flex justify-center">{item.icon}</span> : null}
        <span className="truncate">{item.title}</span>
        {item.badge > 0 ? (
          <span className="ml-auto mr-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
        <FontAwesomeIcon
          icon={open ? ExpandLessIconDef : ExpandMoreIconDef}
          className="w-3.5 h-3.5 ml-auto shrink-0"
        />
      </button>

      {open ? (
        <div className="pl-2 mt-1 space-y-0.5 animate-fadeIn">
          {generateMenuTree(item.items)}
        </div>
      ) : null}
    </div>
  );
};

const Menu = ({ drawerOpen, setDrawerOpen, user, ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  // Use NotificationContext for stable sidebar badges
  const { notifications, loading: notificationsLoading } = useNotificationContext();

  // Debug notifications
  useEffect(() => {
    console.log('Menu - Notifications:', notifications);
    console.log('Menu - Notifications Loading:', notificationsLoading);
    if (notifications) {
      console.log('VIP Patients:', notifications.vip_patients);
      console.log('Patients Sent to Cashier:', notifications.patients_sent_to_cashier);
      console.log('Dispensing Requests:', notifications.dispensing_requests);
    }
  }, [notifications, notificationsLoading]);

  const renumberTopSections = (list) => {
    let counter = 0;
    return list.map((item) => {
      if (
        item?.subheader &&
        item?.title !== "MENU" &&
        typeof item.show === "boolean" &&
        item.show
      ) {
        const baseTitle = (item.title || "").replace(/^\d+\.\s*/, "");
        counter += 1;
        return { ...item, title: `${counter}. ${baseTitle}` };
      }
      return item;
    });
  };

  useEffect(() => {
    if (user) {
      setItems(renumberTopSections([
        {
          title: "MENU",
          subheader: true,
          show: true,
        },
        {
          title: "Dashboard",
          icon: <HomeIcon />,
          to: "/dashboard",
          show: user.privileges.dashboard,
        },
        {
          title: "Patient Records",
          icon: <ReportsIcon />,
          to: "/patient-records/patients",
          show: user.privileges.reception || user.privileges.consultation_room,
        },
        {
          title: "1. RECEPTION",
          subheader: true,
          show: user.privileges.reception,
        },
        {
          title: "Patients/Customers",
          icon: <PeopleIcon />,
          to: "/reception/patients",
          show: user.privileges.reception,
        },
        {
          title: "VIP Patients",
          icon: <VipIcon />,
          to: "/reception/vip-patients",
          badge: Number(notifications?.vip_patients) || 0,
          show: user.privileges.reception,
        },
        {
          title: "Patient Waiting Time",
          icon: <WaitingTimeIcon />,
          to: "/reception/patient-waiting-time",
          show: user.privileges.reception,
        },
        {
          title: "Patients to Return",
          icon: <PatientsToReturnIcon />,
          to: "/reception/to-return/patients",
          badge: Number(notifications?.patients_to_return) || 0,
          show: user.privileges.reception,
        },
        {
          title: "Sent Messages",
          icon: <MessageIcon />,
          to: "/reception/sent-messages",
          show: user.privileges.reception,
        },
        {
          title: "Reception Dashboard",
          icon: <HomeIcon />,
          to: "/reception/dashboard",
          show: user.privileges.reception,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/reception/reports",
          show: user.privileges.reception,
          items: [
            {
              title: "Patient Registration Report",
              icon: <ReportsIcon />,
              to: "/reception/reports/patient-registration",
              show: user.privileges.reception,
            },
          ],
        },
        {
          title: "2. PAYMENT CENTER",
          subheader: true,
          show: user.privileges.payment_center,
        },
        {
          title: "Payment Center Dashboard",
          icon: <HomeIcon />,
          to: "/payment-center/dashboard",
          show: user.privileges.payment_center,
        },
        {
          title: "Patients Sent to Cashier",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-cash-patients",
          badge: Number(notifications?.patients_sent_to_cashier) || 0,
          show: user.privileges.payment_center,
        },
        {
          title: "Credit Patients Approval",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-credit-patients",
          badge: Number(notifications?.credit_patients_approval) || 0,
          show: user.privileges.payment_center,
        },
        {
          title: "Pending Patient Bills",
          icon: <WaitingIcon />,
          to: "/payment-center/patient-bills/pending",
          show: user.privileges.payment_center,
        },
        {
          title: "Installment Management",
          icon: <PaymentModesIcon />,
          to: "/payment-center/installment-management",
          show: user.privileges.payment_center,
          items: [
            {
              title: "Partial Payments",
              icon: <WaitingIcon />,
              to: "/payment-center/installment-management/partial-payments",
              show: user.privileges.payment_center,
            },
            {
              title: "Completed Payments",
              icon: <DoneIcon />,
              to: "/payment-center/installment-management/completed-payments",
              show: user.privileges.payment_center,
            },
          ],
        },
        {
          title: "Cleared Patient Bills",
          icon: <DoneIcon />,
          to: "/payment-center/patient-bills/cleared",
          show: user.privileges.payment_center,
        },
        {
          title: "NHIF Claims",
          icon: <ReportsIcon />,
          to: "/nhif-claims",
          show: user.privileges.payment_center,
        },
        {
          title: "Expenses",
          icon: <ExpensesIcon />,
          to: "/payment-center/expenses",
          show: user.privileges.payment_center,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/payment-center/reports",
          show: user.privileges.payment_center,
          items: [
            {
              title: "Daily Cash Collection Report",
              icon: <ReportsIcon />,
              to: "/payment-center/reports/daily-cash-collection",
              show: user.privileges.payment_center,
            },
            {
              title: "Daily Credit Collection Report",
              icon: <ReportsIcon />,
              to: "/payment-center/reports/daily-credit-collection",
              show: user.privileges.payment_center,
            },
            {
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/payment-center/reports/expenses",
              show: user.privileges.payment_center,
            },
        {
          title: "Partner Frame Payments",
          icon: <ReportsIcon />,
          to: "/payment-center/reports/partner-frame-payments",
          show: false,
        },
          ],
        },
        {
          title: "3. CONSULTATION ROOM",
          subheader: true,
          show: user.privileges.consultation_room,
        },
        {
          title: "Consultation Room Dashboard",
          icon: <HomeIcon />,
          to: "/consultation-room/dashboard",
          show: user.privileges.consultation_room,
        },
        {
          title: "Patients Sent to Doctor",
          icon: <WaitingIcon />,
          to: "/consultation-room/consultation-patients/pending",
          badge: Number(notifications?.patients_sent_to_doctor) || 0,
          show: user.privileges.consultation_room,
        },
        {
          title: "Patient Returns",
          icon: <PatientsToReturnIcon />,
          to: "/consultation-room/consultation-patients/return",
          show: user.privileges.consultation_room,
        },
        {
          title: "Consulted Patients",
          icon: <DoneIcon />,
          to: "/consultation-room/consultation-patients/consulted",
          show: user.privileges.consultation_room,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/consultation-room/reports",
          show: user.privileges.consultation_room,
          items: [
            {
              title: "Consultation Report",
              icon: <ReportsIcon />,
              to: "/consultation-room/reports/consultation",
              show: user.privileges.consultation_room,
            },
            {
              title: "Dental Morbidity (MoH)",
              icon: <ReportsIcon />,
              to: "/reports/dental-morbidity",
              show: user.privileges.consultation_room,
            },
            {
              title: "DHIS2 Dental Summary",
              icon: <ReportsIcon />,
              to: "/reports/dental-dhis2-summary",
              show: user.privileges.consultation_room,
            },
          ],
        },
        {
          title: "4. DENTAL LAB",
          subheader: true,
          show: user.privileges.dental_lab,
        },
        {
          title: "Dental Lab Dashboard",
          icon: <HomeIcon />,
          to: "/dental-lab/dashboard",
          show: user.privileges.dental_lab,
        },
        {
          title: "Lab Orders",
          icon: <WaitingIcon />,
          to: "/dental-lab/lab-orders",
          badge: Number(notifications?.patients_sent_to_lab) || 0,
          show: user.privileges.dental_lab,
        },
        {
          title: "Dental Materials",
          icon: <InventoryIcon />,
          to: "/dental-lab/materials",
          show: user.privileges.dental_lab,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/dental-lab/reports",
          show: user.privileges.dental_lab,
          items: [
            {
              title: "Lab Orders Report",
              icon: <ReportsIcon />,
              to: "/dental-lab/reports/lab-orders",
              show: user.privileges.dental_lab,
            },
          ],
        },
        {
          title: "6. MEDICINE CENTER",
          subheader: true,
          show: user.privileges.medicine_center,
        },

                  {
            title: "Medicine Alerts",
            icon: <WarningIcon />,
            to: "/medicine-center/medicine-alerts",
            show: user.privileges.medicine_center,
          },
                  {
          title: "Medicine Taking",
          icon: <MedicineIcon />,
          to: "/medicine-center/medicine-taking",
          show: user.privileges.medicine_center,
        },
        {
          title: "Medicine Item Balance Report",
          icon: <ReportsIcon />,
          to: "/medicine-center/item-balance",
          show: user.privileges.medicine_center,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/medicine-center/reports",
          show: user.privileges.medicine_center,
          items: [
            {
              title: "Stock Management",
              icon: <ReportsIcon />,
              to: "/medicine-center/reports/stock-management",
              show: user.privileges.medicine_center,
              items: [
                {
                  title: "Quantity Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/medicine-center/reports/stock-management/item-quantity-dispensed",
                  show: user.privileges.medicine_center,
                },
              ],
            },
          ],
        },
        {
          title: "6. DISPENSING",
          subheader: true,
          show: user.privileges.dispensing,
        },
        {
          title: "Dispensing Dashboard",
          icon: <HomeIcon />,
          to: "/dispensing/dashboard",
          show: user.privileges.dispensing,
        },
        {
          title: "Medicine Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/dispensing/dispensing-requests",
          badge: Number(notifications?.dispensing_requests) || 0,
          show: user.privileges.dispensing,
        },
        {
          title: "Other Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/other-dispensing/dispensing-requests",
          badge: Number(notifications?.other_dispensing_requests) || 0,
          show: user.privileges.other_dispensing,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/dispensing/reports",
          show: user.privileges.dispensing || user.privileges.other_dispensing,
          items: [
            {
              title: "Medicine Dispensing Reports",
              icon: <ReportsIcon />,
              to: "/medicine-center/reports/dispensing",
              show: user.privileges.dispensing,
              items: [
                {
                  title: "Medicines Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/medicine-center/reports/dispensing/medicines-dispensed",
                  show: user.privileges.dispensing,
                },
                {
                  title: "Medicines Not Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/medicine-center/reports/dispensing/medicines-not-dispensed",
                  show: user.privileges.dispensing,
                },
              ],
            },
            {
              title: "General Dispensing Reports",
              icon: <ReportsIcon />,
              to: "/dispensing/reports",
              show: user.privileges.dispensing,
              items: [
                {
                  title: "Items Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/dispensing/reports/items-dispensed",
                  show: user.privileges.dispensing,
                },
                {
                  title: "Items Not Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/dispensing/reports/items-not-dispensed",
                  show: user.privileges.dispensing,
                },
                {
                  title: "Item Balance Report",
                  icon: <ReportsIcon />,
                  to: "/dispensing/reports/item-balance",
                  show: user.privileges.dispensing,
                },
              ],
            },
            {
              title: "Other Dispensing Reports",
              icon: <ReportsIcon />,
              to: "/other-dispensing/reports",
              show: user.privileges.other_dispensing,
              items: [
                {
                  title: "Items Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/other-dispensing/reports/items-dispensed",
                  show: user.privileges.other_dispensing,
                },
                {
                  title: "Items Not Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/other-dispensing/reports/items-not-dispensed",
                  show: user.privileges.other_dispensing,
                },
                {
                  title: "Item Balance Report",
                  icon: <ReportsIcon />,
                  to: "/other-dispensing/reports/item-balance",
                  show: user.privileges.other_dispensing,
                },
              ],
            },
          ],
        },
        {
          title: "7. PROCEDURE ROOM",
          subheader: true,
          show: user.privileges.procedure_room,
        },
        {
          title: "Procedure Room Dashboard",
          icon: <HomeIcon />,
          to: "/procedure-room/dashboard",
          show: user.privileges.procedure_room,
        },
        {
          title: "Procedure Requests",
          icon: <WaitingIcon />,
          to: "/procedure-room/procedure-requests",
          badge: Number(notifications?.procedure_requests) || 0,
          show: user.privileges.procedure_room,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/procedure-room/reports",
          show: user.privileges.procedure_room,
          items: [
            {
              title: "Served Procedures Report",
              icon: <ReportsIcon />,
              to: "/procedure-room/reports/served-procedures",
              show: user.privileges.procedure_room,
            },
            {
              title: "Pending Procedures Report",
              icon: <ReportsIcon />,
              to: "/procedure-room/reports/pending-procedures",
              show: user.privileges.procedure_room,
            },
          ],
        },

        {
          title: "8. STOCK MANAGEMENT",
          subheader: true,
          show: user.privileges.inventory_management,
        },
        {
          title: "Stock Management Dashboard",
          icon: <HomeIcon />,
          to: "/inventory-management/dashboard",
          show: user.privileges.inventory_management,
        },
        {
          title: "Stock In",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktaking",
          show: user.privileges.inventory_management,
        },
        {
          title: "Stock Out",
          icon: <ExpensesIcon />,
          to: "/inventory-management/stock-out",
          show: user.privileges.inventory_management,
        },
        {
          title: "Stock Movements",
          icon: <ReportsIcon />,
          to: "/inventory-management/stock-movements",
          show: user.privileges.inventory_management,
        },
        {
          title: "Stock Alerts (All Items)",
          icon: <WarningIcon />,
          to: "/inventory-management/stock-alerts",
          show: user.privileges.inventory_management,
        },
        {
          title: "Medicines",
          icon: <ItemsIcon />,
          to: "/medicine-center/medicines",
          show: user.privileges.medicine_center,
        },
        {
          title: "Add Medicine",
          icon: <AddIcon />,
          to: "/medicine-center/add-medicine",
          show: user.privileges.medicine_center,
        },
        {
          title: "Dental Materials Stock",
          icon: <ItemsIcon />,
          to: "/inventory-management/dental-materials-stock",
          show: false,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/inventory-management/reports",
          show: user.privileges.inventory_management,
          items: [
            {
              title: "Stock Management",
              icon: <ReportsIcon />,
              to: "/inventory-management/reports/stock-management",
              show: user.privileges.inventory_management,
              items: [
                {
                  title: "Quantity Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/inventory-management/reports/stock-management/item-quantity-dispensed",
                  show: user.privileges.inventory_management,
                },
              ],
            },
            {
              title: "Stock Alerts",
              icon: <WarningIcon />,
              to: "/inventory-management/reports/stock-alerts",
              show: user.privileges.inventory_management,
            },
          ],
        },
        {
          title: "9. MARKETING MANAGEMENT",
          subheader: true,
          show: user.privileges.marketing,
        },
        {
          title: "Marketing Dashboard",
          icon: <HomeIcon />,
          to: "/marketing/dashboard",
          show: user.privileges.marketing,
        },
        {
          title: "Daily Acitivities",
          icon: <DailyActivitiesIcon />,
          to: "/marketing/daily-activities",
          show: user.privileges.marketing,
        },
        {
          title: "Idea Development",
          icon: <IdeaDevelopmentIcon />,
          to: "/marketing/idea-development",
          show: user.privileges.marketing,
        },
        {
          title: "Market Research Plans",
          icon: <MarketResearchIcon />,
          to: "/marketing/research-plans",
          show: user.privileges.marketing,
        },
        {
          title: "Marketing Strategies",
          icon: <MarketingStrategiesIcon />,
          to: "/marketing/strategies",
          show: user.privileges.marketing,
        },
        {
          title: "Events & Campaigns",
          icon: <OutreachProgrammesIcon />,
          to: "/marketing/events",
          show: user.privileges.marketing,
        },
        {
          title: "Outreach Programmes",
          icon: <OutreachProgrammesIcon />,
          to: "/marketing/outreach-programmes",
          show: user.privileges.marketing,
        },
        {
          title: "Communication Logs",
          icon: <CommunicationLogsIcon />,
          to: "/marketing/communication-logs",
          show: user.privileges.marketing,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/marketing/reports",
          show: user.privileges.marketing,
          items: [
            {
              title: "Marketing Campaign Performance",
              icon: <ReportsIcon />,
              to: "/marketing/reports/campaign-performance",
              show: user.privileges.marketing,
            },
            {
              title: "Lead Generation Report",
              icon: <ReportsIcon />,
              to: "/marketing/reports/lead-generation",
              show: user.privileges.marketing,
            },
            {
              title: "Communication Analytics",
              icon: <ReportsIcon />,
              to: "/marketing/reports/communication-analytics",
              show: user.privileges.marketing,
            },
          ],
        },
        {
          title: "Settings",
          icon: <SettingsIcon />,
          to: "/marketing/settings",
          show: user.privileges.marketing,
          items: [
            {
              title: "Sources of Information",
              icon: <InfoIcon />,
              to: "/marketing/settings/information-sources",
              show: user.privileges.marketing,
            },
          ],
        },
        {
          title: "10. FINANCIAL MANAGEMENT",
          subheader: true,
          show: user.privileges.financial_management,
        },
        {
          title: "Financial Management Dashboard",
          icon: <HomeIcon />,
          to: "/financial-management/dashboard",
          show: user.privileges.financial_management,
        },
        {
          title: "Expenses",
          icon: <ExpensesIcon />,
          to: "/financial-management/expenses",
          show: user.privileges.financial_management,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/financial-management/reports",
          show: user.privileges.financial_management,
          items: [
            {
              title: "Cash Collection Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/cash-collection",
              show: user.privileges.financial_management,
            },
            {
              title: "Credit Collection Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/credit-collection",
              show: user.privileges.financial_management,
            },
            {
              title: "Pending Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/pending-patient-bills",
              show: user.privileges.financial_management,
            },
            {
              title: "Cleared Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/cleared-patient-bills",
              show: user.privileges.financial_management,
            },
            {
              title: "Bill Payment Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/patient-bill-payments",
              show: user.privileges.financial_management,
            },
            {
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/expenses",
              show: user.privileges.financial_management,
            },
            {
              title: "Expense Payments Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/expense-payments",
              show: user.privileges.financial_management,
            },
          ],
        },
                {
          title: "11. USER MANAGEMENT",
          subheader: true,
          show: user.privileges.user_management,
        },
        {
          title: "User",
          icon: <UserManagementIcon />,
          to: "/user-management/users",
          show: user.privileges.user_management,
        },
        {
          title: "12. SETTINGS",
          subheader: true,
          show: user.privileges.settings,
        },
        {
          title: "Item Management",
          icon: <ItemsIcon />,
          to: "/settings/item-management",
          show: user.privileges.settings,
          items: [
            {
              title: "Units of Measure",
              icon: <SettingsIcon />,
              to: "/settings/item-management/units-of-measure",
              show: user.privileges.settings,
            },
            {
              title: "Items",
              icon: <SettingsIcon />,
              to: "/settings/item-management/items",
              show: user.privileges.settings,
            },
          ],
        },
        {
          title: "Payment Modes",
          icon: <PaymentModesIcon />,
          to: "/settings/payment-modes",
          show: user.privileges.settings,
        },
        {
          title: "Payment Channels",
          icon: <PaymentChannelsIcon />,
          to: "/settings/payment-channels",
          show: user.privileges.settings,
        },
        {
          title: "Diseases",
          icon: <DiseasesIcon />,
          to: "/settings/diseases",
          show: user.privileges.settings,
        },
        {
          title: "Expense Categories",
          icon: <ExpensesIcon />,
          to: "/settings/expense-categories",
          show: user.privileges.settings,
        },
        {
          title: "Departments",
          icon: <DepartmentsIcon />,
          to: "/settings/departments",
          show: user.privileges.settings,
        },
        {
          title: "Job Titles",
          icon: <JobTitlesIcon />,
          to: "/settings/job-titles",
          show: user.privileges.settings,
        },
        {
          title: "Clinic Details",
          icon: <ClinicDetailsIcon />,
          to: "/settings/clinic-details",
          show: user.privileges.settings,
        },
        {
          title: "System Preferences",
          icon: <SettingsIcon />,
          to: "/settings/preferences",
          show: user.privileges.settings,
        },
        {
          title: "Clinics",
          icon: <ClinicsIcon />,
          to: "/settings/clinics",
          show: user.privileges.settings && user.role === "Admin",
        },
        {
          title: "Collaborators",
          icon: <CollaboratorsIcon />,
          to: "/settings/collaborators",
          show: user.privileges.settings,
        },
        {
          title: "13. MOH REPORTS",
          subheader: true,
          show: user.privileges.consultation_room,
        },
        {
          title: "Monthly OPD Report",
          icon: <ReportsIcon />,
          to: "/moh-reports/monthly-opd",
          show: user.privileges.consultation_room,
        },
        {
          title: "Pharm. Consumption",
          icon: <ReportsIcon />,
          to: "/moh-reports/pharmaceutical-consumption",
          show: user.privileges.consultation_room,
        },
        {
          title: "Revenue Summary",
          icon: <ReportsIcon />,
          to: "/moh-reports/revenue-summary",
          show: user.privileges.consultation_room,
        },
        {
          title: "IPD Report (HMIS 002)",
          icon: <ReportsIcon />,
          to: "/moh-reports/ipd-report",
          show: user.privileges.consultation_room,
        },
        {
          title: "Cancer Report (HMIS 003)",
          icon: <ReportsIcon />,
          to: "/moh-reports/cancer-report",
          show: user.privileges.consultation_room,
        },
        {
          title: "Birth & Death Notification",
          icon: <ReportsIcon />,
          to: "/moh-reports/birth-death-notification",
          show: user.privileges.consultation_room,
        },
      ]));
    } else {
      setItems([]);
    }
  }, [user, notifications]);

  const generateMenuTree = (items) => {
    if (!items) return null;

    return items
      .filter((e) => typeof e.show === "boolean" && e.show)
      .map((e) => {
        const hasChildren = e.items?.filter(
          (e) => typeof e.show === "boolean" && e.show
        )?.length;
        return hasChildren ? (
          <MultiLevelMenuItem
            key={e.to}
            item={e}
            location={location}
            generateMenuTree={generateMenuTree}
          />
        ) : (
          <SingleLevelMenuItem
            key={e.subheader ? e.title : e.to}
            item={e}
            setDrawerOpen={setDrawerOpen}
            location={location}
            navigate={navigate}
          />
        );
      });
  };

  return (
    <nav className="flex flex-col gap-0.5 p-3 pb-8 overflow-y-auto" {...rest}>
      {generateMenuTree(items)}
    </nav>
  );
};

export default Menu;