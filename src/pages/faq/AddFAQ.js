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

  const faqData = {
    question: "",
    answer: ""
  };

  const faqAttr = [
    {
      type: "text",
      col: 12,
      props: {
        label: "Question",
        name: "question",
        required: true
      }
    },
    {
      type: "text",
      col: 12,
      props: {
        label: "Answer",
        name: "answer",
        required: true
      }
    }
  ];
  const [info, setInfo] = useState(faqData);

  const resetForm = () => {
    setInfo(faqData);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    await create(dispatch, token, info);
    resetForm();
  };

  useTitle("Create FAQ");
  return (
    <AddForm
      title="Add FAQ"
      data={info}
      setData={setInfo}
      inputFieldProps={faqAttr}
      submitHandler={submitHandler}
      target="/admin/faqs"
      successMessage="FAQ Created Successfully!"
      reducerProps={{ loading, error, success, dispatch }}
    >
      <ToastContainer />
    </AddForm>
  );
}