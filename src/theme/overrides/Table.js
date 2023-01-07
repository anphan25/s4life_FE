export default function Table(theme) {
  return {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: 'none',
        },
        head: {
          color: theme.palette.grey[900],
          backgroundColor: theme.palette.grey[100],
          fontWeight: 600,
          fontSize: '13px',
          '&:first-of-type': {
            paddingLeft: theme.spacing(3),
            borderTopLeftRadius: 16,
            boxShadow: 'none',
          },
          '&:last-of-type': {
            paddingRight: theme.spacing(3),
            borderTopRightRadius: 16,
            boxShadow: 'none',
          },
        },
        stickyHeader: {
          backgroundColor: theme.palette.grey[100],
          backgroundImage: `linear-gradient(to bottom, ${theme.palette.background} 0%, ${theme.palette.background} 100%)`,
        },
        body: {
          fontSize: 12,
          '&:first-of-type': {
            paddingLeft: theme.spacing(3),
          },
          '&:last-of-type': {
            paddingRight: theme.spacing(3),
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: `solid 1px ${theme.palette.grey[200]}`,
        },
        toolbar: {
          height: 64,
        },
        select: {
          paddingRight: '24px !important',
          '&:focus': {
            borderRadius: 6,
          },
        },
        selectIcon: {
          width: 16,
          height: 16,
        },
      },
    },
  };
}
