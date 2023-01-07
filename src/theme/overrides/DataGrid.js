export default function DataGrid(theme) {
  return {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid transparent`,
          '& .MuiTablePagination-root': {
            borderTop: 0,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.grey[100],
            color: theme.palette.grey[900],
            fontSize: '13px',
            fontWeight: 600,
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
          },
          '& .MuiDataGrid-virtualScroller': {
            minHeight: '550px',
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: theme.spacing(2),
            '& .MuiButton-root': {
              marginRight: theme.spacing(1.5),
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.grey[200],
              },
            },
          },
          '& .MuiDataGrid-cell, .MuiDataGrid-columnsContainer': {
            borderBottom: `1px solid ${theme.palette.grey[200]}`,
            fontSize: '13px',
            ':focus': {
              outline: 'none',
            },
            ':focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-columnSeparator': {
            color: 'transparent',
          },
          '& .MuiDataGrid-columnHeader': {
            gap: '8px',
            ':focus': {
              outline: 'none',
            },
            ':focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-columnHeader[data-field="__check__"]': {
            padding: 0,
          },
        },
      },
    },
    MuiGridFilterForm: {
      styleOverrides: {
        root: {
          padding: theme.spacing(1.5, 0),
          '& .MuiFormControl-root': {
            margin: theme.spacing(0, 0.5),
          },
          '& .MuiInput-root': {
            marginTop: theme.spacing(3),
            '&::before, &::after': {
              display: 'none',
            },
            '& .MuiNativeSelect-select, .MuiInput-input': {
              ...theme.typography.body2,
              padding: theme.spacing(0.75, 1),
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.background,
            },
            '& .MuiSvgIcon-root': {
              right: 4,
            },
          },
        },
      },
    },
    MuiGridPanelFooter: {
      styleOverrides: {
        root: {
          padding: theme.spacing(2),
          justifyContent: 'flex-end',
          '& .MuiButton-root': {
            '&:first-of-type': {
              marginRight: theme.spacing(1.5),
              color: theme.palette.grey[900],
            },
          },
        },
      },
    },
  };
}
