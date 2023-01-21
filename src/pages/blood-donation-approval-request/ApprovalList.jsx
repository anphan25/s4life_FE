import React, { useState, useEffect, useCallback } from 'react';
import { Box, styled, Stack, MenuItem } from '@mui/material';
import { DataTable, FilterTab, HeaderBreadcumbs, SearchBar, Icon, CustomSnackBar, MoreMenuButton } from 'components';
import { getBloodDonationApprovalRequests } from 'api';
import { errorHandler, formatDate } from 'utils';
import { useNavigate } from 'react-router-dom';

const HeaderMainStyle = styled(Stack)(({ theme }) => ({
  marginBottom: '20px',
  justifyContent: 'space-between',

  flexDirection: 'row',

  [theme.breakpoints.up('sm')]: {
    alignItems: 'center',
  },

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    justifyContent: 'start',
    gap: '20px',
  },
}));
const InputFilterSectionStyle = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  margin: '20px',
  gap: 10,

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));
const filterTabValues = [
  { label: 'Đang xử lý', value: true },
  { label: 'Đã xử lý', value: false },
];

function ApprovalList() {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    isProcessing: true,
    searchKey: '',
  });

  const navigate = useNavigate();

  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

  const bloodDonationApprovalGridOptions = {
    columns: [
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Họ và tên',
        field: 'name',
        type: 'string',
        minWidth: 200,
        flex: 1,
      },
      {
        headerName: 'CMND/CCCD',
        type: 'number',
        field: 'nationalId',
        width: 400,
      },
      {
        headerName: 'Ngày tạo',
        type: 'date',
        field: 'addDate',
        width: 300,
      },
      {
        field: 'actions',
        type: 'actions',
        hide: !pageState.isProcessing,
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <MoreMenuButton>
              <MenuItem
                onClick={() => {
                  navigate(`/blood-donation-approval-request/${params.row.id}`);
                }}
              >
                <Icon icon="file-text-edit" sx={{ fontSize: 18 }} />
                Xét duyệt
              </MenuItem>
            </MoreMenuButton>
          );
        },
      },
    ],
    pageState: pageState,
  };

  const fetchBloodDonationApprovals = useCallback(async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));
    setAlert({});

    try {
      const approvalParams = {
        IsProcessing: pageState.isProcessing,
        SearchKey: pageState.searchKey,
        Page: pageState.page,
        PageSize: pageState.pageSize,
      };

      const data = await getBloodDonationApprovalRequests(approvalParams);

      const dataRow = data?.items?.map((data) => ({
        id: data?.id || '-',
        name: data?.user?.userInformation?.fullName || '-',
        nationalId: data?.user?.userInformation?.nationalId || '-',
        addDate: formatDate(data?.addDate, 4) || '-',
      }));

      setPageState({ ...pageState, data: dataRow, total: data.total });
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setPageState((old) => ({ ...old, isLoading: false }));
    }
  }, [pageState.pageSize, pageState.page, pageState.searchKey, pageState.isProcessing]);

  useEffect(() => {
    fetchBloodDonationApprovals();
  }, [fetchBloodDonationApprovals]);

  const pageChangeHandler = (newPage) => {
    setPageState((old) => ({ ...old, page: newPage + 1 }));
  };
  const pageSizeChangeHandler = (newPageSize) => {
    setPageState((old) => ({ ...old, pageSize: newPageSize }));
  };
  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, isProcessing: value, page: 1, pageSize: 10 }));
  };

  const handleSearchBloodBag = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Yêu cầu phê duyệt thẻ hiến máu"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Yêu cầu phê duyệt thẻ hiến máu' }]}
        />
      </HeaderMainStyle>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <FilterTab tabs={filterTabValues} onChangeTab={handleFilterTabChange} defaultValue={pageState.isProcessing} />
          <InputFilterSectionStyle>
            <SearchBar
              sx={{ width: '100%' }}
              type={'number'}
              className="search-bar"
              placeholder={'Nhập số Túi máu'}
              onSubmit={handleSearchBloodBag}
            />
          </InputFilterSectionStyle>
        </Box>
        <DataTable
          gridOptions={bloodDonationApprovalGridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Box>

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </>
  );
}

export default ApprovalList;
