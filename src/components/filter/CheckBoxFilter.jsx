import { Select, Checkbox, FormControl, ListItemText, MenuItem, Box, TextField } from '@mui/material';
import { useState, useRef } from 'react';

// Model of options: [{label:..., value:...},...]
export const CheckBoxFilter = ({ options, onCheck, sx, placeHolder, ...props }) => {
  const [values, setValues] = useState([]);
  const [checkboxOptions, setCheckboxOptions] = useState(options);
  const [searchValue, setSearchValue] = useState('');
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
      return checkboxOptions.find(({ value }) => value === item).label;
    });
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);

    console.log(
      'checkboxOptions.filter((option) => option.label.includes(searchValue))',
      checkboxOptions.filter((option) => option.label.includes(searchValue))
    );

    setCheckboxOptions(checkboxOptions.filter((option) => option.label.includes(searchValue)));
  };

  return (
    <Box sx={sx}>
      <FormControl sx={{ width: '100%' }}>
        <TextField value={searchValue} onChange={handleSearch} />
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
          {checkboxOptions.map(({ label, value }) => (
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
