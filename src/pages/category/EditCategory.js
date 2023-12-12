import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";
import { useParams } from "react-router-dom";
import reducer from "./state/reducer";
import { getDetails, update } from "./state/action";
import { EditForm, RadioInput, TextInput, UploadFileComp } from "../../components";
import { uploadImage } from "../../utils/uploadImage";
import { Col, ProgressBar, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { toastOptions } from "../../utils/error";

export default function EditCategoryModel(props) {
  const { state } = useContext(Store);
  const { token } = state;
  const { id } = useParams();  // category/:id

  const [{ loading, error, loadingUpdate, category, success }, dispatch] = useReducer(reducer, {
    loading: true,
    loadingUpdate: false,
    error: "",
  });

  const categoryData = {
    name: "",
    desc: "",
    category_img: "",
    location: "US",
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
  const handleImageChange = (location) => {
    setInfo({ ...info, category_img: location });
    setCategoryImage(location);
  }

  useEffect(() => {
    if (category && category._id === id) {
      console.log({ category })
      setInfo({
        name: category.name,
        desc: category.desc,
        category_img: category.category_img,
        location: category.location
      });
      setCategoryImage(category.category_img);
    }

    (async () => {
      await getDetails(dispatch, token, id);
    })();
  }, [id, props.show]);

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

    await update(dispatch, token, id, info);
    if (success) {
      resetForm();
    }
  };

  return (
    <EditForm
      {...props}
      title="Edit Category"
      data={info}
      setData={setInfo}
      inputFieldProps={categoryAttr}
      submitHandler={submitHandler}
      target="/admin/category"
      successMessage="Category Updated Successfully! Redirecting..."
      reducerProps={{ loadingUpdate, error, success, dispatch }}
    >
      <h6>Select Location</h6>
      <RadioInput label="US" name="location" checked={info.location === 'US'} onChange={e => setInfo({ ...info, location: 'US' })} />
      <RadioInput label="Canada" name="location" checked={info.location === 'CA'} onChange={e => setInfo({ ...info, location: 'CA' })} />


      <UploadFileComp label="Upload Image" accept="image/*" file={categoryImage} setFile={handleImageChange} fileType="image" />
    </EditForm>
  );
}