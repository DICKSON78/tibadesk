"""Generate resources/js/components/ui/icons.js.

Maps the `@mui/icons-material` imports still present in un-migrated pages onto
equivalent Font Awesome glyphs, re-exported under the original MUI names.
"""

import collections
import glob
import json
import re
import sys

M = {
    # actions
    "AddRounded": "faPlus", "Add": "faPlus", "AddCircleRounded": "faCirclePlus",
    "RemoveRounded": "faMinus", "CloseRounded": "faXmark", "Close": "faXmark",
    "CancelRounded": "faXmark", "CheckRounded": "faCheck", "Check": "faCheck",
    "CheckCircleRounded": "faCircleCheck", "CheckCircle": "faCircleCheck",
    "DoneAllRounded": "faCheckDouble", "DoneRounded": "faCheck",
    "DeleteRounded": "faTrash", "Delete": "faTrash", "DeleteOutlineRounded": "faTrashCan",
    "EditRounded": "faPen", "Edit": "faPen", "CreateRounded": "faPenToSquare",
    "SaveRounded": "faFloppyDisk", "Save": "faFloppyDisk",
    "Search": "faMagnifyingGlass", "SearchRounded": "faMagnifyingGlass",
    "RefreshRounded": "faArrowsRotate", "Refresh": "faArrowsRotate",
    "SyncRounded": "faArrowsRotate", "SettingsRounded": "faGear", "Settings": "faGear",
    "FilterAltRounded": "faFilter", "FilterList": "faFilter", "FilterAlt": "faFilter",
    "FilterAltOffRounded": "faFilterCircleXmark", "SortRounded": "faArrowDownAZ",
    "ViewColumnRounded": "faTableColumns", "PrintRounded": "faPrint", "Print": "faPrint",
    "Visibility": "faEye", "VisibilityRounded": "faEye", "VisibilityOff": "faEyeSlash",
    "VisibilityOffRounded": "faEyeSlash", "DownloadRounded": "faDownload",
    "Download": "faDownload", "UploadRounded": "faUpload", "Upload": "faUpload",
    "CloudUploadRounded": "faCloudArrowUp", "CloudDownloadRounded": "faCloudArrowDown",
    "MoreVertRounded": "faEllipsisVertical", "MoreHorizRounded": "faEllipsis",
    "MoreVert": "faEllipsisVertical", "MenuRounded": "faBars",
    "NorthEastRounded": "faArrowUpRightFromSquare", "NorthWestRounded": "faArrowUpLeftFromSquare",
    "ArrowBackRounded": "faArrowLeft", "ArrowBack": "faArrowLeft",
    "ArrowForwardRounded": "faArrowRight", "ArrowForward": "faArrowRight",
    "ArrowUpwardRounded": "faArrowUp", "ArrowDownwardRounded": "faArrowDown",
    "ExpandMoreRounded": "faChevronDown", "ExpandLessRounded": "faChevronUp",
    "KeyboardArrowDownRounded": "faChevronDown", "KeyboardArrowUpRounded": "faChevronUp",
    "KeyboardArrowRightRounded": "faChevronRight", "KeyboardArrowLeftRounded": "faChevronLeft",
    "ChevronLeftRounded": "faChevronLeft", "ChevronRightRounded": "faChevronRight",
    "UnfoldMoreRounded": "faChevronDown", "FirstPageRounded": "faAnglesLeft",
    "LastPageRounded": "faAnglesRight", "SkipNextRounded": "faForwardStep",
    "SkipPreviousRounded": "faBackwardStep",
    # people / auth
    "Person2Rounded": "faUser", "PersonRounded": "faUser", "PersonOutlineRounded": "faUser",
    "GroupRounded": "faUsers", "PeopleRounded": "faUsers", "PeopleAltRounded": "faUsers",
    "PersonAddRounded": "faUserPlus", "PersonAddAltRounded": "faUserPlus",
    "PersonRemoveRounded": "faUserMinus", "ManageAccountsRounded": "faUserGear",
    "BadgeRounded": "faIdCard", "ContactsRounded": "faAddressBook", "CoPresentRounded": "faUserTie",
    "SupervisorAccountRounded": "faUserShield", "AccountCircleRounded": "faCircleUser",
    "LogoutRounded": "faRightFromBracket", "LoginRounded": "faRightToBracket",
    "ExitToAppRounded": "faRightFromBracket", "LockRounded": "faLock", "LockOpenRounded": "faLockOpen",
    "FingerprintRounded": "faFingerprint", "KeyRounded": "faKey",
    # medical
    "MedicationRounded": "faPills", "Medication": "faPills", "LocalPharmacyRounded": "faPills",
    "VaccinesRounded": "faSyringe", "BiotechRounded": "faDna", "ScienceRounded": "faFlask",
    "FlaskConicalRounded": "faFlask", "MonitorHeartRounded": "faHeartPulse",
    "MedicalServicesRounded": "faStethoscope", "HealthAndSafetyRounded": "faShieldHeart",
    "LocalHospitalRounded": "faHospital", "BloodtypeRounded": "faDroplet",
    "MasksFaceRounded": "faMaskFace", "SosRounded": "faBell", "HealingRounded": "faKitMedical",
    "TestTubeRounded": "faFlaskVial", "VaccineRounded": "faSyringe",
    "PsychologyRounded": "faBrain", "AccessTimeRounded": "faClock",
    "ScheduleRounded": "faClock", "TimerRounded": "faStopwatch",
    "HourglassEmptyRounded": "faHourglass", "HourglassBottomRounded": "faHourglassHalf",
    "EventRounded": "faCalendarDay", "EventNoteRounded": "faNoteSticky",
    "EventAvailableRounded": "faCalendarCheck", "CalendarTodayRounded": "faCalendarDay",
    "CalendarMonthRounded": "faCalendar", "TodayRounded": "faCalendarDay",
    "DateRangeRounded": "faCalendarRange",
    # money
    "AttachMoneyRounded": "faMoneyBill", "MoneyRounded": "faMoneyBill",
    "PaidRounded": "faMoneyBillWave", "MonetizationOnRounded": "faSackDollar",
    "SavingsRounded": "faPiggyBank", "AccountBalanceWalletRounded": "faWallet",
    "AccountBalanceRounded": "faLandmark", "PaymentsRounded": "faMoneyBillTransfer",
    "PaymentRounded": "faCreditCard", "CreditCardRounded": "faCreditCard",
    "CurrencyExchangeRounded": "faArrowRightArrowLeft", "MoneyOffRounded": "faPercent",
    "PriceCheckRounded": "faTag", "LocalOfferRounded": "faTags", "DiscountRounded": "faTags",
    "PercentRounded": "faPercent", "CalculateRounded": "faCalculator",
    "ReceiptRounded": "faReceipt", "ReceiptLongRounded": "faReceipt",
    "ShoppingCartRounded": "faCartShopping", "ShoppingBasketRounded": "faBasketShopping",
    "InventoryRounded": "faBox", "Inventory2Rounded": "faBoxesStacked",
    "Inventory2AltRounded": "faBoxes", "CategoryRounded": "faTags",
    "WarehouseRounded": "faWarehouse", "StorefrontRounded": "faStore",
    # charts / data
    "AssessmentRounded": "faChartColumn", "BarChartRounded": "faChartColumn",
    "PieChartRounded": "faChartPie", "ShowChartRounded": "faChartLine",
    "TrendingUpRounded": "faArrowTrendUp", "TrendingDownRounded": "faArrowTrendDown",
    "TrendingFlatRounded": "faMinus", "TimelineRounded": "faClockRotateLeft",
    "QueryStatsRounded": "faChartLine", "DonutSmallRounded": "faCircle",
    "LeaderboardRounded": "faTrophy", "EqualizerRounded": "faSliders",
    "TableChartRounded": "faTable", "TableRowsRounded": "faTableList",
    "GridViewRounded": "faTableCells", "SpaceDashboardRounded": "faGaugeHigh",
    "DashboardRounded": "faGaugeHigh", "WidgetsRounded": "faGrip",
    "AutoGraphRounded": "faChartLine", "InsightsRounded": "faLightbulb",
    # comms
    "EmailRounded": "faEnvelope", "Email": "faEnvelope", "MailOutlineRounded": "faEnvelope",
    "PhoneInTalkRounded": "faPhoneVolume", "PhoneRounded": "faPhone",
    "PhoneAltRounded": "faPhoneVolume", "SmsRounded": "faCommentSms",
    "ChatRounded": "faComment", "ChatBubbleRounded": "faCommentDots",
    "ForumRounded": "faComments", "MessageRounded": "faComment",
    "SendRounded": "faPaperPlane", "ShareRounded": "faShareNodes", "LinkRounded": "faLink",
    "AttachFileRounded": "faPaperclip", "SupportAgentRounded": "faHeadset",
    "CampaignRounded": "faBullhorn", "MarkEmailReadRounded": "faEnvelopeOpen",
    "DraftsRounded": "faFileLines", "NotificationsRounded": "faBell",
    "NotificationsActiveRounded": "faBell", "DoNotDisturbAltRounded": "faBellSlash",
    "SnoozeRounded": "faClock", "PriorityHighRounded": "faTriangleExclamation",
    # misc
    "HomeRounded": "faHouse", "Home": "faHouse", "CottageRounded": "faHouse",
    "SettingsSuggestRounded": "faGear", "TuneRounded": "faSliders",
    "InfoRounded": "faCircleInfo", "Info": "faCircleInfo", "HelpRounded": "faCircleQuestion",
    "QuestionMarkRounded": "faCircleQuestion", "ErrorRounded": "faCircleExclamation",
    "ErrorOutlineRounded": "faCircleExclamation", "WarningRounded": "faTriangleExclamation",
    "WarningAmberRounded": "faTriangleExclamation", "ReportProblemRounded": "faTriangleExclamation",
    "BlockRounded": "faBan", "PowerSettingsNewRounded": "faPowerOff",
    "DoneAll": "faCheckDouble", "HourglassEmpty": "faHourglass", "AccessTime": "faClock",
    "StarRounded": "faStar", "StarBorderRounded": "faStar", "StarHalfRounded": "faStarHalf",
    "ThumbUpRounded": "faThumbsUp", "ThumbDownRounded": "faThumbsDown",
    "FavoriteRounded": "faHeart", "FavoriteBorderRounded": "faHeart",
    "WorkspacePremiumRounded": "faMedal", "EmojiEventsRounded": "faTrophy",
    "MilitaryRankRounded": "faMedal", "VerifiedRounded": "faBadgeCheck",
    "TaskRounded": "faListCheck", "TaskAltRounded": "faCircleCheck",
    "ChecklistRounded": "faListCheck", "AssignmentRounded": "faClipboardList",
    "AssignmentTurnedInRounded": "faClipboardCheck", "DescriptionRounded": "faFileLines",
    "NoteAltRounded": "faNoteSticky", "StickyNote2Rounded": "faNoteSticky",
    "NoteRounded": "faStickyNote", "ArticleRounded": "faFileLines",
    "TextSnippetRounded": "faAlignLeft", "LibraryBooksRounded": "faBook",
    "MenuBookRounded": "faBookOpen", "MenuBook": "faBookOpen", "BookmarkRounded": "faBookmark",
    "BookmarkBorderRounded": "faBookmark", "LabelRounded": "faTag", "SellRounded": "faTag",
    "LightbulbRounded": "faLightbulb", "Lightbulb": "faLightbulb",
    "PaletteRounded": "faPalette", "BrushRounded": "faPaintbrush",
    "ColorLensRounded": "faPalette", "SchoolRounded": "faGraduationCap",
    "WorkspaceRounded": "faBriefcase", "WorkRounded": "faBriefcase",
    "RepeatRounded": "faRepeat", "ReplayRounded": "faRotate",
    "PlayCircleRounded": "faCirclePlay", "PlayArrowRounded": "faPlay",
    "PauseRounded": "faPause", "StopCircleRounded": "faCircleStop",
    "MicRounded": "faMicrophone", "VideocamRounded": "faVideo",
    "PhotoCameraRounded": "faCamera", "ImageRounded": "faImage",
    "FolderRounded": "faFolder", "FolderOpenRounded": "faFolderOpen",
    "CreateNewFolderRounded": "faFolderPlus", "InsertDriveFileRounded": "faFile",
    "PictureAsPdfRounded": "faFilePdf", "PictureAsPdf": "faFilePdf",
    "PictureAsWordRounded": "faFileWord", "PictureAsExcelRounded": "faFileExcel",
    "TableChartOutlined": "faFileExcel", "CloudDoneRounded": "faCloudCheck",
    "CloudOffRounded": "faCloudSlash", "CloudRounded": "faCloud", "WifiRounded": "faWifi",
    "RouterRounded": "faRouter", "StorageRounded": "faServer",
    "DnsRounded": "faNetworkWired", "DevicesRounded": "faLaptop",
    "MonitorRounded": "faDesktop", "PhoneAndroidRounded": "faMobileScreen",
    "TabletRounded": "faTabletScreenButton", "MouseRounded": "faComputerMouse",
    "TouchAppRounded": "faHandPointer", "KeyboardRounded": "faKeyboard",
    "LanguageRounded": "faLanguage", "PublicRounded": "faGlobe",
    "LocationOnRounded": "faLocationDot", "PlaceRounded": "faLocationDot",
    "LocationSearchingRounded": "faMagnifyingGlassLocation",
    "MyLocationRounded": "faLocationCrosshairs", "DirectionsRounded": "faDirections",
    "MapRounded": "faMap", "TravelExploreRounded": "faCompass",
    "SourceRounded": "faCodeBranch", "AccountTreeRounded": "faSitemap",
    "HubRounded": "faCircleNodes", "SwapHorizRounded": "faRightLeft",
    "TransferWithinAStationRounded": "faRightLeft", "CompareArrowsRounded": "faRightLeft",
    "SwapVertRounded": "faUpDown", "FormatListBulletedRounded": "faListUl",
    "FormatQuoteRounded": "faQuoteLeft", "ContentCopyRounded": "faCopy",
    "ContentPasteRounded": "faPaste", "ContentCutRounded": "faScissors",
    "ContentCut": "faScissors", "ModeEditRounded": "faPenToSquare",
    "UndoRounded": "faRotateLeft", "RedoRounded": "faRotateRight",
    "HourglassTopRounded": "faHourglassStart", "LocalShippingRounded": "faTruck",
    "LocalTaxiRounded": "faTaxi", "FlightRounded": "faPlane", "TrainRounded": "faTrain",
    "DirectionsCarRounded": "faCar", "PedalBikeRounded": "faBicycle",
    "PoolRounded": "faPersonSwimming", "FitnessCenterRounded": "faDumbbell",
    "SpaRounded": "faHotTubPerson", "SelfImprovementRounded": "faPersonMeditating",
    "VolunteerActivismRounded": "faHandHoldingHeart",
    "VolunteerActivism": "faHandHoldingHeart", "GroupAddRounded": "faUserPlus",
    "GroupOffRounded": "faUserSlash", "AdsClickRounded": "faMousePointer",
    "NightlifeRounded": "faMartiniGlass", "CakeRounded": "faCake",
    "WineBarRounded": "faWineGlass", "EmojiFoodBeverageRounded": "faMugHot",
    "FastfoodRounded": "faBurger", "LunchDiningRounded": "faUtensils",
    "LocalCafeRounded": "faMugHot", "HotelRounded": "faHotel",
    "BeachAccessRounded": "faUmbrellaBeach", "HandshakeRounded": "faHandshake",
    "WindowRounded": "faTableColumns", "CurrencyPoundRounded": "faSterlingSign",
    "CurrencyYenRounded": "faYenSign", "CurrencyRupeeRounded": "faIndianRupeeSign",
    "HandRounded": "faHand", "BackHandRounded": "faHand", "PanToolRounded": "faHand",
    "FlipToBackRounded": "faLayerGroup", "ViewInArRounded": "faCube",
    "ViewModuleRounded": "faGrip", "OpenInNewRounded": "faArrowUpRightFromSquare",
    "LaunchRounded": "faArrowUpRightFromSquare", "OpenInFullRounded": "faExpand",
    "FullscreenRounded": "faExpand", "FullscreenExitRounded": "faCompress",
    "ZoomInRounded": "faMagnifyingGlassPlus", "ZoomOutRounded": "faMagnifyingGlassMinus",
    "CenterFocusStrongRounded": "faCrosshairs", "WbSunnyRounded": "faSun",
    "Brightness4Rounded": "faMoon", "DarkModeRounded": "faMoon", "LightModeRounded": "faSun",
    "ContrastRounded": "faCircleHalfStroke", "ThermostatRounded": "faTemperatureHalf",
    "DeviceThermostatRounded": "faTemperatureHalf", "UmbrellaRounded": "faUmbrella",
    "AcUnitRounded": "faSnowflake", "AirRounded": "faWind",
    "CompressRounded": "faCompress", "ExpandRounded": "faExpand",
    "CloudSyncRounded": "faCloudArrowUp", "Filter1Rounded": "faFilter",
    "Filter2Rounded": "faFilter", "MoveToInboxRounded": "faInbox",
    "OutboxRounded": "faOutbox", "MarkunreadRounded": "faEnvelope",
    "UnarchiveRounded": "faBoxOpen", "ArchiveRounded": "faBox",
    "MoveToArchiveRounded": "faBoxOpen", "ShoppingCartCheckoutRounded": "faCartShopping",
    "RedeemRounded": "faGift", "CardGiftcardRounded": "faGift",
    "MilitaryTechRounded": "faMedal", "ThumbtackRounded": "faThumbtack",
    "PersonPinCircleRounded": "faLocationDot", "MapMarkerAltRounded": "faLocationDot",
    "OpenInBrowserRounded": "faArrowUpRightFromSquare", "LaunchOutlined": "faArrowUpRightFromSquare",
    "LocalActivityRounded": "faBullhorn", "ExploreRounded": "faCompass",
    "TurnedInRounded": "faCheck", "VerifiedOutlined": "faBadgeCheck",
    "RuleRounded": "faGavel", "GavelRounded": "faGavel",
    "BalanceRounded": "faScaleBalanced", "TrendingUp": "faArrowTrendUp",
    "TrendingDown": "faArrowTrendDown", "ArrowUpward": "faArrowUp",
    "ArrowDownward": "faArrowDown", "MoreVertOutlined": "faEllipsisVertical",
    "AddCircleOutlineRounded": "faCirclePlus", "RemoveCircleOutlineRounded": "faCircleMinus",
    "RadioButtonUncheckedRounded": "faCircle", "ToggleOnRounded": "faToggleOn",
    "ToggleOffRounded": "faToggleOff", "PowerRounded": "faPowerOff",
    "SecurityRounded": "faShieldHalved", "AdminPanelSettingsRounded": "faUserShield",
    "ManageSearchRounded": "faMagnifyingGlassLocation", "SearchOffRounded": "faMagnifyingGlass",
    "PersonSearchRounded": "faUser", "MedicalInformationRounded": "faFileMedical",
    "PrescriptionsRounded": "faFilePrescription", "ContentPasteGoRounded": "faFileMedical",
    "MedicationLiquidRounded": "faSyringe", "VaccinesOutlined": "faSyringe",
    "ArrowDropDownRounded": "faChevronDown", "ArrowDropUpRounded": "faChevronUp",
    "AttachmentRounded": "faPaperclip", "ChurchRounded": "faChurch",
    "FemaleRounded": "faVenus", "MaleRounded": "faMars",
    "FlagRounded": "faFlag", "StopRounded": "faStop",
}

# Names to export: everything actually imported by the codebase.
used = collections.Counter()
files = glob.glob("resources/js/pages/**/*.jsx", recursive=True) + glob.glob(
    "resources/js/components/**/*.jsx", recursive=True
)
for path in files:
    src = open(path).read()
    for match in re.finditer(r'\{([^{}]*?)\}\s*from\s*["\']@mui/icons-material["\']', src, re.S):
        for raw in match.group(1).split(","):
            name = raw.strip().split(" as ")[0].strip()
            if name:
                used[name] += 1
    # Deep imports such as `@mui/icons-material/AddRounded`.
    for match in re.finditer(r'["\']@mui/icons-material/(\w+)["\']', src):
        used[match.group(1)] += 1

missing = sorted(n for n in used if n not in M)
if missing:
    print("UNMAPPED icons still imported by pages:", missing, file=sys.stderr)
    sys.exit(1)

export_names = sorted(used)
glyphs = sorted({M[n] for n in export_names})

out = [
    "/**",
    " * Font Awesome stand-ins for the `@mui/icons-material` imports still present in",
    " * un-migrated pages. Every MUI icon name is re-exported as a component rendering the",
    " * closest Font Awesome glyph, so existing `<SomeRounded />` JSX keeps working while the",
    " * UI moves to the Font Awesome icon set.",
    " *",
    " * Generated by tools/gen-icons.py - add entries there when new icons appear.",
    " */",
    "",
    'import React from "react";',
    'import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";',
    "import {",
]
out += [f"  {g}," for g in glyphs]
out += ['} from "@fortawesome/free-solid-svg-icons";', ""]
out += [
    "const make = (icon) => {",
    '  const Component = ({ className = "", ...rest }) => (',
    "    <FontAwesomeIcon",
    "      icon={icon}",
    '      className={`w-5 h-5 ${className}`.trim()}',
    "      {...rest}",
    "    />",
    "  );",
    "  Component.displayName = icon.iconName;",
    "  return Component;",
    "};",
    "",
]
out += [f"export const {n} = make({M[n]});" for n in export_names]
out.append("")

target = "resources/js/components/ui/icons.js"
open(target, "w").write("\n".join(out))
print(f"wrote {target}: {len(export_names)} icon exports, {len(glyphs)} glyphs")
json.dump({"M": M}, open("/tmp/opencode/iconmap.json", "w"))
