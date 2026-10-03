import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowUpRightFromSquare,
  faBars,
  faBriefcaseMedical,
  faBuilding,
  faCalendarDays,
  faChartColumn,
  faCheck,
  faCircleCheck,
  faCircleQuestion,
  faClipboardList,
  faClockRotateLeft,
  faCloudArrowDown,
  faComments,
  faCreditCard,
  faDatabase,
  faDownload,
  faEnvelope,
  faEye,
  faFileInvoice,
  faFlask,
  faGaugeHigh,
  faHandshake,
  faHardDrive,
  faHospital,
  faLayerGroup,
  faListCheck,
  faLocationDot,
  faLock,
  faMagnifyingGlass,
  faMoneyBillWave,
  faNetworkWired,
  faPaperPlane,
  faPhone,
  faPrescriptionBottleMedical,
  faQuoteLeft,
  faReceipt,
  faServer,
  faShieldHalved,
  faStethoscope,
  faTooth,
  faTriangleExclamation,
  faUserDoctor,
  faUserNurse,
  faUsers,
  faWallet,
  faWifi,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Thin wrappers so components can use `<IconName className="..." />` without
 * every caller needing to import FontAwesomeIcon and an icon object.
 */
const icon = (definition, defaultClassName = 'h-5 w-5') => {
  const Component = ({ className, ...rest }) => (
    <FontAwesomeIcon icon={definition} className={className ?? defaultClassName} {...rest} />
  );

  Component.displayName = definition.iconName;

  return Component;
};

export const IconArrow = icon(faArrowRight);
export const IconArrowUpRight = icon(faArrowUpRightFromSquare);
export const IconBars = icon(faBars);
export const IconBriefcase = icon(faBriefcaseMedical);
export const IconBuilding = icon(faBuilding);
export const IconCalendar = icon(faCalendarDays);
export const IconChart = icon(faChartColumn);
export const IconCheck = icon(faCheck);
export const IconCircleCheck = icon(faCircleCheck);
export const IconQuestion = icon(faCircleQuestion);
export const IconClipboard = icon(faClipboardList);
export const IconClock = icon(faClockRotateLeft);
export const IconCloudDownload = icon(faCloudArrowDown);
export const IconComments = icon(faComments);
export const IconCard = icon(faCreditCard);
export const IconDatabase = icon(faDatabase);
export const IconDownload = icon(faDownload);
export const IconMail = icon(faEnvelope);
export const IconEye = icon(faEye);
export const IconInvoice = icon(faFileInvoice);
export const IconFlask = icon(faFlask);
export const IconGauge = icon(faGaugeHigh);
export const IconHandshake = icon(faHandshake);
export const IconDrive = icon(faHardDrive);
export const IconHospital = icon(faHospital);
export const IconLayers = icon(faLayerGroup);
export const IconListCheck = icon(faListCheck);
export const IconPin = icon(faLocationDot);
export const IconLock = icon(faLock);
export const IconSearch = icon(faMagnifyingGlass);
export const IconCash = icon(faMoneyBillWave);
export const IconNetwork = icon(faNetworkWired);
export const IconSend = icon(faPaperPlane);
export const IconPhone = icon(faPhone);
export const IconPill = icon(faPrescriptionBottleMedical);
export const IconQuote = icon(faQuoteLeft);
export const IconReceipt = icon(faReceipt);
export const IconServer = icon(faServer);
export const IconShield = icon(faShieldHalved);
export const IconStethoscope = icon(faStethoscope);
export const IconTooth = icon(faTooth);
export const IconWarning = icon(faTriangleExclamation);
export const IconDoctor = icon(faUserDoctor);
export const IconNurse = icon(faUserNurse);
export const IconUsers = icon(faUsers);
export const IconWallet = icon(faWallet);
export const IconWifi = icon(faWifi);
export const IconClose = icon(faXmark);

/**
 * The catalogue names an icon per module; this maps those names onto the
 * Font Awesome wrappers above so a module added in config renders without
 * touching this file.
 */
export const MODULE_ICONS = {
  clipboard: IconClipboard,
  stethoscope: IconStethoscope,
  hospital: IconHospital,
  pill: IconPill,
  flask: IconFlask,
  receipt: IconReceipt,
  users: IconUsers,
  chart: IconChart,
  shield: IconShield,
  tooth: IconTooth,
  eye: IconEye,
  layers: IconLayers,
};

export { FontAwesomeIcon };
