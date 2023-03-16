import { Paper, Stack, styled } from '@mui/material';

export const PageTitle = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',

  [theme.breakpoints.down('sm')]: {
    display: 'block',
    '& .quarter_box': { width: '70%' },
  },
}));

export const StatisticTabContainer = styled(Paper)(({ theme }) => ({
  padding: '24px',
  backgroundColor: 'white',
  boxShadow: '0px 12px 23px rgba(62, 73, 84, 0.04)',
  width: '100%',
  borderRadius: '20px',

  '& .tab_title': {
    '& .tab_title--icon': {
      width: '40px',
      height: '40px',
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      borderRadius: '100%',
      padding: '8px',
      marginRight: '14px',
    },

    '& .tab_title--text': { fontWeight: 500, fontSize: '14px' },
  },

  '& .tab_content': {
    marginTop: '15px',

    '& .tab_content--number': {
      fontWeight: 600,
      fontSize: '28px',
      marginBottom: '10px',

      [theme.breakpoints.down('lg')]: {
        textAlign: 'center',
      },
    },
  },

  '& .status_box': {
    '& .status_title': {
      marginBottom: '8px',
      '& .status_icon': { marginRight: '8px', fontSize: '16px' },
      '& .fail': { color: theme.palette.error.main },
      '& .success': { color: theme.palette.success.main },
      '& .status_text': { fontWeight: 600, fontSize: '14px' },
    },

    '& .status_number': {
      textAlign: 'center',
      fontSize: '14px',
      color: theme.palette.grey[600],
    },
  },
}));

export const BloodVolume = styled(Paper)(({ theme }) => ({
  padding: '30px',
  borderRadius: '20px',

  '& .blood_volume--content': {
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },

  '& .blood-type': {
    padding: '12px',
    backgroundColor: theme.palette.primary.light,
    width: '60px',
    height: '60px',
    borderRadius: '10px',
    marginRight: '14px',

    [theme.breakpoints.down('lg')]: {
      marginRight: 0,
      marginBottom: '10px',
    },
  },

  '& .blood_volume--item': {
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },

    '& .blood-volume-number': { fontWeight: 600, fontSize: '20px' },
  },
}));
