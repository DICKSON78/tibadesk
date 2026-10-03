/**
 * Helper functions.
 */

import moment from "moment";

/**
 * Formats a `number` into comma-separated sections.
 * @param number {Number}
 * @returns {String}
 */
export const numberFormat = (number) => {
  if (number == null) return "0";
  let parts = number.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

/**
 * Rounds a `number` to `decimalPlaces`.
 * @param number {Number}
 * @param decimalPlaces {int}
 * @returns {Number}
 */
export const round = (number, decimalPlaces = 0) => {
  number = Math.round(number + "e" + decimalPlaces);
  return Number(number + "e" + -decimalPlaces);
};

/**
 * Strips all non-digit characters from `text` and returns a string of digits.
 * @param text {String}
 * @returns {String}
 */
export const validateInteger = (text) => {
  text = text || "";
  return Array.prototype.slice
    .call(text)
    .filter((c) => /\d+/.test(c))
    .join("");
};

/**
 * Capitalizes each first letter of each word in a `text`.
 * @param text {String}
 * @returns {String}
 */
export const capitalize = (text) => {
  return text
    .split(" ")
    .map((e) => e.charAt(0).toUpperCase() + e.substr(1).toLowerCase())
    .join(" ");
};

/**
 * Formats a date object or string to the format of year-month-date.
 * @param date
 * @returns {String}
 */
export const formatDateForDb = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY-MM-DD");
};

/**
 * Formats a date object or string to a readable format.
 * @param date {Date|String}
 * @returns {String}
 */
export const formatDate = (date) => {
  if (!date) return "-";
  return moment(date).format("MMM DD, YYYY");
};

export const formatDateTime = (date) => {
  if (!date) return "-";
  return moment(date).format("MMM DD, YYYY HH:mm");
};

/**
 * Get the current date at midnight.
 * @returns {Date}
 */
export const getTodayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the start date of the current week (Monday).
 * @param date {Date|String} - Optional date, defaults to current date
 * @returns {Date}
 */
export const getWeekStartDate = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Get the end date of the current week (Sunday).
 * @param date {Date|String} - Optional date, defaults to current date
 * @returns {Date}
 */
export const getWeekEndDate = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Calls a `fn` after a specified `delay` time.
 * @param fn {Function}
 * @param delay {int}
 */
const throttleTimers = {};

export const throttle = (fn, delay, key) => {
  if (key && throttleTimers[key]) {
    clearTimeout(throttleTimers[key]);
  }

  if (key) {
    throttleTimers[key] = setTimeout(fn, delay);
    return;
  }

  if (window.throttleTimeoutID) {
    window.clearTimeout(window.throttleTimeoutID);
  }
  window.throttleTimeoutID = window.setTimeout(fn, delay);
};

/**
 * Get common validation rules.
 * @returns {Object}
 */
export const getValidationRules = () => {
  return {
    required: (value) => !!value || "This field is required.",
    integer: (value) => {
      const pattern = /^-?\d+$/;
      return pattern.test(value) || "Invalid integer.";
    },
    optionalInteger: (value) => {
      const pattern = /^-?\d+$/;
      return !value ? true : pattern.test(value) || "Invalid integer.";
    },
    number: (value) => {
      const pattern = /^-?\d*\.?\d+$/;
      return pattern.test(value) || "Invalid number.";
    },
    phone: (value) => {
      const pattern = /^0\d{9}$/;
      return pattern.test(value) || "Invalid phone number.";
    },
    optionalPhone: (value) => {
      const pattern = /^0\d{9}$/;
      return !value ? true : pattern.test(value) || "Invalid phone number.";
    },
    email: (value) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(value) || "Invalid email address.";
    },
    optionalEmail: (value) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value ? true : pattern.test(value) || "Invalid email address.";
    },
    time: (value) => {
      const pattern = /^(\d{2}):(\d{2})$/;
      const matches = pattern.exec(value);
      if (matches && matches.length === 3) {
        const hours = parseInt(matches[1]);
        const minutes = parseInt(matches[2]);
        return (hours <= 23 && minutes <= 59) || "Invalid time.";
      }

      return "Invalid time.";
    },
  };
};

/**
 * Get a validation-like error object.
 * @param message
 * @returns {{response: {status: number, data: {message: *}}}}
 */
export const getValidationError = (message) => {
  return { response: { status: 422, data: { message } } };
};

/**
 * Formats an error body into a user-friendly error message.
 * @param errorBody
 * @returns {String}
 */
export const formatError = (errorBody) => {
  let message = "Something went wrong.";

  if (errorBody.response) {
    const statusCode = parseInt(errorBody.response.status);
    switch (statusCode) {
      case 401:
      case 403:
        {
          let data = errorBody.response.data;
          if (data.message) {
            message = data.message;
          }
        }
        break;
      case 404:
        message = "The requested resource was not found.";
        break;
      case 422:
        {
          // validation errors
          let data = errorBody.response.data;
          if (data.message) {
            message = data.message;
          }

          if (data.errors) {
            let errors = [];
            Object.keys(data.errors).forEach((e, i) =>
              errors.push(data.errors[e][0])
            );
            message = errors.join("\n");
          }
        }
        break;
    }
  } else if (errorBody.request) {
    message = "Network connectivity error.";
  }

  return message;
};

/**
 * Get age from `date`.
 * @param date
 * @returns {*}
 */
export const getAge = (date) => {
  if (!date || date === "0000-00-00") {
    return null;
  }

  const years = moment().diff(date, "years");
  const months = moment().diff(date, "months");
  const days = moment().diff(date, "days");

  if (years >= 1) {
    return Math.floor(years) + " years";
  }

  if (months >= 1 && months <= 12) {
    return Math.floor(months) + " months";
  }

  return days + " days";
};

/**
 * Get full name from `firstName`, `middleName` and `lastName`.
 * @param firstName
 * @param middleName
 * @param lastName
 * @returns {String}
 */
export const getFullName = (firstName, middleName, lastName) => {
  let fullName = `${firstName} ${middleName || ""} ${lastName}`.trim();
  return fullName.replace(/\s{2,}/g, " ");
};

/**
 * Get address from `region`, `district` and `ward`.
 * @param region
 * @param district
 * @param ward
 * @returns {String}
 */
export const getAddress = (region, district, ward) => {
  let address = "";

  if (ward) {
    address += ward.name;
  }
  if (district) {
    address += `, ${district.name}`;

    if (address.indexOf(", ") === 0) {
      address = address.substring(2);
    }
  }
  if (region) {
    address += `, ${region.name}`;

    if (address.indexOf(", ") === 0) {
      address = address.substring(2);
    }
  }

  return address;
};

/**
 * Get date range title for reports.
 * @param startDate
 * @param endDate
 * @returns {String}
 */
export const getDateRangeTitle = (startDate, endDate) => {
  let title = "";
  if (startDate) {
    title += `From ${formatDateForDb(startDate)}`;
  }
  if (endDate) {
    title += ` to ${formatDateForDb(endDate)}`;
  }

  return title;
};

/**
 * Gets file extension from `filename`.
 * @param {String} filename
 * @returns {String}
 */
export const getFileExtension = (filename) => {
  filename = filename || "";
  const parts = filename.split(".");
  return (parts[parts.length - 1] || "").toUpperCase();
};

export const getPrivileges = (preferences) => {
  return [
    { label: "Dashboard", value: "dashboard" },
    { label: "Reception", value: "reception" },
    { label: "Payment Center", value: "payment_center" },
    { label: "Consultation Room", value: "consultation_room" },
    { label: "Dental Lab", value: "dental_lab" },
    { label: "Medicine Center", value: "medicine_center" },
    { label: "Procedure Room", value: "procedure_room" },
    { label: "Dispensing", value: "dispensing" },
    { label: "Other Dispensing", value: "other_dispensing" },
    { label: "Inventory Management", value: "inventory_management" },
    {
      label: "Marketing",
      value: "marketing",
      show:
        preferences?.find((e) => e.key === "MARKETING_MODULE")?.value === "Yes",
    },
    { label: "Financial Management", value: "financial_management" },
    { label: "User Management", value: "user_management" },
    { label: "Settings", value: "settings" },
  ];
};

export const DEFAULT_ROLE_PRIVILEGES = {
  Admin: [
    "dashboard", "reception", "payment_center", "consultation_room",
    "dental_lab", "medicine_center", "procedure_room", "dispensing",
    "other_dispensing", "inventory_management", "marketing",
    "financial_management", "user_management", "settings",
  ],
  "Hospital Manager": [
    "reception", "payment_center", "consultation_room",
    "dental_lab", "medicine_center", "procedure_room", "dispensing",
    "other_dispensing", "inventory_management", "marketing",
    "financial_management", "user_management", "settings",
  ],

  // Clinical
  "Dental Surgeon": ["consultation_room", "dental_lab", "procedure_room"],
  Doctor: ["consultation_room", "dental_lab"],
  "Dental Therapist": ["consultation_room", "dental_lab"],
  "Oral Health Officer": ["consultation_room", "dental_lab"],
  "Clinical Officer": ["consultation_room", "procedure_room"],
  "Medical Officer": ["consultation_room", "procedure_room", "medicine_center"],

  // Nursing
  Nurse: ["consultation_room", "procedure_room"],
  "Dental Nurse": ["consultation_room", "dental_lab", "procedure_room"],
  "Theatre Nurse": ["procedure_room", "consultation_room"],
  "Anaesthesia Officer": ["procedure_room"],
  "Dental Assistant": ["consultation_room", "dental_lab"],

  // Lab
  "Dental Lab Technician": ["dental_lab"],
  "Lab Assistant": ["dental_lab"],

  // Pharmacy
  Pharmacist: ["medicine_center", "dispensing", "inventory_management"],
  "Pharmacy Technician": ["medicine_center", "dispensing"],
  "Dispensing Assistant": ["dispensing", "other_dispensing"],

  // Administrative
  Receptionist: ["reception"],
  "Medical Records Officer": ["reception", "settings"],
  "Office Administrator": ["reception", "settings", "user_management"],
  Secretary: ["reception"],
  "Health Information Officer": ["reception", "consultation_room"],

  // Finance
  Cashier: ["payment_center", "dispensing", "other_dispensing"],
  "Billing Officer": ["payment_center", "financial_management"],
  Accountant: ["financial_management", "payment_center"],

  // Inventory
  "Inventory Manager": ["inventory_management", "medicine_center"],
  "Store Keeper": ["inventory_management"],

  // Marketing
  "Marketing Officer": ["marketing"],
  "Community Oral Health Worker": ["marketing", "reception"],
  "Public Health Officer": ["marketing", "consultation_room"],

  // Oversight
  "Quality Assurance Officer": ["settings"],
  "Compliance Officer": ["financial_management", "settings"],
  "Training Coordinator": ["settings"],

  // IT
  "IT Administrator": ["settings", "user_management"],
  "System Administrator": ["settings", "user_management"],
};

export const getRoleOptions = (preferences) => {
  return Object.entries(DEFAULT_ROLE_PRIVILEGES).map(([role, privileges]) => ({
    label: role,
    value: role,
    privileges,
  }));
};

/**
 * Whether the currently logged-in user is an admin.
 * Admin-only operations (delete) are gated on the backend; this mirrors that rule in the UI.
 * @returns {boolean}
 */
export const isAdmin = () => {
  return !!(
    window.user &&
    (window.user.is_admin === true || window.user.role === "Admin")
  );
};
