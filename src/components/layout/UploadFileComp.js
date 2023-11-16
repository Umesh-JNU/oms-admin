import React, { useContext, useState } from 'react'
import { Store } from "../../states/store";
import { ProgressBar } from 'react-bootstrap'
import { TextInput } from './CustomForm'
import { uploadFile } from '../../utils/uploadImage';
import { toast } from "react-toastify";
import { toastOptions } from "../../utils/error";
{/**
  accept for pdf = ".pdf"
  accept for image = 
*/}

function UploadFileComp({ file, setFile, fileType, imageMargin, ...props }) {
  const { state } = useContext(Store);
  const { token } = state;

  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const uploadPercentageHandler = (per) => { setUploadPercentage(per); };

  const uploadFileHandler = async (e, type) => {
    if (!e.target.files[0]) {
      setFile("");
      return;
    }
    if (e.target.files[0].size > 5000000) {
      toast.warning("File size is too large. (max size 5MB)", toastOptions);
      setFile("");
      return;
    }
    try {
      const location = await uploadFile(
        e.target.files[0],
        fileType,
        token,
        uploadPercentageHandler
      );
      if (location.error) {
        setFile("");
        throw location.error;
      }

      setFile(location);
      setTimeout(() => {
        setUploadPercentage(0);
        setIsUploaded(true);
      }, 1000);
    } catch (error) {
      toast.error(error, toastOptions);
    }
  };

  console.log({ props })
  return (
    <>
      <TextInput {...props} type="file" onChange={(e) => uploadFileHandler(e)} />
      {!isUploaded && uploadPercentage > 0 && (
        <ProgressBar
          now={uploadPercentage}
          active
          label={`${uploadPercentage}%`}
        />
      )}

      {file && <img src={file} width={50} height={50} className={imageMargin}/>}
    </>
  )
}

export default UploadFileComp