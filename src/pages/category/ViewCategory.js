import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";
import { useNavigate, useParams } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import { CustomSkeleton, useTitle, ViewButton, ViewCard } from "../../components";
import reducer from "./state/reducer";
import { getDetails } from "./state/action";
import EditCategoryModel from "./EditCategory";
import { Col, Row, Table } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";

const keyProps = {
  "Name": "name", "Description": "desc", "Country": "location", "Created At": "createdAt", "Last Update": "updatedAt"
};

const Details = ({ title, loading, data, detailKey, fields }) => {
  const keyList = Object.entries(fields);

  // console.log({ loading, data, detailKey, fields })
  // console.log({ a: data[detailKey] })
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

const ViewCategory = () => {
  const { state } = useContext(Store);
  const { token } = state;
  const { id } = useParams(); // category/:id

  const [modalShow, setModalShow] = useState(false);
  const [{ loading, error, category }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  // console.log({ error, category })
  useEffect(() => {
    (async () => {
      await getDetails(dispatch, token, id);
    })();
  }, [token, id]);

  useTitle("Category Details");
  return (
    <ViewCard
      title={"Category Details"}
      data={category}
      setModalShow={setModalShow}
      isImage="true"
      image_url={category?.category_img}
      keyProps={keyProps}
      reducerProps={{ error, loading, dispatch }}
    >
      <EditCategoryModel
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      {!modalShow && <ToastContainer />}
    </ViewCard>
  );
};

export default ViewCategory;