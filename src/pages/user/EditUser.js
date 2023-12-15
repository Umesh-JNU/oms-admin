import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";
import { useParams } from "react-router-dom";
import reducer from "./state/reducer";
import { getDetails, update } from "./state/action";
import { EditForm } from "../../components";

export default function EditUserModel(props) {
	const { state } = useContext(Store);
	const { token } = state;
	const { id } = useParams();  // user/:id

	const [{ loading, error, loadingUpdate, user, success }, dispatch] = useReducer(reducer, {
		loading: true,
		loadingUpdate: false,
		error: "",
	});

	const userData = {
		email: "",
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
				label: "Mobile No.",
				name: "mobile_no",
				required: true,
			}
		},
		{
			type: "email",
			props: {
				label: "Distributor's Email",
				name: "dist_email",
				type: "email",
				required: true,
			}
		},
		{
			type: "text",
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
			props: {
				label: "Distributor's Mobile No.",
				name: "dist_mob_no",
				required: true
			}
		},
		{
			type: "select",
			col: 12,
			props: {
				label: "Role",
				name: "role",
				value: 'user',
				placeholder: "Select Role",
				options: [{ 'user': 'User' }, { 'admin': 'Admin' }]
			}
		}
	];

	const [info, setInfo] = useState(userData);

	useEffect(() => {
		if (user && user._id === id) {
			console.log({ user })
			setInfo({
				email: user.email,
				firstname: user.firstname,
				lastname: user.lastname,
				mobile_no: user.mobile_no,
				dist_email: user.dist_email,
				dist_name: user.dist_name,
				dist_mob_no: user.dist_mob_no,
				role: user.role,
			});
		}

		(async () => {
			await getDetails(dispatch, token, id);
		})();
	}, [id, props.show]);

	const resetForm = () => { setInfo(userData); };
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
			title="Edit Wholesaler"
			data={info}
			setData={setInfo}
			inputFieldProps={userAttr}
			submitHandler={submitHandler}
			target="/admin/wholesalers"
			successMessage="Wholesaler Updated Successfully! Redirecting..."
			reducerProps={{ loadingUpdate, error, success, dispatch }}
		/>
	);
}