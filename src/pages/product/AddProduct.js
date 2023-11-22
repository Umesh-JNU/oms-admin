import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";

import { ToastContainer, toast } from "react-toastify";
import reducer from "./state/reducer";
import { create } from "./state/action";
import { useTitle, AddForm, TextInput, UploadFileComp } from "../../components";
import { getAll } from "../category/state/action";
import { Button, Col, Row } from "react-bootstrap";
import { toastOptions } from "../../utils/error";

export default function AddProduct() {
  const { state } = useContext(Store);
  const { token } = state;

  const [{ loading, error, success, categories }, dispatch] = useReducer(reducer, {
    loading: false,
    error: "",
  });

  const [quantity, setQuantity] = useState({ canada: "", us: "" });
  const [amount, setAmount] = useState("");
  const [volume, setVolume] = useState(0);
  const [variant, setVariant] = useState([]);

  const productData = {
    name: "",
    description: "",
    product_img: "",
    category: ""
  };
  const productAttr = [
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
        name: "description",
        maxLength: 250,
        required: true
      }
    },
    {
      type: "select",
      col: 12,
      props: {
        label: "Category",
        name: "category",
        placeholder: "Select Category",
        options: categories && categories.map(({ _id, name }) => {
          return { [_id]: name };
        })
      }
    }
  ];
  const [info, setInfo] = useState(productData);
  const [productImage, setProductImage] = useState("");
  const imageHandler = (location) => {
    setProductImage(location);
    setInfo({ ...info, product_img: location });
  }

  useEffect(() => {
    console.log({ d: "dfdfd" })
    const fetchData = async () => {
      console.log("getting all category")
      await getAll(dispatch, token, '', '', '');
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    setVariant([]);
  }, [error]);

  const resetForm = () => {
    setInfo(productData);
    setVariant([]);
    setProductImage("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!info.category) {
      toast.warning("Please select a category.", toastOptions);
      return;
    }
    if (variant.length <= 0) {
      toast.warning("Please provide at least one variant.", toastOptions);
      return;
    }
    if (!productImage || !info.product_img) {
      toast.warning("Please select at at least one image for product or wait till image is uploaded.", toastOptions);
      return;
    }
    await create(dispatch, token, { ...info, variant });
    resetForm();
  };


  const qtyHandler = (e) => {
    setQuantity({ ...quantity, [e.target.name]: e.target.value });
  }

  const priceHandler = () => {
    if (!quantity.us || !quantity.canada) {
      toast.warning("Canada and US Qauntity is required.", toastOptions);
      return;
    }
    if (!amount) {
      toast.warning("Please set an amount for the quantity.", toastOptions);
      return;
    }
    if (!volume) {
      toast.warning("Please set a volume for the quantity.", toastOptions);
      return;
    }
    variant.push({ quantity, amount, volume, stock: volume > 0 });
    setQuantity({ canada: "", us: "" });
    setAmount("");
    setVolume(0);
  };

  useTitle("Create Product");
  return (
    <AddForm
      title="Add Product"
      data={info}
      setData={setInfo}
      inputFieldProps={productAttr}
      submitHandler={submitHandler}
      target="/admin/products"
      successMessage="Product Created Successfully!"
      reducerProps={{ loading, error, success, dispatch }}
    >
      <UploadFileComp label="Upload Image" accept="image/*" required={true} file={productImage} setFile={imageHandler} fileType="image" imageMargin={'mb-3'}/>

      <Row style={{ borderTop: "1px solid #0000002d" }}>
        <h5 style={{ margin: "1rem 0", textAlign: "center" }}>Variant Details</h5>
        <Col md={6}>
          <TextInput label="Quantity As Per Canada (in ml)" type="number" min={1} name="canada" value={quantity.canada} onChange={qtyHandler} />
        </Col>
        <Col md={6}>
          <TextInput label="Quantity As Per United States (in fl. Oz.)" type="number" min={1} name="us" value={quantity.us} onChange={qtyHandler} />
        </Col>
        <Col md={3}>
          <TextInput label="Price" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Col>
        <Col md={3}>
          <TextInput label="Stock" type="number" min={0} value={volume} onChange={(e) => setVolume(e.target.value)} />
        </Col>
        <Col>
          <Button className="mt-4" onClick={priceHandler}>
            Add Quantity
          </Button>
        </Col>
      </Row>
      <Row>
        {variant && variant.length > 0 && (
          <div className="table-responsive">
            <table
              id="example1"
              className="table table-bordered table-striped col-6"
            >
              <thead>
                <tr>
                  <th>Canada Quantity</th>
                  <th>US Quantity</th>
                  <th>Price</th>
                  <th>Volume</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {variant.map(({ quantity, amount, volume }, i) => (
                  <tr key={i}>
                    <td>{quantity.canada}</td>
                    <td>{quantity.us}</td>
                    <td>{amount}</td>
                    <td>{volume}</td>
                    <td>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          const index = variant.findIndex(
                            (q) =>
                              q.quantity.canada === quantity.canada &&
                              q.quantity.us === quantity.us &&
                              q.amount === amount &&
                              q.volume === volume
                          );
                          // console.log({ index });
                          if (index > -1) {
                            // only splice array when item is found

                            setVariant([
                              ...variant.slice(0, index),

                              // part of the array after the given item
                              ...variant.slice(index + 1),
                            ]);
                          }
                        }}
                        type="danger"
                        className="btn btn-danger btn-block"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Row>
      <ToastContainer />
    </AddForm>
  );
}