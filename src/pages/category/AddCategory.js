import React, { useContext, useReducer, useState } from "react";
import { Store } from "../../states/store";

import { ToastContainer, toast } from "react-toastify";
import reducer from "./state/reducer";
import { create } from "./state/action";
import { useTitle, AddForm, UploadFileComp, RadioInput } from "../../components";
import { Row } from "react-bootstrap";
import { toastOptions } from "../../utils/error";

export default function AddCategory() {
  const { state } = useContext(Store);
  const { token } = state;

  const [{ loading, error, success }, dispatch] = useReducer(reducer, {
    loading: false,
    error: "",
  });

  const categoryData = {
    name: "",
    desc: "",
    category_img: "",
    location: 'US',
  };
  const categoryAttr = [
    {
      type: "text",
      props: {
        label: "Name",
        name: "name",
        required: true
      }
    },
    {
      type: "text",
      props: {
        label: "Description",
        name: "desc",
        required: true
      }
    }
  ];
  const [info, setInfo] = useState(categoryData);
  const [categoryImage, setCategoryImage] = useState("");

  const resetForm = () => {
    setInfo(categoryData);
    setCategoryImage("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!categoryImage) {
      toast.warning("Please select an image or wait till image is uploaded.", toastOptions);
      return;
    }

    await create(dispatch, token, { ...info, category_img: categoryImage });
    resetForm();
  };

  useTitle("Create Category");
  return (
    <AddForm
      title="Add Category"
      data={info}
      setData={setInfo}
      inputFieldProps={categoryAttr}
      submitHandler={submitHandler}
      target="/admin/category"
      successMessage="Category Created Successfully!"
      reducerProps={{ loading, error, success, dispatch }}
    >
      <h6>Select Location</h6>
      <RadioInput label="US" name="location" checked={info.location === 'US'} onChange={e => setInfo({ ...info, location: 'US' })} />
      <RadioInput label="Canada" name="location" checked={info.location === 'CA'} onChange={e => setInfo({ ...info, location: 'CA' })} />

      <UploadFileComp label="Upload Image" accept="image/*" required={true} file={categoryImage} setFile={setCategoryImage} fileType="image" />

      <ToastContainer />
    </AddForm>
  );
}