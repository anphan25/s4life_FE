import { styled, Stack, Box } from '@mui/material';
import { Icon } from 'components';

export const DropZone = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  border: `1px dashed ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.grey[50],
  fontSize: '14px',
  borderRadius: 12,
  cursor: 'pointer',

  '& .file_input': {
    display: 'none',
  },
}));

export const ClearFile = styled(Icon)(({ theme }) => ({
  border: '0',
  background: 'transparent',
  color: theme.palette.error.main,
  width: '1.5rem',
  cursor: 'pointer',
  marginRight: '5px',
}));

export const ErrorMessageList = styled(Box)(({ theme }) => ({
  color: theme.palette.error.main,
  marginTop: '10px',

  '& ul': {
    listStyleType: 'none',
  },
}));

export const ImportTextDisplayStyle = styled(Stack)(({ theme }) => ({
  justifyContent: 'center',
  gap: '8px',

  '& .import_icon': { color: theme.palette.primary.main, fontSize: '32px' },
  '& .import_description': { color: theme.palette.primary.main },
  '& .import_require': { color: theme.palette.grey[600] },
}));
