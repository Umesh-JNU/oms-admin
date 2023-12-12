import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";
import { useParams } from "react-router-dom";

import { Col, Row, Table } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { useTitle, ViewCard } from "../../components";
import reducer from "./state/reducer";
import { getDetails } from "./state/action";
import Skeleton from "react-loading-skeleton";
import { clearSuccess } from "../../states/actions";

const keyProps = {
  "Order Id": "orderId", "User": "username", "Created At": "createdAt", "Last Update": "updatedAt"
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

const ViewOrder = () => {
  const { state } = useContext(Store);
  const { token } = state;
  const { id } = useParams(); // order/:id

  const [modalShow, setModalShow] = useState(false);
  const [{ loading, error, order, success }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  useEffect(() => {
    (async () => {
      await getDetails(dispatch, token, id);
    })();
  }, [token, id]);

  useEffect(() => {
    if (success) {
      toast.success("Order Status Updated Succesfully", {
        position: toast.POSITION.TOP_RIGHT,
      });
      clearSuccess(dispatch);
    }
  }, [success])


  useTitle("Order Details");
  return (
    <ViewCard
      title={"Order Details"}
      data={order && { ...order, username: `${order.userId.firstname} ${order.userId.lastname}` }}
      setModalShow={setModalShow}
      keyProps={keyProps}
      // isImage={true}
      // image_url={user ? user.profile_img : ""}
      isEdit={false}
      reducerProps={{ error, loading, dispatch }}
    >
      {/* <Row>
        <h3 className="mt-3">Order Status</h3>
        {loading ? <Skeleton height={30} /> :
          <>
            <Col md={4}>
              <SelectInput
                placeholder="Select Order Status"
                options={[{ "in-progress": "In-Progress" }, { "paid": "Paid" }, { "delivered": "Delivered" }, {"cancelled": "Cancelled"}]}
                onChange={(e) => setStatus(e.target.value)}
                value={status ? status : order?.status}
              />
            </Col>
            <Col md={4}>
              <SubmitButton loading={loadingUpdate} onClick={async () => await updateStatus(dispatch, token, id, status)}>Update Status</SubmitButton>
            </Col>
          </>
        }
      </Row> */}

      <Details
        title="Address"
        loading={loading}
        data={order}
        detailKey="address"
        fields={{ "Province": "province", "Town": "town", "Street": "street", "Post Code": "post_code", "Mobile No.": "mobile_no" }}
      />

      <h3 className="mt-3">Product Details</h3>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Product Name</th>
            {/* <th>Variant Type</th> */}
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {order?.products &&
            order.products.map(({ product, quantity, parent_prod }, i) => (
              <tr key={product._id} className="odd">
                <td className="text-center">{i + 1}</td>
                <td>{parent_prod?.name}</td>
                {/* <td>{product?.quantity.canada + ' ml'}</td> */}
                <td>{quantity}</td>
              </tr>
            ))}
        </tbody>
      </Table>
      {!modalShow && <ToastContainer />}
    </ViewCard>
  );
};

export default ViewOrder;