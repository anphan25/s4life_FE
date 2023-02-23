import { Box, Typography, Button, FormControl, Select, MenuItem } from '@mui/material';
import { DataTable, FilterTab, FromToDateFilter, SearchBar, CustomSnackBar, CustomDialog, Icon } from 'components';
import { useState, useCallback, useEffect } from 'react';
import { errorHandler, formatDate } from 'utils';
import { useParams } from 'react-router-dom';
import { getEventRegistrations, updateBloodType } from 'api';
import moment from 'moment';
import { GridActionsCellItem } from '@mui/x-data-grid';
import LoadingButton from '@mui/lab/LoadingButton';
import { BLOOD_TYPE, convertBloodTypeLabel, DialogButtonGroupStyle, InputFilterSectionStyle } from 'utils';
import { useSelector } from 'react-redux';

const BloodDonationHistory = () => {
  const { eventId } = useParams();
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    status: 2, //Cancelled = 1 ,NotYetAttended = 2, Attended = 3,
    searchPhoneNumber: '',
    dateFrom: null,
    dateTo: null,
  });
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const [isUpdateBloodTypeDialogOpen, setIsUpdateBloodTypeDialogOpen] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [bloodType, setBloodType] = useState('');
  const [updateBloodTypeParams, setUpdateBloodTypeParams] = useState({
    userInformationId: '',
    bloodTypeId: '',
    isRhNegative: '',
  });
  let user = useSelector((state) => state.auth.auth?.user);

  const gridOptions = {
    columns: [
      {
        headerName: 'STT',
        field: 'no',
        width: 10,
        align: 'center',
      },
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Số máu',
        field: 'fullName',
        type: 'string',
        minWidth: 300,
        flex: 1,
      },

      {
        headerName: 'Số túi/Số chứng nhận',
        field: 'phoneNumber',
        type: 'string',
        width: 300,
      },
      {
        headerName: 'Ngày hiến',
        field: 'bloodType',
        type: 'date',
        width: 300,
      },
    ],
    pageState: pageState,
  };

  const pageChangeHandler = (newPage) => {
    setPageState((old) => ({ ...old, page: newPage + 1 }));
  };

  const pageSizeChangeHandler = (newPageSize) => {
    setPageState((old) => ({ ...old, pageSize: newPageSize }));
  };

  const handleFromToDateFilter = (params) => {
    setPageState((old) => ({ ...old, page: 1, dateFrom: params.startDate, dateTo: params.endDate }));
  };

  const handleSearchVolunteerPhoneNumber = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchPhoneNumber: searchValue.searchTerm }));
  };

  const handleUpdateBloodTypeDialog = () => {
    setIsUpdateBloodTypeDialogOpen(!isUpdateBloodTypeDialogOpen);
  };

  return (
    <>
      <Typography variant="h4" sx={{ marginBottom: '10px', pl: 3 }}>
        Lịch sử hiến máu
      </Typography>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <InputFilterSectionStyle>
            <FromToDateFilter onChange={handleFromToDateFilter} sx={{ width: '50%' }} />
          </InputFilterSectionStyle>
        </Box>
        <DataTable
          gridOptions={gridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Box>

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </>
  );
};

export default BloodDonationHistory;
