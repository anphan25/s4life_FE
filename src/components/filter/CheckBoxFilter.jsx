import { Select, Checkbox, FormControl, ListItemText, MenuItem, Box } from '@mui/material';
import { useState, useRef } from 'react';

// Model of options: [{label:..., value:...},...]
export const CheckBoxFilter = ({ options, onCheck, sx, placeHolder, ...props }) => {
  const [values, setValues] = useState([]);
  const checkingTimeoutRef = useRef(null);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setValues(value);

    if (!onCheck) return;

    if (checkingTimeoutRef.current) {
      clearTimeout(checkingTimeoutRef.current);
    }

    checkingTimeoutRef.current = setTimeout(() => {
      onCheck(value);
    }, 1000);
  };

  const convertValueToLabel = (list) => {
    return list.map((item) => {
      return options.find(({ value }) => value === item).label;
    });
  };

  return (
    <Box sx={sx}>
      <FormControl sx={{ width: '100%' }}>
        <Select
          {...props}
          displayEmpty={true}
          renderValue={(selectedValues) => {
            if (selectedValues.length === 0) {
              return placeHolder;
            }
            return convertValueToLabel(selectedValues).join(', ');
          }}
          multiple
          value={values}
          onChange={(e) => {
            handleChange(e);
          }}
        >
          {options.map(({ label, value }) => (
            <MenuItem key={value} value={value}>
              <Checkbox checked={values?.indexOf(value) > -1} />
              <ListItemText primary={label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
