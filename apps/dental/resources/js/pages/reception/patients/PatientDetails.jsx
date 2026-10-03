import React, { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Grid,
  Divider,
} from "../../../components/ui/index.jsx";

import { useFetch, useToast } from "../../../hooks";
import { formatError, getAge } from "../../../helpers";
import { Alert, Chip, Skeleton } from "../../../components/ui/index.jsx";
import { BadgeRounded as BadgeIcon, CalendarMonthRounded as CalendarMonthIcon, ChurchRounded as ChurchIcon, EmailRounded as EmailIcon, FemaleRounded as FemaleIcon, FlagRounded as FlagIcon, GroupRounded as GroupIcon, InfoRounded as InfoIcon, LocationOnRounded as LocationOnIcon, MaleRounded as MaleIcon, PaymentRounded as PaymentIcon, PersonRounded as PersonIcon, PhoneRounded as PhoneIcon, StarRounded as StarIcon, WorkRounded as WorkIcon } from "../../../components/ui/icons.jsx";

const PatientDetails = ({ patientId, setLoading, onLoadSuccess }) => {
  const addToast = useToast();

  const { data, loading, error } = useFetch(
    `api/patients/${patientId}`,
    null,
    patientId && patientId !== 'null' && patientId !== 'undefined',
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    if (typeof setLoading === "function") {
      setLoading(loading);
    }
  }, [loading]);

  useEffect(() => {
    if (data && typeof onLoadSuccess === "function") {
      onLoadSuccess(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleFeedback = () => {
    if (error) {
      return (
        <Alert sx={{ mb: 2 }} severity="error">
          {formatError(error)}
        </Alert>
      );
    }
    return null;
  };

  const personalDetails = data ? [
    { label: "Name", value: data.full_name, icon: <PersonIcon fontSize="small" /> },
    { label: "Patient No.", value: `#${data.id}`, icon: <BadgeIcon fontSize="small" /> },
    { label: "Age", value: getAge(data.date_of_birth), icon: <CalendarMonthIcon fontSize="small" /> },
    { label: "Gender", value: data.gender, icon: data.gender?.toLowerCase() === "male" ? <MaleIcon fontSize="small" /> : <FemaleIcon fontSize="small" /> },
    { label: "Occupation", value: data.occupation || "N/A", icon: <WorkIcon fontSize="small" /> },
    { label: "Next of Kin", value: data.next_of_kin || "N/A", icon: <GroupIcon fontSize="small" /> },
    { label: "Tribe", value: data.tribe || "N/A", icon: <FlagIcon fontSize="small" /> },
    { label: "Religion", value: data.religion || "N/A", icon: <ChurchIcon fontSize="small" /> },
    { label: "National ID", value: data.national_id || "N/A", icon: <InfoIcon fontSize="small" /> },
  ] : [];

  const communicationData = data ? [
    { label: "Phone", value: data.phone, icon: <PhoneIcon fontSize="small" /> },
    { label: "Email", value: data.email || "N/A", icon: <EmailIcon fontSize="small" /> },
  ] : [];

  const locationData = data ? [
    { label: "Address", value: data.address, icon: <LocationOnIcon fontSize="small" /> },
    { label: "Payment Mode", value: data.payment_mode?.name || "N/A", icon: <PaymentIcon fontSize="small" /> },
  ] : [];

  if (data?.information_source?.name) {
    personalDetails.push({
      label: "Information Source",
      value: data.information_source.name,
      icon: <InfoIcon fontSize="small" />,
    });
  }

  const categories = data ? [
    { title: "Personal Details", rows: personalDetails },
    { title: "Communication", rows: communicationData },
    { title: "Location Details", rows: locationData },
  ] : [];

  return (
    <React.Fragment>
      {handleFeedback()}
      {loading ? (
        <Skeleton variant="rounded" height={180} sx={{ mb: 2, borderRadius: 2 }} />
      ) : null}
      {data ? (
        <Card
          variant="outlined"
          sx={{
            mb: 2,
            borderRadius: 2,
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", px: 3, py: 1.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                  SARAH DENTAL CLINIC
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Patient Information
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "white",
                  p: 0.5,
                  borderRadius: 1,
                  display: "inline-flex",
                  lineHeight: 0,
                }}
              >
                <QRCodeSVG
                  value={JSON.stringify({
                    id: data.id,
                    name: data.full_name,
                    phone: data.phone,
                  })}
                  size={60}
                  level="M"
                />
              </Box>
            </Stack>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 0,
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                divider={<Divider orientation="vertical" flexItem />}
                spacing={0}
              >
                {categories.map((cat) => (
                  <Box
                    key={cat.title}
                    sx={{
                      flex: 1,
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        color: "primary.main",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      {cat.title}
                    </Typography>
                    <Stack spacing={1}>
                      {cat.rows.map((row) => (
                        <Stack direction="row" spacing={1} alignItems="center" key={row.label}>
                          <Box sx={{ color: "primary.main", display: "flex", alignItems: "center", minWidth: 20 }}>
                            {row.icon}
                          </Box>
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                              {row.label}:
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, wordBreak: "break-word" }}>
                              {row.value}
                            </Typography>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
              {data.is_vip && (
                <Chip
                  icon={<StarIcon />}
                  label="VIP"
                  color="warning"
                  size="small"
                  sx={{ mt: 1.5, ml: 2 }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      ) : null}
    </React.Fragment>
  );
};

export default PatientDetails;
