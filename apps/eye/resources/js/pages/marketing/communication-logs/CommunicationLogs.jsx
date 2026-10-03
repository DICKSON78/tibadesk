import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";
import CreateCommunicationLog from "./CreateCommunicationLog";
import EditCommunicationLog from "./EditCommunicationLog";

import { useFetch, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  getFileExtension,
} from "../../../helpers";

const CommunicationLogs = () => {
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
    communication_type: undefined,
    created_by: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/marketing/communication-logs",
    {
      ...params,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Communication Logs - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openCreateCommunicationLogModal = () => {
    let component = (
      <CreateCommunicationLog
        modal={modalRef.current}
        fetchCommunicationLogs={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Communication Log", component);
  };

  const openEditCommunicationLogModal = (item) => {
    let component = (
      <EditCommunicationLog
        item={item}
        modal={modalRef.current}
        fetchCommunicationLogs={handleFetch}
      />
    );

    modalRef.current.open("Edit Communication Log", component);
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Communication Logs" },
      ]}
    >
      <Card>
        <PageHeader
          title="Communication Logs"
          trailing={
            <React.Fragment>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateCommunicationLogModal}
              >
                New Communication Log
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
                field: "customer_name",
                headerName: "Customer Name",
              },
              {
                field: "customer_phone",
                headerName: "Customer Phone",
              },
              {
                field: "customer_email",
                headerName: "Customer Email",
              },
              {
                field: "description",
                headerName: "Description",
              },
              {
                field: "communication_type",
                headerName: "Comm. Type",
              },
              {
                field: "communication_direction",
                headerName: "Comm. Direction",
              },
              {
                field: "attachment",
                headerName: "Attachment",
                renderCell: (item) =>
                  item.attachment ? (
                    <Tooltip title="View attachment">
                      <Chip
                        size="small"
                        color="purple"
                        label={getFileExtension(item.attachment)}
                        clickable
                        onClick={() =>
                          window.open(`/${item.attachment}`, "_blank")
                        }
                      />
                    </Tooltip>
                  ) : null,
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
                        onClick={() => openEditCommunicationLogModal(item)}
                      >
                        <EditIcon fontSize="small" />
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
      <Modal ref={modalRef} />
    </Page>
  );
};

export default CommunicationLogs;
