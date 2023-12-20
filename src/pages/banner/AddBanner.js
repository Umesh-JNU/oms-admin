import React, { useContext, useReducer, useState } from "react";
import { Store } from "../../states/store";

import { ToastContainer, toast } from "react-toastify";
import { useTitle, AddForm, UploadFileComp } from "../../components";
import { getError, toastOptions } from "../../utils/error";
import axiosInstance from "../../utils/axiosUtil";


function reducer(state, action) {
  switch (action.type) {
    case "ADD_REQUEST":
      return { ...state, loading: true };

    case "ADD_SUCCESS":
      return { ...state, loading: false, success: true };

    case "ADD_FAIL":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default function AddBanner() {
  const { state } = useContext(Store);
  const { token } = state;

  const [{ loading, error, success }, dispatch] = useReducer(reducer, {
    loading: false,
    error: "",
  });

  const [bannerImage, setBannerImage] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log({ bannerImage })

    if (!bannerImage) {
      toast.warning("Please select an image or wait till image is uploaded.", toastOptions);
      return;
    }

    try {
      dispatch({ type: 'ADD_REQUEST' });
      const { data } = await axiosInstance.post(
        "/api/admin/banner/create", { img_url: bannerImage },
        { headers: { Authorization: token } }
      );

      setTimeout(() => {
        setBannerImage("");
        dispatch({ type: 'ADD_SUCCESS' });
      }, 1500);
    } catch (err) {
      setBannerImage("");
      dispatch({ type: "ADD_FAIL", payload: getError(err) });
    }
  };

  useTitle("Create Banner");
  return (
    <AddForm
      title="Add Banner"
      data={{}}
      setData={() => { }}
      inputFieldProps={[]}
      submitHandler={submitHandler}
      target="/admin/banners"
      successMessage="Banner Created Successfully!"
      reducerProps={{ loading, error, success, dispatch }}
    >

      <UploadFileComp label="Upload Image (Only 1512 x 504)" accept="image/*" required={true} file={bannerImage} setFile={setBannerImage} fileType="image" isDimension={"true"}/>

      <ToastContainer />
    </AddForm>
  );
}