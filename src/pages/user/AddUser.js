import React, { useContext, useReducer, useState } from "react";
import { Store } from "../../states/store";

import { ToastContainer } from "react-toastify";
import reducer from "./state/reducer";
import { create } from "./state/action";
import { useTitle, AddForm } from "../../components";

export default function AddUser() {
  const { state } = useContext(Store);
  const { token } = state;

  const [{ loading, error, success }, dispatch] = useReducer(reducer, {
    loading: false,
    error: "",
  });

  const userData = {
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    mobile_no: "",
    dist_email: "",
    dist_name: "",
    dist_mob_no: "",
    active: true,
    role: "user"
  };
  const userAttr = [
    {
      type: "text",
      props: {
        label: "Firstname",
        name: "firstname",
        minLength: 4,
        maxLength: 30,
        required: true
      }
    },
    {
      type: "text",
      props: {
        label: "Lastname",
        name: "lastname",
        minLength: 4,
        maxLength: 30,
        required: true
      }
    },
    {
      type: "email",
      props: {
        label: "Email",
        name: "email",
        type: "email",
        required: true,
      }
    },
    {
      type: "text",
      props: {
        label: "Password",
        name: "password",
        required: true
      }
    },
    {
      type: "text",
      col: 12,
      props: {
        label: "Mobile No.",
        name: "mobile_no",
        required: true,
      }
    },
    {
      type: "email",
      col: 4,
      props: {
        label: "Distributor's Email",
        name: "dist_email",
        type: "email",
        required: true,
      }
    },
    {
      type: "text",
      col: 4,
      props: {
        label: "Distributor's Name",
        name: "dist_name",
        minLength: 4,
        maxLength: 30,
        required: true
      }
    },
    {
      type: "text",
      col: 4,
      props: {
        label: "Distributor's Mobile No.",
        name: "dist_mob_no",
        required: true
      }
    }
  ];
  const [info, setInfo] = useState(userData);

  const resetForm = () => {
    setInfo(userData);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    await create(dispatch, token, info);
    resetForm();
  };

  useTitle("Create Wholesaler");
  return (
    <AddForm
      title="Add Wholesaler"
      data={info}
      setData={setInfo}
      inputFieldProps={userAttr}
      submitHandler={submitHandler}
      target="/admin/wholesalers"
      successMessage="Wholesaler Created Successfully!"
      reducerProps={{ loading, error, success, dispatch }}
    >
      <ToastContainer />
    </AddForm>
  );
}