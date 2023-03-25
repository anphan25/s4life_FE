import React, { useState } from 'react';
import { Box, Paper, styled, Popover, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NotFoundIcon } from 'assets';
import { Icon } from './Icon';

const containerDataGrid = {
  width: '100%',
};

function DownIcon() {
  return <Icon icon="arrow-down-small" sx={{ fontSize: 16 }} />;
}

function UpIcon() {
  return <Icon icon="arrow-up-small" sx={{ fontSize: 16 }} />;
}

function MoreActionsIcon() {
  return <Icon icon="more-horizontal-circle" sx={{ fontSize: 20 }} />;
}

const StyledGridOverlay = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
}));

function CustomNoRowsOverlay() {
  return (
    <StyledGridOverlay>
      <NotFoundIcon height={200} width={200} />
      <Typography fontSize={14} fontWeight={500} sx={{ mt: 1 }}>
        Không tìm thấy dữ liệu
      </Typography>
    </StyledGridOverlay>
  );
}

export const DataTable = ({ gridOptions, onPageChange, onPageSizeChange, disableFilter, ...props }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [value, setValue] = useState('');

  const handlePopoverOpen = (event) => {
    const field = event.currentTarget.dataset.field;
    const id = event.currentTarget.parentElement.dataset.id;
    const data = gridOptions.pageState.data;
    const targetRow = data.find((row) => {
      let targetRow = '';
      if (typeof row.id === 'string') {
        if (row.id === id + '') targetRow = row;
      }

      if (typeof row.id === 'number') {
        if (row.id === id * 1) targetRow = row;
      }

      return targetRow;
    });

    if (
      field === 'id' ||
      field === 'actions' ||
      field === 'no' ||
      field === 'addDate' ||
      field === 'time' ||
      field.includes('id') ||
      field.includes('Id') ||
      typeof targetRow[field] === 'boolean'
    ) {
      return;
    }

    const targetCell = targetRow[field];

    setValue(targetCell);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Paper sx={{ width: '100%', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', px: 3 }}>
      <Box sx={containerDataGrid}>
        <DataGrid
          {...props}
          rowHeight={60}
          disableColumnMenu
          autoHeight
          sx={{
            minHeight: 550,
            '.MuiPopper-root': {
              boxShadow: '0px 12px 23px rgba(62, 73, 84, 0.04) !important',
              borderRadius: 12,
              padding: '12px',
            },
          }}
          columns={gridOptions.columns}
          rows={gridOptions.pageState.data}
          rowCount={gridOptions.pageState.total}
          loading={gridOptions.pageState.isLoading}
          pagination
          page={gridOptions.pageState.page - 1}
          pageSize={gridOptions.pageState.pageSize}
          paginationMode="server"
          rowsPerPageOptions={[5, 10, 20, 50]}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          components={{
            NoRowsOverlay: CustomNoRowsOverlay,
            ColumnSortedDescendingIcon: DownIcon,
            ColumnSortedAscendingIcon: UpIcon,
            MoreActionsIcon,
          }}
          disableColumnFilter={disableFilter}
          componentsProps={{
            cell: {
              onMouseEnter: handlePopoverOpen,
              onMouseLeave: handlePopoverClose,
            },
          }}
          disableSelectionOnClick
        />
        <Popover
          sx={{
            pointerEvents: 'none',
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Typography sx={{ fontSize: '13px' }}>{`${value}`}</Typography>
        </Popover>
      </Box>
    </Paper>
  );
};
