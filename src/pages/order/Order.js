
import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";
import { clearErrors } from "../../states/actions";
import { useNavigate } from "react-router-dom";

import { Button, Card, Form, InputGroup, Table } from "react-bootstrap";
import { IoMdOpen } from "react-icons/io";
import { FaEye, FaSearch, FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

import {
  MessageBox,
  useTitle,
  MotionDiv,
  ArrayView,
  CustomPagination,
  DeleteButton,
  CustomSkeleton,
} from "../../components";
import reducer from "./state/reducer";
import { getAll, del } from "./state/action";
import { toastOptions } from "../../utils/error";

export default function Orders() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { token } = state;

  const [status, setStatus] = useState("all");
  const [curPage, setCurPage] = useState(1);
  const [resultPerPage, setResultPerPage] = useState(15);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const [productList, setProductList] = useState([]);

  const curPageHandler = (p) => setCurPage(p);
  const showModelHandler = (ls) => {
    console.log("product_list", ls);
    setProductList([...ls]);
    setModalShow(true);
  };

  const [{ loading, error, orders, ordersCount }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });
  console.log({ orders })

  const deleteOrder = async (id) => {
    await del(dispatch, token, id);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getAll(dispatch, token, curPage, resultPerPage, query, status)
    }
    fetchData();
  }, [token, curPage, resultPerPage, query, status]);

  useEffect(() => {
    if (error) {
      toast.error(error, toastOptions);
      clearErrors(dispatch);
    }
  }, [error]);

  const numOfPages = Math.ceil(ordersCount / resultPerPage);
  const skip = resultPerPage * (curPage - 1);
  // console.log("nuofPage", numOfPages, resultPerPage);
  useTitle("Orders");
  return (
    <MotionDiv>
      {error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Card>
          <Card.Header>
            <div className="float-start d-flex align-items-center">
              <p className="p-bold m-0 me-3">Filter by Status</p>
              <Form.Group controlId="status">
                <Form.Select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setCurPage(1);
                  }}
                  aria-label="Default select example"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="delivered">Delivered</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="search-box float-end">
              <InputGroup>
                <Form.Control
                  aria-label="Search Input"
                  placeholder="Search by Order Id"
                  type="search"
                  maxLength="6"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <InputGroup.Text
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setQuery(searchInput);
                    setCurPage(1);
                  }}
                >
                  <FaSearch />
                </InputGroup.Text>
              </InputGroup>
            </div>
          </Card.Header>
          <Card.Body>
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Order Id</th>
                  <th>User</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <CustomSkeleton resultPerPage={resultPerPage} column={8} />
                ) : (
                  orders &&
                  orders.map((order, i) => (
                    <tr key={order._id} className="odd">
                      <td className="text-center">{skip + i + 1}</td>
                      <td>{order.orderId && order.orderId}</td>
                      <td>
                        {order.userId &&
                          `${order.userId.firstname} ${order.userId.lastname}`}
                      </td>
                      <td className="text-center">
                        <IoMdOpen
                          className="open-model"
                          onClick={() => showModelHandler(order.products)}
                        />
                      </td>
                      <td>{order.amount}</td>
                      <td>{order.status}</td>
                      <td>{order.address?.town}</td>
                      <td>
                        <Button
                          onClick={() => {
                            navigate(`/admin/view/order/${order._id}`);
                          }}
                          type="success"
                          className="btn btn-primary"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          onClick={() => {
                            deleteOrder(order._id);
                          }}
                          type="danger"
                          className="btn btn-danger ms-2"
                        >
                          <FaTrashAlt />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
          <Card.Footer>
            <div className="float-start d-flex align-items-center mt-3">
              <p className="p-bold m-0 me-3">Row No.</p>
              <Form.Group controlId="resultPerPage">
                <Form.Select
                  value={resultPerPage}
                  onChange={(e) => {
                    setResultPerPage(e.target.value);
                    setCurPage(1);
                  }}
                  aria-label="Default select example"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </Form.Select>
              </Form.Group>
            </div>
            {numOfPages > 0 && (
              <CustomPagination
                pages={numOfPages}
                pageHandler={curPageHandler}
                curPage={curPage}
              />
            )}
          </Card.Footer>
        </Card>
      )}
      {productList && modalShow ? (
        <ArrayView
          show={modalShow}
          onHide={() => setModalShow(false)}
          arr={productList && productList.length > 0 && productList.map(({ product, quantity, parent_prod }) => {
            return {
              name: parent_prod?.name,
              type: product?.quantity.canada + ' ml',
              amount: product?.amount,
              qty: quantity,
            }
          })}
          column={{ "Product Name": "name", "Variant Type": "type", "Variant Amount": "amount", "Quantity": "qty" }}
          title="Product List"
        />
      ) : (
        <></>
      )}
      <ToastContainer />
    </MotionDiv >
  );
}
