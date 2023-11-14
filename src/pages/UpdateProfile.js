import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../states/store";
import { reducer } from "../states/reducers";
import { getProfile, updateProfile } from "../states/actions";
import { EditForm, TextInput } from "../components";
import { uploadImage } from "../utils/uploadImage";
import { Col, ProgressBar, Row } from "react-bootstrap";
import { toast } from "react-toastify";

export default function EditUserModel(props) {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { token } = state;

  const [{ loading, error, loadingUpdate, data: user, success }, dispatch] = useReducer(reducer, {
    loading: true,
    loadingUpdate: false,
    error: "",
  });

  const userData = {
    email: "",
    profile_img: "",
    firstname: "",
    lastname: "",
    mobile_no: "",
    addr: "",
    city: "",
    postcode: ""
  };
  const userAttr = [
    {
      type: "text",
      props: {
        label: "Firstname",
        name: "firstname",
      }
    },
    {
      type: "text",
      props: {
        label: "Lastname",
        name: "lastname",
      }
    },
    {
      type: "text",
      props: {
        label: "Email",
        name: "email",
        required: true,
      }
    },
    {
      type: "text",
      props: {
        label: "Mobile No.",
        name: "mobile_no",
      }
    },
    {
      type: "text",
      props: {
        label: "Address",
        name: "addr",
        required: true,
      }
    },
    {
      type: "text",
      props: {
        label: "City",
        name: "city",
        required: true,
      }
    },
    {
      type: "text",
      props: {
        label: "Postcode",
        name: "postcode",
        required: true,
      }
    }
  ]
  const [info, setInfo] = useState(userData);
  const [preview, setPreview] = useState("");

  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const uploadPercentageHandler = (per) => { setUploadPercentage(per); };

  const uploadFileHandler = async (e, type) => {
    if (!e.target.files[0]) {
      // if (!file) {
      setInfo({ ...info, profile_img: null });
      setPreview("");
      return;
    }
    if (e.target.files[0].size > 5000000) {
      toast.warning("Image size is too large. (max size 5MB)", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      setInfo({ ...info, profile_img: null });
      setPreview("");
      return;
    }
    try {
      // if (e.target.files[0]) {
      const location = await uploadImage(
        e.target.files[0],
        // file,
        token,
        uploadPercentageHandler
      );
      if (location.error) {
        throw location.error;
      }

      setInfo({ ...info, profile_img: location });
      setPreview(location);

      setTimeout(() => {
        setUploadPercentage(0);
        setIsUploaded(true);
      }, 1000);
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  useEffect(() => {
    if (user) {
      console.log({ user })
      setInfo({
        email: user.email,
        // password: user.password,
        firstname: user.firstname,
        lastname: user.lastname,
        mobile_no: user.mobile_no,
        addr: user.addr.address,
        city: user.addr.city,
        postcode: user.addr.postcode,
        profile_img: user.profile_img
      });
      setPreview(user.profile_img)
    }

    (async () => {
      await getProfile(dispatch, token);
    })();
  }, [token, props.show]);

  const resetForm = () => { setInfo(userData); };
  const submitHandler = async (e) => {
    e.preventDefault();

    await updateProfile(ctxDispatch, dispatch, token, {
      firstname: info.firstname,
      lastname: info.lastname,
      email: info.email,
      mobile_no: info.mobile_no,
      profile_img: info.profile_img,
      addr: {
        address: info.addr,
        city: info.city,
        postcode: info.postcode
      }
    });
    if (success) {
      resetForm();
      setPreview("");
    }
  };

  return (
    <EditForm
      {...props}
      title="Update Profile"
      data={info}
      setData={setInfo}
      inputFieldProps={userAttr}
      submitHandler={submitHandler}
      target=""
      successMessage="User Updated Successfully! Redirecting..."
      reducerProps={{ loadingUpdate, error, success, dispatch }}
    >
      <TextInput label="Upload Image" type="file" accept="image/*" onChange={(e) => uploadFileHandler(e)} />
      {uploadPercentage > 0 && (
        <ProgressBar
          now={uploadPercentage}
          active
          label={`${uploadPercentage}%`}
        />
      )}

      {preview && <img src={preview} width={100} className="img-fluid" />}
    </EditForm>
  );
}