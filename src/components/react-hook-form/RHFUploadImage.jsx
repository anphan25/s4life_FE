import React, { useRef, useState, useEffect } from 'react';
import { Stack, styled, Box, InputLabel, TextField, Typography, FormControl, Button } from '@mui/material';
import { Controller } from 'react-hook-form';
import { AiFillFileImage, AiOutlineClose } from 'react-icons/ai';
import { useDropzone } from 'react-dropzone';
import { BsUpload } from 'react-icons/bs';

const ErrorMessageList = styled(Box)(({ theme }) => ({
  color: theme.palette.error.main,
  marginTop: '10px',

  '& ul': {
    listStyleType: 'none',
  },
}));

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

const ImportTextDisplayStyle = styled(Stack)(({ theme }) => ({
  justifyContent: 'center',
  gap: '8px',

  '& .upload_icon': { color: theme.palette.primary.main, fontSize: '32px' },
  '& .upload_description': { color: theme.palette.primary.main },
  '& .upload_require': { color: theme.palette.grey[600] },
}));

const CustomizeErrorMessage = (code) => {
  switch (code) {
    case 'file-invalid-type': {
      return 'Vui lòng chọn ảnh định dạnh png hoặc jpeg';
    }
    case 'file-too-large': {
      return 'Vui lòng chọn ảnh có kích cỡ bé hơn hoặc bằng 3MB';
    }

    default: {
      return 'Lỗi khi chọn file';
    }
  }
};

//When have defaultValue, that means editing. If not it mean adding
export const RHFUploadImage = ({ label, name, control, onUpload, defaultValue, ...props }) => {
  const uploadImgRef = useRef();
  const editImgRef = useRef();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorFileContent, setErrorFileContent] = useState([]);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    maxSize: 3000000,
    maxFiles: 1,
    minSize: 0,
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const thumbs = files.map((file) => (
    <img
      src={file.preview}
      key={file.name}
      onLoad={() => {
        URL.revokeObjectURL(file.preview);
      }}
      alt=""
    />
  ));

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

  useEffect(() => {
    setSelectedFile(acceptedFiles[0]);
    onUpload(acceptedFiles[0]);
  }, [acceptedFiles]);

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <Box>
      <InputLabel
        sx={{
          cursor: 'pointer',
          pointerEvents: 'unset',
          mb: 1,
          transform: 'none',
          position: 'relative',
          fontSize: 14,
          color: 'grey.900',
        }}
        htmlFor="picFood"
      >
        {label}
      </InputLabel>
      {!defaultValue
        ? selectedFile && (
            <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
              <ClearFile
                onClick={() => {
                  setSelectedFile(null);
                  onUpload(acceptedFiles[0]);
                }}
                title="Gỡ bỏ tệp tin"
              />
              <Box sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '90%' }}>
                {selectedFile.path}
              </Box>
            </Stack>
          )
        : ''}
      <Stack
        id="avtUrl"
        justifyContent="center"
        alignItems="center"
        sx={{
          height: props.height,
          width: props.width,
          backgroundColor: '#F4F4F4',
          margin: '0 auto',
          borderRadius: props.borderRadius,
          position: 'relative',
          border: props.borderRadius === '100%' ? '2px solid #C13538' : '',

          '& .dropzone-div': { width: '100%', height: '100%', borderRadius: props.borderRadius },

          '& .editing': { display: 'none' },

          '& .img-preview': {
            width: '100%',
            height: '100%',

            '& img': { width: '100%', height: '100%', borderRadius: props.borderRadius, objectFit: 'cover' },
          },
        }}
      >
        {/* Have defaultValues it means editing */}
        {!defaultValue ? (
          !selectedFile ? (
            <DropZone className="dropzone-div" {...getRootProps({ onClick: (e) => e.preventDefault() })}>
              <Controller
                name={name}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl sx={{ padding: '10px', textAlign: 'center' }} fullWidth>
                    <ImportTextDisplayStyle>
                      <Box>
                        <AiFillFileImage className="upload_icon" />
                      </Box>
                      <Typography className="upload_description">{label}</Typography>
                      <Typography className="upload_require">Ảnh tối đa 3MB</Typography>
                    </ImportTextDisplayStyle>

                    <TextField
                      className="file_input"
                      type="file"
                      inputRef={uploadImgRef}
                      id={name}
                      {...getInputProps()}
                    />
                  </FormControl>
                )}
              />
            </DropZone>
          ) : (
            <Box className="img-preview">{thumbs}</Box>
          )
        ) : (
          <Box sx={{ width: '100%', height: '100%' }}>
            <DropZone className="dropzone-div editing" {...getRootProps({ onClick: (e) => e.preventDefault() })}>
              <Controller
                name={name}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl sx={{ padding: '10px', textAlign: 'center' }} fullWidth>
                    <ImportTextDisplayStyle>
                      <Box>
                        <AiFillFileImage className="upload_icon" />
                      </Box>
                      <Typography className="upload_description">{label}</Typography>
                      <Typography className="upload_require">Ảnh tối đa 3MB</Typography>
                    </ImportTextDisplayStyle>

                    <TextField
                      className="file_input"
                      type="file"
                      inputRef={editImgRef}
                      id={name}
                      {...getInputProps()}
                    />
                  </FormControl>
                )}
              />
            </DropZone>

            <Stack
              id="picFood"
              justifyContent="center"
              alignItems="center"
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: '#F4F4F4',
                borderRadius: props.borderRadius,
                position: 'relative',

                '& img': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: props.borderRadius,
                },
              }}
            >
              <Box className="img-preview">{files.length > 0 ? thumbs : <img src={defaultValue} alt="" />}</Box>
              <Button
                sx={{
                  width: '100px',
                  height: '40px',
                  fontSize: '10px',
                  position: 'absolute',
                  opacity: '50%',

                  '&:hover': { opacity: '100%' },
                }}
                variant="contained"
                startIcon={<BsUpload />}
                onClick={() => {
                  editImgRef.current.click();
                }}
              >
                chọn ảnh
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>

      {fileRejections && (
        <Box>
          {fileRejectionItems}
          {displayValidateContentError}
        </Box>
      )}
    </Box>
  );
};
