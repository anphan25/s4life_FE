// ----------------------------------------------------------------------

export default function Autocomplete(theme) {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            padding: "0",
          },
        },
        paper: {
          boxShadow: "none",
        },
        listbox: {
          padding: "16px",
          "& .MuiAutocomplete-option": {
            padding: "12px",
            borderRadius: "16px",
          },
        },
      },
    },
  };
}
