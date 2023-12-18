import React, { useContext, useState } from 'react'
import { Store } from "../../states/store";
import { ProgressBar } from 'react-bootstrap'
import { TextInput } from './CustomForm'
import { uploadFile } from '../../utils/uploadImage';
import { toast } from "react-toastify";
import { toastOptions } from "../../utils/error";
{/**
  accept for pdf = ".pdf"
  accept for image = "image/*"
*/}

function UploadFileComp({ file, setFile, fileType, imageMargin, isDimension, ...props }) {
  const { state } = useContext(Store);
  const { token } = state;

  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const uploadPercentageHandler = (per) => { setUploadPercentage(per); };

  const uploadImageS3 = async (doc) => {
    try {
      const location = await uploadFile(
        doc,
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

  const getDimAndUpload = async (image) => {
    // read file using fileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("READER ONLOAD", e);
      // creating image element to get the dimension
      const img = new Image();
      img.src = e.target.result;

      img.onload = async () => {
        if (img.width !== 1512 || img.height !== 504) {
          toast.warning("Image size should be 1512 x 504", toastOptions);
          return;
        } else {
          await uploadImageS3(image);
        }
      }
    }

    reader.readAsDataURL(image);
  };
  
  const uploadFileHandler = async (e, type) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile("");
      return;
    }

    if (selectedFile.size > 5000000) {
      toast.warning("File size is too large. (max size 5MB)", toastOptions);
      setFile("");
      return;
    }

    if (isDimension) {
      await getDimAndUpload(selectedFile);
    }
    else {
      await uploadImageS3(selectedFile);
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

      {file && <img src={file} width={50} height={50} className={imageMargin} />}
    </>
  )
}

export default UploadFileComp