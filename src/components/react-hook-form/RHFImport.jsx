import { Controller } from 'react-hook-form';
import { FormControl, TextField, styled, Stack, Box, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { FaFileCsv } from 'react-icons/fa';
import Papa from 'papaparse';
import moment from 'moment';

const DropZone = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 0 10px',
  border: `1px dashed ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.grey[200],
  fontSize: '14px',
  cursor: 'pointer',

  '& .file_input': {
    display: 'none',
  },
}));

const ClearFile = styled(AiOutlineClose)(({ theme }) => ({
  border: '0',
  background: 'transparent',
  color: 'red',
  width: '1.5rem',
  cursor: 'pointer',
  marginRight: '5px',
}));

const ErrorMessageList = styled(Box)(({ theme }) => ({
  color: theme.palette.error.main,
  marginTop: '10px',

  '& ul': {
    listStyleType: 'none',
  },
}));

const ImportTextDisplayStyle = styled(Stack)(({ theme }) => ({
  justifyContent: 'center',
  gap: '8px',

  '& .import_icon': { color: theme.palette.primary.main, fontSize: '32px' },
  '& .import_description': { color: theme.palette.primary.main },
  '& .import_require': { color: theme.palette.grey[600] },
}));

export const RHFImport = ({ control, label, name, onImport, ...props }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const { acceptedFiles, fileRejections, getRootProps, getInputProps, isDragAccept } = useDropzone({
    accept: {
      'text/csv': [],
    },
    maxSize: 1000000,
    maxFiles: 1,
    minSize: 0,
    multiple: false,
  });

  const CustomizeErrorMessage = (code) => {
    switch (code) {
      case 'file-invalid-type': {
        return 'Vui lòng chọn file định dạng csv';
      }
      case 'file-too-large': {
        return 'Vui lòng chọn file có kích cỡ bé hơn hoặc bằng 500KB';
      }

      default: {
        return 'Lỗi khi chọn file';
      }
    }
  };

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <ErrorMessageList>
      <ul className="error-ul">
        {errors.map((e, i) => (
          <li key={i}>{CustomizeErrorMessage(e.code)}</li>
        ))}
      </ul>
    </ErrorMessageList>
  ));

  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];

  //Mode 1: get startTime, Mode 2: get endTime
  const getTimeFromDay = (dayString, mode) => {
    const timeArr = dayString.split('-');
    const timeSplit = timeArr[mode - 1].trim().split(':');

    return moment().hour(timeSplit[0]).minute(timeSplit[1]).second(0).format('HH:mm:ss');
  };

  const convertDataToObject = (obj) => {
    for (const prop in obj) {
      if (!obj[prop]) {
        delete obj[prop];
      }
    }

    const openingTime = daysOfWeek.map((day) => {
      return obj[day]
        ? {
            day: day,
            startTime: getTimeFromDay(obj[day], 1),
            endTime: getTimeFromDay(obj[day], 2),
            isEnabled: true,
          }
        : {
            day: day,
            isEnabled: false,
          };
    });

    return {
      name: obj['name'],
      address: obj['address'],
      longitude: obj['longitude'],
      latitude: obj['latitude'],
      email: obj['email'] || null,
      phoneNumber: obj['phoneNumber'],
      openingTime,
    };
  };

  const convertCSVToJson = async () => {
    //result.data has the form [{},{},...]
    const result = await Papa.parse(acceptedFiles[0], {
      delimiter: '', // auto-detect
      newline: '', // auto-detect
      quoteChar: '"',
      escapeChar: '"',
      header: true,
      transformHeader: function (headerName) {
        switch (headerName) {
          case 'Tên': {
            return 'name';
          }
          case 'Ðịa Chỉ': {
            return 'address';
          }
          case 'Email': {
            return 'email';
          }
          case 'Số Ðiện Thoại': {
            return 'phoneNumber';
          }
          case 'Kinh Ðộ': {
            return 'longitude';
          }
          case 'Vĩ Ðộ': {
            return 'latitude';
          }
          case 'Thứ 2': {
            return 1;
          }
          case 'Thứ 3': {
            return 2;
          }
          case 'Thứ 4': {
            return 3;
          }
          case 'Thứ 5': {
            return 4;
          }
          case 'Thứ 6': {
            return 5;
          }
          case 'Thứ 7': {
            return 6;
          }
          case 'Chủ Nhật': {
            return 0;
          }

          default: {
          }
        }
      },
      dynamicTyping: false,
      preview: 0,
      encoding: 'utf-8',
      worker: false,
      comments: false,
      step: undefined,
      complete: function (results) {
        const hospitalData = results.data
          .filter((data) => Object.keys(data).length > 1)
          .map((filteredData) => convertDataToObject(filteredData));

        onImport(hospitalData, false);
      },
      error: function (errors) {
        console.log('Import error : ', errors);
      },
      download: false,
      downloadRequestHeaders: undefined,
      downloadRequestBody: undefined,
      skipEmptyLines: false,
      chunk: undefined,
      chunkSize: undefined,
      fastMode: undefined,
      beforeFirstChunk: undefined,
      withCredentials: undefined,
      transform: undefined,
      delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP],
    });
  };

  useEffect(() => {
    setSelectedFile(acceptedFiles[0]);
    if (acceptedFiles[0]) {
      convertCSVToJson();
    }
  }, [acceptedFiles]);

  return (
    <Box>
      {selectedFile && (
        <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
          <ClearFile
            onClick={() => {
              setSelectedFile(null);
              onImport([], true);
            }}
            title="Gỡ bỏ tệp tin"
          />
          <Box sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '90%' }}>
            {selectedFile.path}
          </Box>
        </Stack>
      )}

      {!selectedFile && (
        <DropZone {...getRootProps({ onClick: (e) => e.preventDefault() })}>
          <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl sx={{ padding: '10px', textAlign: 'center' }} fullWidth>
                <ImportTextDisplayStyle>
                  <Box>
                    <FaFileCsv className="import_icon" />
                  </Box>
                  <Typography className="import_description">{label}</Typography>
                  <Typography className="import_require">CSV tối đa (1MB)</Typography>
                </ImportTextDisplayStyle>

                <TextField
                  className="file_input"
                  type="file"
                  id={name}
                  {...field}
                  {...props}
                  error={!!error}
                  helperText={error?.message?.toString()}
                  {...getInputProps()}
                />
              </FormControl>
            )}
          />
        </DropZone>
      )}
      {fileRejections && <Box>{fileRejectionItems}</Box>}
    </Box>
  );
};
