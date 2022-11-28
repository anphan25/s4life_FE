import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FormControl, FormHelperText, InputLabel, styled, Box } from '@mui/material';
import { Controller } from 'react-hook-form';

export const RHFEditor = ({ control, label, name, placeholder, isRequiredLabel, field, defaultValue, ...props }) => {
  const editorRef = useRef(null);

  const HeaderMainStyle = styled('span')(({ theme }) => ({
    color: theme.palette.error.main,
  }));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
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
            htmlFor={name}
          >
            {label}
            {isRequiredLabel ? <HeaderMainStyle>*</HeaderMainStyle> : ''}
          </InputLabel>
          <Editor
            className="editor"
            id={name}
            {...field}
            // {...props}
            initialValue={defaultValue || ''}
            onChange={(e) => {
              if (editorRef.current) {
                field.onChange(editorRef.current.getContent());
              }
            }}
            onInit={(evt, editor) => (editorRef.current = editor)}
            apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
            init={{
              placeholder,
              height: 400,
              menubar: false,
              plugins: [
                'advlist',
                'autolink',
                'lists',
                'link',
                'anchor',
                'searchreplace',
                'visualblocks',
                'code',
                'fullscreen',
                'insertdatetime',
                'media',
                'wordcount',
                // 'quickbars',
                'autoresize',
              ],
              toolbar:
                'formatselect | bold italic underline strikethrough | backcolor forecolor  | alignleft aligncenter alignright alignjustify | fontfamily fontsize blocks  | bullist numlist outdent indent | pagebreak | undo redo',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; resixe:none; }',
            }}
          />
          {!!error && (
            <FormHelperText error sx={{ mt: 0 }}>
              {error?.message?.toString()}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};
