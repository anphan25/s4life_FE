export function responsiveFontSizes({ sm, md, lg }) {
  return {
    "@media (min-width:600px)": {
      fontSize: sm,
    },
    "@media (min-width:900px)": {
      fontSize: md,
    },
    "@media (min-width:1200px)": {
      fontSize: lg,
    },
  };
}
