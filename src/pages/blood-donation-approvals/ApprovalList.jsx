import React, { useState, useEffect, useCallback } from 'react';
import { Box, styled, Stack, MenuItem } from '@mui/material';
import { DataTable, FilterTab, HeaderBreadcumbs, SearchBar, Icon, CustomSnackBar, MoreMenuButton } from 'components';
import { getBloodDonationApprovalList } from 'api/BloodDonationApprovalApi';
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
  { label: 'Đang xử lý', value: 2 },
  { label: 'Chấp nhận', value: 1 },
  { label: 'Từ chối', value: 0 },
];

function ApprovalList() {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    filterMode: 2, // 0: Từ chối, 1: Đã phê duyệt, 2: Đang xử lý
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
        headerName: 'Số túi máu',
        field: 'bloodBagCode',
        type: 'number',
        width: 120,
      },
      {
        headerName: 'Họ và tên',
        field: 'name',
        type: 'string',
        minWidth: 200,
        flex: 1,
      },
      {
        headerName: 'Số lượng máu hiến',
        type: 'number',
        field: 'donationVolume',
        width: 400,
      },
      {
        headerName: 'Ngày lấy máu',
        type: 'date',
        field: 'donationDate',
        width: 300,
      },
      {
        field: 'actions',
        type: 'actions',
        hide: pageState.filterMode === 1 || pageState.filterMode === 0 ? true : false,
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <MoreMenuButton>
              <MenuItem
                onClick={() => {
                  // console.log('router', `blood-donation-approvals/${params.row.id}`);
                  navigate(`/blood-donation-approvals/${params.row.id}`);
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
        Status: pageState.filterMode,
        SearchKey: pageState.searchKey,
        Page: pageState.page,
        PageSize: pageState.pageSize,
      };

      const data = await getBloodDonationApprovalList(approvalParams);

      const dataRow = data?.items?.map((data) => ({
        id: data?.id || '-',
        name: data?.user?.userInformation?.fullName || '-',
        bloodBagCode: data?.bloodBagCode || '-',
        donationVolume: data?.donationVolume || '-',
        donationDate: formatDate(data?.donationDate, 4) || '-',
      }));

      setPageState({ ...pageState, data: dataRow, total: data.total });
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setPageState((old) => ({ ...old, isLoading: false }));
    }
  }, [pageState.pageSize, pageState.page, pageState.searchKey, pageState.filterMode]);

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
    setPageState((old) => ({ ...old, filterMode: value, page: 1, pageSize: 10 }));
  };

  const handleSearchBloodBag = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Xét duyệt thẻ hiến máu"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Xét duyệt thẻ hiến máu' }]}
        />
      </HeaderMainStyle>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <FilterTab tabs={filterTabValues} onChangeTab={handleFilterTabChange} defaultValue={pageState.filterMode} />
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
