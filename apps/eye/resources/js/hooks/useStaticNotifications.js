import { useState, useEffect } from 'react';

// Completely static notification system - no API calls, no flickering
export const useStaticNotifications = () => {
  // These values never change - completely stable
  const staticNotifications = {
    waiting_patients: 0,
    vip_patients: 0,
    patients_to_return: 0,
    spectacle_patients: 0,
    completed_patients: 0,
    procedure_requests: 0,
    other_dispensing_requests: 0,
    patients_sent_to_cashier: 0,
    credit_patients_approval: 0,
    patients_sent_to_doctor: 0,
    patients_sent_to_optician: 0,
    glass_dispensing_requests: 0,
    dispensing_requests: 0,
  };

  const [notifications] = useState(staticNotifications);
  const [loading] = useState(false);
  const [error] = useState(null);

  return {
    notifications,
    loading,
    error,
    refetch: () => {}, // No-op function
  };
};
