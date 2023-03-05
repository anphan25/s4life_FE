import {
  Dialog,
  DialogTitle,
  Divider,
  Stack,
  styled,
  Box,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  Typography,
} from '@mui/material';
import React from 'react';
import { TreeView, TreeItem } from '@mui/lab';
import Slide from '@mui/material/Slide';
import { convertErrorCodeToMessage, groupDataByErrorCode } from 'utils';
import { Icon } from '../Icon';

const DialogContentStyle = styled(Box)(({ theme }) => ({
  padding: '10px 20px 20px',
  overflow: 'scroll',
}));

const TitleHeaderStyle = styled(Box)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  lineHeight: 1.2,
  [theme.breakpoints.down('sm')]: {
    fontSize: '15px',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const DetailAlertDialog = ({ onClose, successList, failedList, title, sx, isOpen, columns, ...other }) => {
  const fields = columns.map((item) => item.field);
  const errorCodeGroupedData = groupDataByErrorCode(failedList);
  const errorCodeKeys = Object.keys(errorCodeGroupedData);

  return (
    <Dialog TransitionComponent={Transition} sx={sx} {...other} open={isOpen} onClose={onClose}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems={'center'} gap={6}>
          <TitleHeaderStyle>{title}</TitleHeaderStyle>

          <Icon
            icon="times"
            onClick={onClose}
            sx={{
              color: 'grey.400',
              cursor: 'pointer',
              ':hover': {
                color: 'error.main',
              },
            }}
          />
        </Stack>
      </DialogTitle>
      <Divider sx={{ marginBottom: '10px' }} />

      <DialogContentStyle>
        <TreeView
          disableSelection
          defaultCollapseIcon={<Icon icon="solid-caret-down" />}
          defaultExpandIcon={<Icon icon="solid-caret-right" />}
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            width: '100%',
            '& .MuiTreeItem-label': { fontSize: '20px !important', fontWeight: 600, color: 'success.main' },
          }}
        >
          <TreeItem nodeId="1" label={`Thành công (${successList.length})`}>
            {successList.length > 0 ? (
              <TableContainer component={Box} sx={{ maxHeight: 300 }}>
                <Table sx={{ minWidth: 300 }}>
                  <TableHead>
                    <TableRow>
                      {columns?.map((item, i) => (
                        <TableCell key={i}>{item.name}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {successList?.map((item, i) => (
                      <TableRow key={i}>
                        {fields.map((field, i) => (
                          <TableCell key={i}>{item[field]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography fontWeight={500} sx={{ textAlign: 'center', marginTop: '10px' }}>
                Không có dữ liệu
              </Typography>
            )}
          </TreeItem>
        </TreeView>

        <TreeView
          disableSelection
          defaultCollapseIcon={<Icon icon="solid-caret-down" />}
          defaultExpandIcon={<Icon icon="solid-caret-right" />}
          sx={{
            marginTop: '15px',
            flexGrow: 1,
            overflowY: 'auto',
            width: '100%',
            '& .MuiTreeItem-label': { fontSize: '20px !important', fontWeight: 600, color: 'error.main' },
          }}
        >
          <TreeItem nodeId="1" label={`Thất bại (${failedList.length})`}>
            {failedList.length > 0 ? (
              errorCodeKeys?.map((errorCode, i) => (
                <TreeItem key={i} nodeId={`${i + 2}`} label={`${convertErrorCodeToMessage(errorCode)}`}>
                  <TableContainer component={Box} sx={{ maxHeight: 300 }}>
                    <Table sx={{ minWidth: 300 }}>
                      <TableHead>
                        <TableRow>
                          {columns?.map((head, i) => (
                            <TableCell key={i}>{head.name}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {errorCodeGroupedData[errorCode].map((item, i) => (
                          <TableRow key={i}>
                            {fields.map((field, i) => (
                              <TableCell key={i}> {item[field]}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TreeItem>
              ))
            ) : (
              <Typography fontWeight={500} sx={{ textAlign: 'center', marginTop: '10px' }}>
                Không có dữ liệu
              </Typography>
            )}
          </TreeItem>
        </TreeView>
      </DialogContentStyle>
    </Dialog>
  );
};
