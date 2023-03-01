import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from 'config';

export const handleDownloadTemplate = async (path, downloadRef) => {
  getDownloadURL(ref(storage, path)).then((url) => {
    downloadRef.current.setAttribute('href', url);
    downloadRef.current.click();
  });
};
