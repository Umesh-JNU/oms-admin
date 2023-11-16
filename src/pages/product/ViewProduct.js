import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";
import { useNavigate, useParams } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import { CustomSkeleton, useTitle, ViewButton, ViewCard } from "../../components";
import reducer from "./state/reducer";
import { getDetails } from "./state/action";
import EditProductModel from "./EditProduct";
import { Col, Row, Table } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";

const keyProps = {
  "Name": "name", "Description": "description", "Category": "category", "Created At": "createdAt", "Last Update": "updatedAt"
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

const ViewProduct = () => {
  const { state } = useContext(Store);
  const { token } = state;
  const { id } = useParams(); // product/:id

  const [modalShow, setModalShow] = useState(false);
  const [{ loading, error, product }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  // console.log({ error, product })
  useEffect(() => {
    (async () => {
      await getDetails(dispatch, token, id);
    })();
  }, [token, id]);

  useTitle("Product Details");
  return (
    <ViewCard
      title={"Product Details"}
      data={product && { ...product, category: product.category?.name }}
      setModalShow={setModalShow}
      isImage="true"
      image_url={product?.product_img}
      keyProps={keyProps}
      reducerProps={{ error, loading, dispatch }}
    >
      <h3 className="mt-3">Variant</h3>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Canada Quantity</th>
            <th>US Quantity</th>
            <th>Amount</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {product?.subProducts &&
            product.subProducts.map(({ quantity, amount, volume }, i) => (
              <tr key={i} className="odd">
                <td className="text-center">{i + 1}</td>
                <td>{quantity.canada}</td>
                <td>{quantity.us}</td>
                <td>{amount}</td>
                <td>{volume}</td>
              </tr>
            ))}
        </tbody>
      </Table>
      <EditProductModel
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      {!modalShow && <ToastContainer />}
    </ViewCard>
  );
};

export default ViewProduct;