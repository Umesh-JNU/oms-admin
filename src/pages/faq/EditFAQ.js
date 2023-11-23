import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";
import { useParams } from "react-router-dom";
import reducer from "./state/reducer";
import { getAll, getDetails, update } from "./state/action";
import { EditForm, TextInput } from "../../components";
import { uploadImage } from "../../utils/uploadImage";
import { Col, ProgressBar, Row } from "react-bootstrap";
import { toast } from "react-toastify";

export default function EditFAQModel(props) {
	const { state } = useContext(Store);
	const { token } = state;
	const { id } = props;  // faq/:id

	const [{ loading, error, loadingUpdate, faq, success }, dispatch] = useReducer(reducer, {
		loading: true,
		loadingUpdate: false,
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

	useEffect(() => {
		(async () => {
			await getDetails(dispatch, token, id);
		})();

		console.log({ show: props.show, faq })
		if (faq && faq._id === id) {
			console.log("in edit faq", { faq })
			setInfo({
				question: faq.question,
				answer: faq.answer,
			});
		}

	}, [id, props.show, faq?._id]);

	const resetForm = () => { setInfo(faqData); };
	const submitHandler = async (e) => {
		e.preventDefault();

		await update(dispatch, token, id, info);
		if (success) {
			resetForm();
		}
	};

	return (
		<EditForm
			{...props}
			title="Edit FAQ"
			data={info}
			setData={setInfo}
			inputFieldProps={faqAttr}
			submitHandler={submitHandler}
			target=""
			successMessage="FAQ Updated Successfully! Redirecting..."
			reducerProps={{ loadingUpdate, error, success, dispatch }}
		/>
	);
}