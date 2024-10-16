import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ErrorPage, Table } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';

import { useDeleteDialog, useDrawer } from '@janus-idp/shared-react';

import { useAddedRepositories } from '../../hooks/useAddedRepositories';
import { AddRepositoryData } from '../../types';
import DeleteRepositoryDialog from './DeleteRepositoryDialog';
import EditCatalogInfo from './EditCatalogInfo';
import { columns } from './RepositoriesListColumns';
import { RepositoriesListToolbar } from './RepositoriesListToolbar';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const RepositoriesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { openDialog, setOpenDialog, deleteComponent } = useDeleteDialog();
  const { openDrawer, setOpenDrawer, drawerData } = useDrawer();
  const [pageNumber, setPageNumber] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [isMounted, setIsMounted] = React.useState(false);
  const classes = useStyles();

  const {
    data: importJobs,
    error: errJobs,
    loading: loadingJobs,
    retry,
  } = useAddedRepositories(pageNumber + 1, rowsPerPage);

  const closeDialog = () => {
    setOpenDialog(false);
    retry();
  };

  const closeDrawer = () => {
    searchParams.delete('repository');
    navigate({
      pathname: location.pathname,
      search: `?${searchParams.toString()}`,
    });
    setOpenDrawer(false);
  };

  React.useEffect(() => {
    if (!isMounted && !loadingJobs) {
      setIsMounted(true);
    }
  }, [loadingJobs, isMounted]);

  if (Object.keys(errJobs || {}).length > 0) {
    return <ErrorPage status={errJobs.name} statusMessage={errJobs.message} />;
  }

  return (
    <>
      <RepositoriesListToolbar />
      <Table
        onPageChange={(page: number, pageSize: number) => {
          setPageNumber(page);
          setRowsPerPage(pageSize);
        }}
        onRowsPerPageChange={(pageSize: number) => {
          setRowsPerPage(pageSize);
        }}
        title={
          (loadingJobs && !isMounted) || !importJobs
            ? 'Added repositories'
            : `Added repositories (${importJobs.length})`
        }
        options={{ padding: 'default', search: true, paging: true }}
        data={importJobs ?? []}
        isLoading={loadingJobs && !isMounted}
        columns={columns}
        emptyContent={
          <div
            data-testid="added-repositories-table-empty"
            className={classes.empty}
          >
            No records found
          </div>
        }
      />
      {openDrawer && (
        <EditCatalogInfo
          open={openDrawer}
          onClose={closeDrawer}
          importStatus={drawerData}
        />
      )}
      {openDialog && (
        <DeleteRepositoryDialog
          open={openDialog}
          closeDialog={closeDialog}
          repository={deleteComponent as AddRepositoryData}
        />
      )}
    </>
  );
};
