import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import MoreIcon from "@mui/icons-material/MoreVertRounded";
import StarIcon from "@mui/icons-material/StarRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "../patients/Filters";
import CreateVipPatient from "./CreateVipPatient";
import EditPatient from "../patients/EditPatient";

import { useFetch, useToast } from "../../../hooks";
import { useNotificationContext } from "../../../contexts/NotificationContext";
import { formatError, getAge } from "../../../helpers";

const VipPatients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const { setNotificationField, refreshNotifications, lockNotificationKey, unlockNotificationKey } = useNotificationContext();

  const [item, setItem] = useState();
  const [anchorEl, setAnchorEl] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    id: undefined,
    name: undefined,
    phone: undefined,
    email: undefined,
    gender: undefined,
    payment_mode_id: undefined,
    is_vip: true, // Filter for VIP patients only
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patients/vip",
    params,
    true,
    [],
    (response) => {
      const payload = response?.data?.data;
      const list = Array.isArray(payload) ? payload : payload?.data;
      return Array.isArray(list) ? list : [];
    }
  );

  useEffect(() => {
    document.title = `VIP Patients - ${window.APP_NAME}`;
    // Lock IMMEDIATELY to prevent initial server value from flashing
    lockNotificationKey?.('vip_patients');
    // Set a safe immediate value (0) to avoid showing stale counts
    setNotificationField?.('vip_patients', 0);
    // Now fetch server notifications in the background
    refreshNotifications?.();
    return () => {
      unlockNotificationKey?.('vip_patients');
    };
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  // Keep the VIP badge in sync with the visible list length
  useEffect(() => {
    if (Array.isArray(data)) {
      // Clamp to list length to avoid brief server-side overcount
      setNotificationField?.('vip_patients', Math.max(0, data.length));
    }
  }, [data, setNotificationField]);


  const openCreateVipPatientModal = () => {
    let component = (
      <CreateVipPatient
        modal={modalRef.current}
        fetchPatients={handleFetch}
      />
    );

    modalRef.current.open("Add VIP Patient", component, "md");
  };

  const openEditPatientModal = (item) => {
    let component = (
      <EditPatient
        item={item}
        modal={modalRef.current}
        fetchPatients={handleFetch}
      />
    );

    modalRef.current.open("Edit VIP Patient", component, "md");
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.target);
    setIsMenuOpen(true);
    setItem(item);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setAnchorEl(null);
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "VIP Patients" },
      ]}
    >
      <Card>
        <PageHeader
          title="New VIP Patients - Pending Check-in"
          subtitle={`${Array.isArray(data) ? data.length : 0} pending — VIP patients registered today who haven't checked in`}
          trailing={
            <React.Fragment>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateVipPatientModal}
                color="primary"
              >
                Add VIP Patient
              </Button>
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
          <Filters
            params={params}
            setParams={setParams}
            sx={{ mb: 2 }}
          />
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
              },
              {
                field: "vip_badge",
                headerName: "VIP",
                renderCell: (item) => (
                  <Chip
                    icon={<StarIcon />}
                    label="VIP"
                    color="warning"
                    variant="filled"
                    size="small"
                  />
                ),
              },
              {
                field: "full_name",
                headerName: "Patient Name",
              },
              {
                field: "id",
                headerName: "Patient Number",
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) => getAge(item.date_of_birth),
              },
              {
                field: "gender",
                headerName: "Gender",
              },
              {
                field: "phone",
                headerName: "Phone Number",
              },
              {
                field: "email",
                headerName: "Email",
              },
              {
                field: "address",
                headerName: "Address",
              },
              {
                field: "payment_mode_id",
                headerName: "Payment Mode",
                valueGetter: (item, index) => item.payment_mode?.name,
              },
              {
                field: "created_by",
                headerName: "Created By",
                valueGetter: (item, index) => item.creator?.full_name,
              },
              {
                field: "created_at",
                headerName: "Date Created",
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditPatientModal(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="contained"
                      size="small"
                      color="warning"
                      onClick={() =>
                        navigate(`/reception/patients/${item.id}/check-in`)
                      }
                    >
                      Priority Check-In
                    </Button>
                    <Tooltip title="More">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, item)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ),
              },
            ]}
            items={Array.isArray(data) ? data : []}
            itemCount={Array.isArray(data) ? data.length : 0}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            onPageSizeChange={(value) =>
              setParams({ ...params, per_page: value, page: 1 })
            }
          />
        </CardContent>
      </Card>
      {item ? (
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate(`/reception/patients/${item.id}/records/patient-file`);
            }}
          >
            View Records
          </MenuItem>
        </Menu>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default VipPatients;