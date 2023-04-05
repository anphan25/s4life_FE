import { FormControl, TextField, Stack, Box, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import moment from 'moment';
import { CSVFileIcon } from 'assets';
import { DropZone, ClearFile, ErrorMessageList, ImportTextDisplayStyle, BLOOD_VOLUME } from 'utils';

export const BloodDonationHistoryImport = ({ label, onImport, ...props }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorFileContent, setErrorFileContent] = useState([]);
  const [missedColumns, setMissedColumns] = useState([]);

  let tempErrorFileContent = [];

  const validHeader = ['Ngày hiến', 'Số đơn vị máu', 'Số túi máu'];

  const requiredLabels = [...validHeader];

  const requiredFields = ['donationDate', 'donationVolume', 'bloodBagCode'];

  const missingColumns = [...validHeader];

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
        return `Vui lòng điền đầy đủ các trường thông tin bắt buộc (${requiredLabels.join(', ')})`;
      }

      case 'lack-modified-columns': {
        return `Thiếu các cột bắt buộc (${missedColumns.join(', ')})`;
      }

      case 'invalid-donation-volume': {
        return 'Số đơn vị máu không hợp lệ. Số đơn vị hợp lệ là 250, 350, 375, 450';
      }

      case 'invalid-format-date': {
        return 'Vui lòng chọn định dạng ngày DD/MM/yyyy';
      }

      case 'invalid-donation-date': {
        return 'Ngày hiến không thể lớn hơn hôm nay';
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

  const validateCSVFileContent = (dataList) => {
    // Check remove or modify column name
    if (missingColumns.length > 0) {
      setMissedColumns(missingColumns);
      displayInvalidFileContent('lack-modified-columns');

      return;
    }

    if (dataList?.length <= 0) {
      displayInvalidFileContent('required-filed-missing');
      return;
    }

    dataList?.forEach((data) => {
      for (const property in data) {
        if (!data[property] && requiredFields.includes(property)) {
          displayInvalidFileContent('required-filed-missing');
          return;
        }

        if (!BLOOD_VOLUME.includes(data['donationVolume'])) {
          displayInvalidFileContent('invalid-donation-volume');
        }

        if (!moment(data['donationDate']).isSameOrBefore(moment(), 'dates')) {
          displayInvalidFileContent('invalid-donation-date');
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

    if (!moment(obj['donationDate'], 'DD/MM/yyyy', true).isValid) {
      displayInvalidFileContent('invalid-format-date');
    }

    const formattedDate = moment(obj['donationDate'], 'DD/MM/yyyy').format('yyyy-MM-DD');

    return {
      donationDate: formattedDate,
      donationVolume: obj['donationVolume'] * 1,
      bloodBagCode: obj['bloodBagCode'],
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

        const index = missingColumns.indexOf(headerName);

        if (index > -1) missingColumns.splice(index, 1);

        switch (headerName) {
          case 'Ngày hiến': {
            return 'donationDate';
          }
          case 'Số đơn vị máu': {
            return 'donationVolume';
          }
          case 'Số túi máu': {
            return 'bloodBagCode';
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
        const bloodDonationHistoriesData = results.data
          .filter((data) => Object.keys(data).length > 1)
          .map((filteredData) => convertDataToObject(filteredData));
        validateCSVFileContent(bloodDonationHistoriesData);

        if (tempErrorFileContent.length > 0) {
          onImport([], true);
          setSelectedFile(null);
          return;
        }
        tempErrorFileContent = [];
        setErrorFileContent([]);
        onImport(bloodDonationHistoriesData, false);
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
