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
import CreateMarketingStrategy from "./CreateMarketingStrategy";
import EditMarketingStrategy from "./EditMarketingStrategy";
import MarketingStrategyDetails from "./MarketingStrategyDetails";

import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError } from "../../../helpers";

const MarketingStrategies = () => {
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined,
    q: undefined,
    created_by: undefined,
    start_date: new Date(),
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/marketing/marketing-strategies",
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
    document.title = `Marketing Strategies - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openCreateMarketingStrategyModal = () => {
    let component = (
      <CreateMarketingStrategy
        modal={modalRef.current}
        fetchMarketingStrategies={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Marketing Strategy", component, "md");
  };

  const openEditMarketingStrategyModal = (item) => {
    let component = (
      <EditMarketingStrategy
        item={item}
        modal={modalRef.current}
        fetchMarketingStrategies={handleFetch}
      />
    );

    modalRef.current.open("Edit Marketing Strategy", component, "md");
  };

  const openMarketingStrategyDetailsModal = (item) => {
    let component = (
      <MarketingStrategyDetails
        item={item}
        modal={modalRef.current}
      />
    );

    modalRef.current.open("Marketing Strategy Details", component, "md");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "warning";
      case "Closed":
        return "success";
    }

    return "neutral";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Marketing Strategies" },
      ]}
    >
      <Card>
        <PageHeader
          title="Marketing Strategies"
          trailing={
            <React.Fragment>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateMarketingStrategyModal}
              >
                New Marketing Strategy
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
                field: "title",
                headerName: "Title",
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
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={getStatusColor(item.status)}
                    label={item.status}
                  />
                ),
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
                        onClick={() => openEditMarketingStrategyModal(item)}
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

export default MarketingStrategies;
