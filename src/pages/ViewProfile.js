import React, { useContext, useEffect, useReducer, useState } from "react";
import { ToastContainer } from "react-toastify";
import { Store } from "../states/store";
import { reducer } from "../states/reducers";
import { getProfile } from "../states/actions";

import { useTitle, ViewCard } from "../components";
import EditProfileModel from "./UpdateProfile";
import { Col, Row } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";



const keyProps = {
  "Email": "email", "Firstname": "firstname", "Lastname": "lastname", "Mobile No.": "mobile_no", "Role": "role", "Created At": "createdAt", "Last Update": "updatedAt"
};

const Details = ({ title, loading, data, detailKey, fields }) => {
  const keyList = Object.entries(fields);

  // console.log({ loading, data, detailKey, fields })
  return (
    <>
      <u><h4 className="mt-3">{title}</h4></u>
      <Row>
        {keyList && keyList.map(([k, attr]) => {
          // console.log({ k, attr })
          return (
            <Col key={k} md={4}>
              <p className="mb-0">
                <strong>{k}</strong>
              </p>
              <p>{loading ? <Skeleton /> : data[detailKey][attr]}</p>
            </Col>
          )
        })}
      </Row>
    </>
  )
};

const ViewProfile = () => {
  const { state } = useContext(Store);
  const { token } = state;

  const [modalShow, setModalShow] = useState(false);
  const [{ loading, error, data: user }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  console.log({ error, user })
  useEffect(() => {
    (async () => {
      await getProfile(dispatch, token);
    })();
  }, [token]);

  useTitle("Profile Details");
  return (
    <ViewCard
      title={"Profile Details"}
      data={user}
      setModalShow={setModalShow}
      keyProps={keyProps}
      isImage="true"
      image_url={user ? user.profile_img : ""}
      reducerProps={{ error, loading, dispatch }}
    >
      <Details
        title="Address Details"
        loading={loading}
        data={user}
        detailKey="addr"
        fields={{ "Address": "address", "City": "city", "Postcode": "postcode" }}
      />
      <EditProfileModel
        show={modalShow}
        onHide={() => setModalShow(false)}
        reload={async () => { await getProfile(dispatch, token) }}
      />
      {!modalShow && <ToastContainer />}
    </ViewCard>
  );
};

export default ViewProfile;