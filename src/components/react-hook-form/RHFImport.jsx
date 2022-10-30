import { Controller } from 'react-hook-form';
import { FormControl, TextField, styled, Stack, Box } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Papa from 'papaparse';

const DropZone = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  height: '80px',
  color: '#707070',
  border: '1px dashed #bdbdbd',
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

  const validateObject = (obj) => {
    for (const prop in obj) {
      if (!obj[prop]) {
        delete obj[prop];
      }
    }

    return obj;
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
          case 'Địa Chỉ': {
            return 'address';
          }
          case 'Email': {
            return 'email';
          }
          case 'Số Điện Thoại': {
            return 'phoneNumber';
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
        console.log('results.data: ', results.data);
        let hospitalData = results.data.filter((data) => {
          if (data) {
            return validateObject(data);
          }
        });
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
                <p>{label}</p>
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
