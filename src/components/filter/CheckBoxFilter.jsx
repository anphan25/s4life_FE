import {
  Select,
  Checkbox,
  FormControl,
  ListItemText,
  MenuItem,
  Box,
  TextField,
  ListSubheader,
  InputAdornment,
  Button,
  Stack,
} from '@mui/material';
import { useState, useRef } from 'react';
import { Icon } from 'components';
// Model of options: [{label:..., value:...},...]
export const CheckBoxFilter = ({ options, onCheck, sx, placeHolder, disableOperation, ...props }) => {
  const [values, setValues] = useState([]);
  const [checkboxOptions, setCheckboxOptions] = useState(options);
  const [searchValue, setSearchValue] = useState('');
  const checkingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const typingTimeoutRef = useRef(null);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    setValues(value);

    if (!onCheck) return;

    if (checkingTimeoutRef?.current) {
      clearTimeout(checkingTimeoutRef?.current);
    }

    checkingTimeoutRef.current = setTimeout(() => {
      onCheck(removeNullElement(value));
    }, 500);
  };

  const convertValueToLabel = (list) => {
    return list?.map((item) => {
      return checkboxOptions?.find(({ value }) => value === item)?.label;
    });
  };

  const removeNullElement = (list) => {
    return list?.filter((item) => item);
  };

  const handleSearch = (e) => {
    if (typingTimeoutRef?.current) {
      clearTimeout(typingTimeoutRef?.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setSearchValue(e.target.value);
    }, 300);
  };

  const handleClearAll = () => {
    setValues([null]);
    onCheck([]);
  };

  return (
    <Box sx={sx}>
      <FormControl sx={{ width: '100%' }}>
        <Select
          {...props}
          onAnimationEnd={() => inputRef?.current?.focus()}
          displayEmpty={true}
          renderValue={(selectedValues) => {
            const noNullSelectedValues = removeNullElement(selectedValues);

            if (noNullSelectedValues.length === 0) {
              return placeHolder;
            }
            return convertValueToLabel(selectedValues).join(', ');
          }}
          disabled={disableOperation}
          multiple
          value={values}
          onChange={(e) => {
            handleChange(e);
          }}
          onClose={() => setSearchValue('')}
          MenuProps={{
            autoFocus: false,
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
            getContentAnchorEl: null,
          }}
        >
          <ListSubheader>
            <TextField
              autoFocus
              fullWidth
              onChange={handleSearch}
              ref={inputRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="search" />
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Escape') {
                  // Prevents autoselecting item while typing (default Select behaviour)
                  e.stopPropagation();
                }
              }}
            />
          </ListSubheader>
          {checkboxOptions
            .filter((option) => option.label.toLowerCase().includes(searchValue.toLowerCase()))
            .map(({ label, value }) => (
              <MenuItem key={value} value={value} disabled={disableOperation}>
                <Checkbox checked={values?.indexOf(value) > -1} disabled={disableOperation} />
                <ListItemText primary={label} />
              </MenuItem>
            ))}
          <Stack justifyContent="flex-end">
            <Button sx={{ marginLeft: 'auto' }} onClick={handleClearAll}>
              Bỏ chọn
            </Button>
          </Stack>
        </Select>
      </FormControl>
    </Box>
  );
};
