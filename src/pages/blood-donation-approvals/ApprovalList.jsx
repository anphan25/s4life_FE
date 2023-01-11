import React, { useState, useEffect, useCallback } from 'react';
import { Box, styled, Stack, Button, Hidden } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { DataTable, FilterTab, HeaderBreadcumbs, SearchBar, Icon } from 'components';

import { getApprovalUsers } from 'api/UserApprovalApi';
import { errorHandler, formatDate } from 'utils';

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
  { label: 'Đang xử lý', value: 1 },
  { label: 'Chấp nhận', value: 2 },
  { label: 'Từ chối', value: 3 },
];

function ApprovalList() {
  const [searchParam, setSearchParam] = useState('');

  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    filterMode: 1,
    hospitalId: '',
  });

  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

  const volunteerGridOptions = {
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
        headerName: 'Họ tên',
        field: 'name',
        type: 'string',
        width: 400,
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
        hide: pageState.filterMode === 1 ? false : true,
        width: 50,
        sortable: false,
        filterable: false,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<Icon icon="file-text-edit" sx={{ fontSize: 18 }} />}
            onClick={() => {
              // setChangePassWordUserName(params.row.userName);
              // setChangePassWordId(params.row.id);
              // handleChangePasswordDialog();
            }}
            label="Xét duyệt"
            showInMenu
          />,
        ],
      },
    ],
    pageState: pageState,
  };

  const fetchUserListData = useCallback(async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));
    setAlert({});

    try {
      const getVolunteerParam = {
        Role: pageState.filterMode,
        SearchKey: searchParam,
        Page: pageState.page,
        PageSize: pageState.pageSize,
      };

      const data = await getApprovalUsers(getVolunteerParam);

      const dataRow =
        pageState.filterMode === 2
          ? data.items
              .filter((item) => {
                return item.statusId === 1;
              })
              .map((data, i) => ({
                id: data?.id,
                bloodBagCode: data?.bloodBagCode || '-',
                name: data?.user || '-',
                donationVolume: data?.donationVolume || '-',
                donationDate: formatDate(data?.donationDate, 4) || '-',
              }))
          : pageState.filterMode === 1
          ? data.items
              .filter((item) => {
                return item.statusId === 2;
              })
              .map((data, i) => ({
                id: data?.id,
                bloodBagCode: data?.bloodBagCode || '-',
                name: data?.user || '-',
                donationVolume: data?.donationVolume || '-',
                donationDate: formatDate(data?.donationDate, 4) || '-',
              }))
          : data.items
              .filter((item) => {
                return item.statusId === 3;
              })
              .map((data, i) => ({
                id: data?.id,
                bloodBagCode: data?.bloodBagCode || '-',
                name: data?.user || '-',
                donationVolume: data?.donationVolume || '-',
                donationDate: formatDate(data?.donationDate, 4) || '-',
              }));
      setPageState({ ...pageState, data: dataRow, total: data.total });
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setPageState((old) => ({ ...old, isLoading: false }));
    }
  }, [pageState.pageSize, pageState.page, searchParam, pageState.filterMode, pageState.hospitalId]);

  useEffect(() => {
    fetchUserListData();
  }, [fetchUserListData]);

  const pageChangeHandler = (newPage) => {
    setPageState((old) => ({ ...old, page: newPage + 1 }));
  };
  const pageSizeChangeHandler = (newPageSize) => {
    setPageState((old) => ({ ...old, pageSize: newPageSize }));
  };
  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, filterMode: value, page: 1, pageSize: 10 }));
    setSearchParam('');
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
            {/* {pageState.filterMode !== 1 && (
                          <AsyncAutocompleteFilter
                            sx={{width:' 50%'}}
                            placeholder="Nhập số túi máu"
                            onInput={handleSearchHospitalToFilter}
                            onSelect={handleChooseHospital}
                            // list={}
                            isLazyLoad={true}
                            onScrollToBottom={handleScrollToBottomToFilter}
                            getOptionLabel={(option)=> {
                              return option?.name || '';
                            }}
                          />
                        )} */}

            <SearchBar
              sx={{ width: '100%' }}
              type={'number'}
              className="search-bar"
              placeholder={'Nhập số Túi máu'}
              //onSubmit={handleUserSearch}
            />
          </InputFilterSectionStyle>
        </Box>
        <DataTable
          gridOptions={pageState.filterMode === 1 ? volunteerGridOptions : volunteerGridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Box>
    </>
  );
}

export default ApprovalList;
