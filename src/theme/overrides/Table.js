export default function Table(theme) {
  return {
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.selected,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "none",
        },
        head: {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.neutral,
          "&:first-of-type": {
            paddingLeft: theme.spacing(3),
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            boxShadow: `inset 8px 0 0 ${theme.palette.grey[200]}`,
          },
          "&:last-of-type": {
            paddingRight: theme.spacing(3),
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            boxShadow: `inset -8px 0 0 ${theme.palette.grey[200]}`,
          },
        },
        stickyHeader: {
          backgroundColor: theme.palette.grey[200],
          backgroundImage: `linear-gradient(to bottom, ${theme.palette.background} 0%, ${theme.palette.background} 100%)`,
        },
        body: {
          "&:first-of-type": {
            paddingLeft: theme.spacing(3),
          },
          "&:last-of-type": {
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
          "&:focus": {
            borderRadius: 16,
          },
        },
        selectIcon: {
          width: 20,
          height: 20,
          marginTop: -4,
        },
      },
    },
  };
}
