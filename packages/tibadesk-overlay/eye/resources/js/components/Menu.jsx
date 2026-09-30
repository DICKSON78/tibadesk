import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import { useNotificationContext } from "../contexts/NotificationContext";

import {
  AddRounded as AddIcon,
  ArticleRounded as ArticleIcon,
  CampaignRounded as AnnouncementIcon,
  BadgeRounded as JobTitlesIcon,
  ContactsRounded as ClinicDetailsIcon,
  DoneAllRounded as DoneIcon,
  ExpandLessRounded as ExpandLessIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  EventNoteRounded as AppointmentsIcon,
  GroupRounded as PeopleIcon,
  HomeRounded as HomeIcon,
  HourglassBottomRounded as WaitingIcon,
  InfoRounded as InfoIcon,
  Inventory2Rounded as ItemsIcon,
  LightbulbRounded as IdeaDevelopmentIcon,
  LibraryBooksRounded as ReportsIcon,
  LocalActivityRounded as OutreachProgrammesIcon,
  LocalHospitalRounded as ClinicsIcon,
  LocationSearchingRounded as MarketResearchIcon,
  ManageAccountsRounded as UserManagementIcon,
  MedicationRounded as MedicineIcon,
  MessageRounded as MessageIcon,
  MoneyRounded as PaymentModesIcon,
  PaymentRounded as PaymentChannelsIcon,
  PestControlRounded as DiseasesIcon,
  PhoneInTalkRounded as CommunicationLogsIcon,
  ScheduleRounded as PatientsToReturnIcon,
  SendRounded as MarketingStrategiesIcon,
  SettingsRounded as SettingsIcon,
  StarRounded as VipIcon,
  TaskAltRounded as DoctorTaskIcon,
  TaskRounded as DailyActivitiesIcon,
  TimerRounded as WaitingTimeIcon,
  TrendingDownRounded as ExpensesIcon,
  WarningRounded as WarningIcon,
  WindowRounded as DepartmentsIcon,
  HandshakeRounded as CollaboratorsIcon,
} from "@mui/icons-material";
import GlassPatientsIcon from "./icons/AddLens";

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

  return item.subheader ? (
    <ListSubheader sx={{ 
      px: { xs: 1, sm: 1, md: 1.5 },
      fontWeight: 700,
      fontSize: '0.7875rem'
    }}>
      {item.title}
    </ListSubheader>
  ) : (
    <ListItemButton
      selected={isSelected()}
      onClick={() => {
        navigate(item.to);
        if (typeof setDrawerOpen === "function") {
          setDrawerOpen(false);
        }
      }}
      sx={{
        color: "rgba(255, 255, 255, 0.66)",
        "&:hover, &.Mui-selected, &.Mui-selected:hover": {
            color: "#ffffff",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            
            "& .MuiListItemIcon-root": {
              color: "inherit",
            },
        },
        "&.Mui-selected, &.Mui-selected:hover": {
            borderRight: "4px solid #c6d2f3",
            backgroundColor: "rgba(45, 78, 168, 0.35)",
        },
        px: { xs: 1, sm: 1, md: 1.5 },
      }}
    >
      {item.icon ? (
        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
      ) : null}
      <ListItemText primary={item.title} />
      {item.badge && item.badge > 0 ? (
        <Box
          ml={1}
          bgcolor="error.main"
          borderRadius={2}
          px={1}
        >
          <Typography
            color="error.contrastText"
            variant="caption"
          >
            {item.badge}
          </Typography>
        </Box>
      ) : null}
    </ListItemButton>
  );
};

const MultiLevelMenuItem = ({ item, location, generateMenuTree }) => {
  const [open, setOpen] = useState();

  return (
    <Box className="MuiListItem-multilevel">
      <ListItemButton
        selected={location.pathname.indexOf(item.to) === 0}
        onClick={(event) => setOpen(open === item.to ? null : item.to)}
        sx={{
          color: "rgba(255, 255, 255, 0.66)",
          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
              color: "#ffffff",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              
              "& .MuiListItemIcon-root": {
                color: "inherit",
              },
          },
          "&.Mui-selected, &.Mui-selected:hover": {
              borderRight: "4px solid #c6d2f3",
              backgroundColor: "rgba(45, 78, 168, 0.35)",
          },
          px: { xs: 1, sm: 1, md: 1.5 },
        }}
      >
        {item.icon ? (
          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
        ) : null}
        <ListItemText primary={item.title} />
        {item.badge && item.badge > 0 ? (
          <Box
            ml={1.5}
            bgcolor="error.main"
            borderRadius={2}
            px={1}
          >
            <Typography
              color="error.contrastText"
              variant="caption"
            >
              {item.badge}
            </Typography>
          </Box>
        ) : null}
        {open === item.to ? (
          <ExpandLessIcon sx={{ ml: 0.5 }} />
        ) : (
          <ExpandMoreIcon sx={{ ml: 0.5 }} />
        )}
      </ListItemButton>

      <Collapse
        in={open === item.to}
        unmountOnExit
      >
        <List
          component="div"
          dense
          sx={{ pl: 2 }}
        >
          {generateMenuTree(item.items)}
        </List>
      </Collapse>
    </Box>
  );
};

const Menu = ({ drawerOpen, setDrawerOpen, user, ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  // Use NotificationContext for stable sidebar badges
  const { notifications, loading: notificationsLoading } = useNotificationContext();

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
          show: true,
        },
        {
          title: "1. RECEPTION",
          subheader: true,
          show: user.privileges.reception,
        },
        {
          title: "Reception Dashboard",
          icon: <HomeIcon />,
          to: "/reception/dashboard",
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
          title: "Spectacle Patients",
          icon: <GlassPatientsIcon />,
          to: "/reception/glass-patients",
          badge: Number(notifications?.spectacle_patients) || 0,
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
          title: "Booked Appointments",
          icon: <AppointmentsIcon />,
          to: "/reception/appointments",
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
            // {
            //   title: "Partner Frame Payments",
            //   icon: <ReportsIcon />,
            //   to: "/payment-center/reports/partner-frame-payments",
            //   show: user.privileges.payment_center,
            // },
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
          ],
        },
        {
          title: "4. OPTICIAN CENTER",
          subheader: true,
          show: user.privileges.optician_center,
        },
        {
          title: "Optician Center Dashboard",
          icon: <HomeIcon />,
          to: "/optician-center/dashboard",
          show: user.privileges.optician_center,
        },
        {
          title: "Patients Sent to Optician",
          icon: <WaitingIcon />,
          to: "/optician-center/glass-patients",
          badge: Number(notifications?.patients_sent_to_optician) || 0,
          show: user.privileges.optician_center,
        },
        {
          title: "Glass Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/optician-center/dispensing-requests",
          badge: Number(notifications?.glass_dispensing_requests) || 0,
          show: user.privileges.optician_center,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/optician-center/reports",
          show: user.privileges.optician_center,
          items: [
            {
              title: "Items Dispensed Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/items-dispensed",
              show: user.privileges.optician_center,
            },
            {
              title: "Items Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/items-not-dispensed",
              show: user.privileges.optician_center,
            },
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/item-balance",
              show: user.privileges.optician_center,
            },
          ],
        },
        {
          title: "5. MEDICINE CENTER",
          subheader: true,
          show: user.privileges.medicine_center,
        },
        {
          title: "Medicine Center Dashboard",
          icon: <HomeIcon />,
          to: "/medicine-center/dashboard",
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
          show: true, // Temporarily show for all users
        },
        {
          title: "Dispensing Dashboard",
          icon: <HomeIcon />,
          to: "/dispensing/dashboard",
          show: true, // Temporarily show for all users
        },
        {
          title: "Medicine Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/dispensing/dispensing-requests",
          badge: Number(notifications?.dispensing_requests) || 0,
          show: true, // Temporarily show for all users
        },
        {
          title: "Other Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/other-dispensing/dispensing-requests",
          badge: Number(notifications?.other_dispensing_requests) || 0,
          show: true, // Temporarily show for all users
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/dispensing/reports",
          show: true, // Temporarily show for all users
          items: [
            {
              title: "Medicine Dispensing Reports",
              icon: <ReportsIcon />,
              to: "/medicine-center/reports/dispensing",
              show: true, // Temporarily show for all users
              items: [
                {
                  title: "Medicines Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/medicine-center/reports/dispensing/medicines-dispensed",
                  show: true, // Temporarily show for all users
                },
                {
                  title: "Medicines Not Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/medicine-center/reports/dispensing/medicines-not-dispensed",
                  show: true, // Temporarily show for all users
                },
              ],
            },
            {
              title: "General Dispensing Reports",
              icon: <ReportsIcon />,
              to: "/dispensing/reports",
              show: true, // Temporarily show for all users
              items: [
                {
                  title: "Items Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/dispensing/reports/items-dispensed",
                  show: true, // Temporarily show for all users
                },
                {
                  title: "Items Not Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/dispensing/reports/items-not-dispensed",
                  show: true, // Temporarily show for all users
                },
                {
                  title: "Item Balance Report",
                  icon: <ReportsIcon />,
                  to: "/dispensing/reports/item-balance",
                  show: true, // Temporarily show for all users
                },
              ],
            },
            {
              title: "Other Dispensing Reports",
              icon: <ReportsIcon />,
              to: "/other-dispensing/reports",
              show: true, // Temporarily show for all users
              items: [
                {
                  title: "Items Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/other-dispensing/reports/items-dispensed",
                  show: true, // Temporarily show for all users
                },
                {
                  title: "Items Not Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/other-dispensing/reports/items-not-dispensed",
                  show: true, // Temporarily show for all users
                },
                {
                  title: "Item Balance Report",
                  icon: <ReportsIcon />,
                  to: "/other-dispensing/reports/item-balance",
                  show: true, // Temporarily show for all users
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
          title: "Stocktaking",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktaking",
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
          title: "Lens Stock",
          icon: <ItemsIcon />,
          to: "/inventory-management/lens-stock",
          show: user.privileges.inventory_management,
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
          title: "Blog Posts",
          icon: <ArticleIcon />,
          to: "/marketing/blog",
          show: user.privileges.marketing,
        },
        {
          title: "Announcements",
          icon: <AnnouncementIcon />,
          to: "/marketing/announcements",
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
         title: "Doctor Tasks",
         icon: <DoctorTaskIcon />,
         to: "/user-management/doctor-tasks", 
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
              title: "Lens Types",
              icon: <SettingsIcon />,
              to: "/settings/item-management/lens-types",
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
          title: "Settings",
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
    <List
      component="nav"
      dense
      disablePadding
      {...rest}
    >
      {generateMenuTree(items)}
    </List>
  );
};

export default Menu;