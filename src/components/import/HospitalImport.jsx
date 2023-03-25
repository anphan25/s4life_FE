import { FormControl, TextField, Stack, Box, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import moment from 'moment';
import { CSVFileIcon } from 'assets';
import {
  DropZone,
  ClearFile,
  ErrorMessageList,
  ImportTextDisplayStyle,
  EMAIL_PATTERN,
  PHONE_NUMBER_PATTERN,
} from 'utils';

export const HospitalImport = ({ label, onImport, isEdit = false, ...props }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorFileContent, setErrorFileContent] = useState([]);
  const [missedColumns, setMissedColumns] = useState([]);

  let tempErrorFileContent = [];

  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];

  const validHeader = [
    'Tên*',
    'Ðịa Chỉ*',
    'Số Ðiện Thoại*',
    'Email',
    'Kinh Ðộ*',
    'Vĩ Ðộ*',
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'Chủ Nhật',
  ];

  const clonedHeaders = [...validHeader];
  const checkedHeaders = [];

  const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({
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
        return 'Vui lòng chọn file có dung lượng bé hơn hoặc bằng 1MB';
      }

      case 'required-filed-missing': {
        return 'Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)';
      }

      case 'unknown-columns': {
        return 'Vui lòng không thêm cột mới';
      }

      case 'lack-modified-columns': {
        return `Vui lòng không xóa hoặc sửa tên các cột mặc định của file (${missedColumns.join(', ')})`;
      }

      case 'invalid-openingTime': {
        return 'Thời gian làm việc của các ngày trong tuần đang trống';
      }

      case 'invalid-starttime-endTime': {
        return 'Thời gian bắt đầu phải trước thời gian kết thúc';
      }

      case 'invalid-openingTime-format': {
        return 'Định dạng của thời gian làm việc trong tuần là HH:mm - HH:mm';
      }

      case 'invalid-email': {
        return 'Email không hợp lệ';
      }

      case 'invalid-phone-number': {
        return 'Số điện thoại không hợp lệ';
      }

      case 'too-much-record': {
        return 'Khi chỉnh sửa chỉ cần 1 dòng thông tin';
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

  const displayValidateContentError =
    errorFileContent.length > 0 ? (
      <ErrorMessageList>
        <ul className="error-ul">
          {errorFileContent.map((e, i) => {
            return <li key={i}>{CustomizeErrorMessage(e)}</li>;
          })}
        </ul>
      </ErrorMessageList>
    ) : (
      ''
    );

  const displayInvalidFileContent = (code) => {
    if (!tempErrorFileContent.includes(code)) {
      tempErrorFileContent.push(code);
      setErrorFileContent(tempErrorFileContent);
    }
  };

  //Mode 1: get startTime, Mode 2: get endTime
  const getTimeFromDay = (dayString, mode) => {
    const timeArr = dayString.split('-');

    //Validate start and end time
    if (!moment(timeArr[0], 'HH:mm').isBefore(moment(timeArr[1], 'HH:mm'))) {
      displayInvalidFileContent('invalid-starttime-endTime');

      return;
    }
    const timeSplit = timeArr[mode - 1].trim().split(':');

    return moment().hour(timeSplit[0]).minute(timeSplit[1]).second(0).format('HH:mm:ss');
  };

  const validateCSVFileContent = (dataList) => {
    // Check remove or modify column name
    if (clonedHeaders.length > 0) {
      setMissedColumns(clonedHeaders);
      displayInvalidFileContent('lack-modified-columns');

      return;
    }

    //Check  add new columns(s)
    validHeader.sort();
    checkedHeaders.sort();

    for (let i = 0; i < validHeader.length; i++) {
      if (checkedHeaders[i] !== validHeader[i]) {
        displayInvalidFileContent('unknown-columns');

        return;
      }
    }

    if (isEdit) {
      if (dataList.length > 1) {
        displayInvalidFileContent('too-much-record');

        return;
      }
    }

    dataList.forEach((data) => {
      for (const property in data) {
        // Require all field except email
        if (!data[property] && property !== 'email') {
          displayInvalidFileContent('required-filed-missing');
        }

        if (property === 'openingTime') {
          let isNoDayOpen = data[property].every((day) => day.isEnabled === false);

          if (isNoDayOpen) {
            displayInvalidFileContent('invalid-openingTime');

            return;
          }
        }

        if (property === 'email' && data[property]) {
          if (!data[property].match(EMAIL_PATTERN)) {
            displayInvalidFileContent('invalid-email');
          }
        }

        if (property === 'phoneNumber') {
          if (!data[property].match(PHONE_NUMBER_PATTERN)) {
            displayInvalidFileContent('invalid-phone-number');
          }
        }
      }
    });
  };

  const convertDataToObject = (obj) => {
    for (const prop in obj) {
      if (!obj[prop]) {
        delete obj[prop];
      }
    }

    for (let i = 0; i < 7; i++) {
      if (!obj[i]) continue;
      if (!obj[i]?.match(/^([01]\d|2[0-3]):([0-5]\d) - ([01]\d|2[0-3]):([0-5]\d)$/)) {
        console.log('hee');
        displayInvalidFileContent('invalid-openingTime-format');

        return;
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
    await Papa.parse(acceptedFiles[0], {
      delimiter: '', // auto-detect
      newline: '', // auto-detect
      quoteChar: '"',
      escapeChar: '"',
      header: true,
      transformHeader: function (headerName) {
        if (!headerName) return;

        const index = clonedHeaders.indexOf(headerName);

        if (index > -1) clonedHeaders.splice(index, 1);

        checkedHeaders.push(headerName);

        switch (headerName) {
          case 'Tên*': {
            return 'name';
          }
          case 'Ðịa Chỉ*': {
            return 'address';
          }
          case 'Email': {
            return 'email';
          }
          case 'Số Ðiện Thoại*': {
            return 'phoneNumber';
          }
          case 'Kinh Ðộ*': {
            return 'longitude';
          }
          case 'Vĩ Ðộ*': {
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
            return 'unknown';
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
        validateCSVFileContent(hospitalData);
        if (tempErrorFileContent.length > 0) {
          onImport([], true);
          setSelectedFile(null);
          return;
        }
        tempErrorFileContent = [];
        setErrorFileContent([]);
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
            icon="solid-times"
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
          <FormControl sx={{ padding: '10px', textAlign: 'center' }} fullWidth>
            <ImportTextDisplayStyle>
              <Box>
                <CSVFileIcon />
              </Box>
              <Typography className="import_description">{label}</Typography>
              <Typography className="import_require">CSV tối đa 1MB</Typography>
            </ImportTextDisplayStyle>

            <TextField className="file_input" type="file" {...getInputProps()} />
          </FormControl>
        </DropZone>
      )}
      {fileRejections && (
        <Box>
          {fileRejectionItems}
          {displayValidateContentError}
        </Box>
      )}
    </Box>
  );
};
