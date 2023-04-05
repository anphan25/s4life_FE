import React, { useState, useEffect, useCallback } from 'react';
import { Box, Tooltip } from '@mui/material';
import { DataTable, FilterTab, HeaderBreadcumbs, SearchBar, Icon, CustomDialog } from 'components';
import { getBloodDonationApprovalRequests } from 'api';
import { errorHandler, formatDate, InputFilterSectionStyle, HeaderMainStyle, formatPhoneNumber } from 'utils';
import ApprovalDetail from './components/ApprovalDetail';
import { useSnackbar } from 'notistack';

const filterTabValues = [
  { label: 'Đang xử lý', value: 1 },
  { label: 'Đã xử lý', value: 2 },
];

function ApprovalList() {
  const { enqueueSnackbar } = useSnackbar();
  const [isApprovalDetailOpen, setIsApprovalDetailOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    isProcessing: true,
    searchKey: '',
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
        headerName: 'Số điện thoại',
        type: 'string',
        field: 'phoneNumber',
        width: 200,
      },
      {
        headerName: 'CCCD',
        type: 'string',
        field: 'nationalId',
        width: 120,
      },

      {
        headerName: 'CMND',
        type: 'string',
        field: 'citizenId',
        width: 100,
      },
      {
        headerName: 'Ngày tạo',
        type: 'date',
        field: 'addDate',
        width: 180,
      },
      {
        field: 'actions',
        type: 'actions',
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <div>
              <Tooltip title={params.row.isProcessing ? 'Phê duyệt' : 'Xem chi tiết'} placement="bottom">
                <Box>
                  <Icon
                    onClick={() => {
                      setSelectedDetailId(params.row.id);
                      handleApprovalDetailDialog();
                    }}
                    sx={{ cursor: 'pointer', fontSize: 18 }}
                    icon={params.row.isProcessing ? 'solid-file-text-edit' : 'solid-eye'}
                  />
                </Box>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    pageState: pageState,
  };

  const fetchBloodDonationApprovals = useCallback(async () => {
    setPageState((pre) => ({ ...pre, isLoading: true, data: [] }));

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
        citizenId: data?.user?.userInformation?.citizenId || '-',
        addDate: formatDate(data?.addDate, 4) || '-',
        phoneNumber: formatPhoneNumber(data?.user?.phoneNumber) || '-',
        isProcessing: data?.isProcessing,
      }));

      setPageState((pre) => ({ ...pre, data: dataRow, total: data.total }));
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setPageState((pre) => ({ ...pre, isLoading: false }));
    }
  }, [pageState.pageSize, pageState.page, pageState.searchKey, pageState.isProcessing]);

  useEffect(() => {
    fetchBloodDonationApprovals();
  }, [fetchBloodDonationApprovals]);

  const pageChangeHandler = (newPage) => {
    setPageState((old) => ({ ...old, page: newPage + 1 }));
  };
  const pageSizeChangeHandler = (newPageSize) => {
    setPageState((old) => ({ ...old, page: 1, pageSize: newPageSize }));
  };
  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, isProcessing: value === 1, page: 1, pageSize: 10 }));
  };

  const handleSearchBloodBag = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  const handleApprovalDetailDialog = () => {
    setIsApprovalDetailOpen(!isApprovalDetailOpen);
  };

  const approvalDetailDialogContent = () => {
    return (
      <Box>
        <ApprovalDetail id={selectedDetailId} />{' '}
      </Box>
    );
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
          <FilterTab
            tabs={filterTabValues}
            onChangeTab={handleFilterTabChange}
            defaultValue={pageState.isProcessing ? 1 : 2}
          />
          <InputFilterSectionStyle>
            <SearchBar
              sx={{ width: '100%' }}
              type={'number'}
              className="search-bar"
              placeholder={'Nhập số điện thoại'}
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

      {/* Approval Detail Dialog */}
      <CustomDialog
        isOpen={isApprovalDetailOpen}
        onClose={handleApprovalDetailDialog}
        title="Chi tiết yêu cầu"
        children={approvalDetailDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '95% !important', maxWidth: '95% !important', maxHeight: '90%' } }}
      />
    </>
  );
}

export default ApprovalList;
