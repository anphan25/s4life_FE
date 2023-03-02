import React, { useState, useEffect, useCallback } from 'react';
import { Box, MenuItem } from '@mui/material';
import {
  DataTable,
  FilterTab,
  HeaderBreadcumbs,
  SearchBar,
  Icon,
  CustomSnackBar,
  MoreMenuButton,
  CustomDialog,
} from 'components';
import { getBloodDonationApprovalRequests } from 'api';
import { errorHandler, formatDate, InputFilterSectionStyle, HeaderMainStyle } from 'utils';
import ApprovalDetail from './components/ApprovalDetail';

const filterTabValues = [
  { label: 'Đang xử lý', value: true },
  { label: 'Đã xử lý', value: false },
];

function ApprovalList() {
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
        width: 200,
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
            <MoreMenuButton>
              <MenuItem
                onClick={() => {
                  setSelectedDetailId(params.row.id);
                  handleApprovalDetailDialog();
                }}
              >
                <Icon icon="file-text-edit" sx={{ fontSize: 18 }} />
                {params.row.isProcessing ? 'Xét duyệt' : 'Xem chi tiết'}
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
        isProcessing: data?.isProcessing,
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
    setPageState((old) => ({ ...old, page: 1, pageSize: newPageSize }));
  };
  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, isProcessing: value, page: 1, pageSize: 10 }));
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
          <FilterTab tabs={filterTabValues} onChangeTab={handleFilterTabChange} defaultValue={pageState.isProcessing} />
          <InputFilterSectionStyle>
            <SearchBar
              sx={{ width: '100%' }}
              type={'number'}
              className="search-bar"
              placeholder={'Nhập CCCD/CMND'}
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
        sx={{ '& .MuiDialog-paper': { maxWidth: '90% !important', maxHeight: '90%' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </>
  );
}

export default ApprovalList;
