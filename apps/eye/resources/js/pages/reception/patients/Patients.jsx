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
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";
import CreatePatient from "./CreatePatient";
import EditPatient from "./EditPatient";

import { useFetch, useToast } from "../../../hooks";
import { formatError, getAge } from "../../../helpers";

const Patients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();

  const [item, setItem] = useState();
  const [anchorEl, setAnchorEl] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    id: undefined,
    name: undefined,
    phone: undefined,
    gender: undefined,
    payment_mode_id: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patients",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Patients - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openCreatePatientModal = () => {
    let component = (
      <CreatePatient
        modal={modalRef.current}
        fetchPatients={handleFetch}
      />
    );

    modalRef.current.open("Create Patient", component, "md");
  };

  const openEditPatientModal = (item) => {
    let component = (
      <EditPatient
        item={item}
        modal={modalRef.current}
        fetchPatients={handleFetch}
      />
    );

    modalRef.current.open("Edit Patient", component, "md");
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
        { title: "Patients/Customers" },
      ]}
    >
      <Card>
        <PageHeader
          title="Registered Patients"
          trailing={
            <React.Fragment>
              <Tooltip title="Refresh List">
                <IconButton
                  onClick={handleFetch}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreatePatientModal}
              >
                New Patient
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
                field: "full_name",
                headerName: "Patient Name",
                renderCell: (item) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.full_name}
                    {item.is_vip && (
                      <Chip
                        icon={<StarIcon />}
                        label="VIP"
                        color="warning"
                        size="small"
                      />
                    )}
                  </div>
                ),
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
                headerName: "Email Address",
                valueGetter: (item, index) => item.email || "Not provided",
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
                      onClick={() =>
                        navigate(`/reception/patients/${item.id}/check-in`)
                      }
                    >
                      Check-In
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
            items={data.data}
            itemCount={data.total}
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

export default Patients;