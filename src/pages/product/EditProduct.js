import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";
import { useParams } from "react-router-dom";
import reducer from "./state/reducer";
import { getDetails, update } from "./state/action";
import { EditForm, RadioInput, TextInput, UploadFileComp } from "../../components";
import { FaCheck } from 'react-icons/fa';
import { ImCross } from "react-icons/im";
import { Button, Col, ProgressBar, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { getError, toastOptions } from "../../utils/error";
import { getAll } from "../category/state/action";
import axiosInstance from "../../utils/axiosUtil";

export default function EditProductModel(props) {
  const { state } = useContext(Store);
  const { token } = state;
  const { id } = useParams();  // product/:id

  const [{ loading, error, loadingUpdate, product, categories, success }, dispatch] = useReducer(reducer, {
    loading: true,
    loadingUpdate: false,
    error: "",
  });

  // const [quantity, setQuantity] = useState({ canada: "", us: "" });
  // const [amount, setAmount] = useState("");
  // const [volume, setVolume] = useState(0);
  const [quantity, setQuantity] = useState();
  const [stock, setStock] = useState(true);
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
    if (product && product._id === id) {
      console.log({ product })
      setInfo({
        name: product.name,
        description: product.description,
        product_img: product.product_img,
        category: product.category?._id
      });
      setVariant([...product.subProducts])
      setProductImage(product.product_img)
    }

    (async () => {
      await getAll(dispatch, token, '', '', '');
      await getDetails(dispatch, token, id);
    })();
  }, [id, props.show]);

  const resetForm = () => { setInfo(productData); };
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
    await update(dispatch, token, id, info);
    if (success) {
      resetForm();
    }
  };

  // const qtyHandler = (e) => {
  //   setQuantity({ ...quantity, [e.target.name]: e.target.value });
  // }

  const variantHandler = async () => {
    // if (!quantity.us || !quantity.canada) {
    //   toast.warning("Canada and US Qauntity is required.", toastOptions);
    //   return;
    // }
    // if (!amount) {
    //   toast.warning("Please set an amount for the quantity.", toastOptions);
    //   return;
    // }
    // if (!volume) {
    //   toast.warning("Please set a volume for the quantity.", toastOptions);
    //   return;
    // }
    if (!quantity) {
      toast.warning("Quantity is required.", toastOptions);
      return;
    }

    try {
      const { data } = await axiosInstance.post("/api/admin/sub-product/create", { pid: id, quantity, stock },
        { headers: { Authorization: token } }
      );

      console.log({ data });
      variant.push(data.subProduct);
      setQuantity("");
      setStock();
    } catch (error) {
      toast.error(getError(error), toastOptions);
    }
  };

  const deleteVariant = async (e, variantID) => {
    e.preventDefault();
    if (variant.length === 1) {
      toast.warning("Can't be deleted, as there must be at least one variant.", toastOptions);
      return;
    }
    try {
      await axiosInstance.delete(`/api/admin/sub-product/${variantID}`, { headers: { Authorization: token } }
      );

      const index = variant.findIndex((q) => q._id === variantID);
      // console.log({ index });
      if (index > -1) {
        // only splice array when item is found

        setVariant([
          ...variant.slice(0, index),

          // part of the array after the given item
          ...variant.slice(index + 1),
        ]);
      }
    } catch (error) {
      toast.error(getError(error), toastOptions);
    }
  }

  return (
    <EditForm
      {...props}
      title="Edit Product"
      data={info}
      setData={setInfo}
      inputFieldProps={productAttr}
      submitHandler={submitHandler}
      target="/admin/products"
      successMessage="Product Updated Successfully! Redirecting..."
      reducerProps={{ loadingUpdate, error, success, dispatch }}
    >
      <UploadFileComp label="Upload Image" accept="image/*" file={productImage} setFile={imageHandler} fileType="image" imageMargin={"mb-3"} />

      <Row style={{ borderTop: "1px solid #0000002d" }}>
        <h5 style={{ margin: "1rem 0", textAlign: "center" }}>Variant Details</h5>
        <Col md={12}>
          <TextInput label="Quantity" type="number" placeholder="Quantity / Volume of Variant" min={1} name="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </Col>
        <Col md={6}>
          <h6>Stock</h6>
          <RadioInput label="In-Stock" name="stock" checked={stock} onChange={e => setStock(true)} />
          <RadioInput label="Out-of-Stock" name="stock" checked={!stock} onChange={e => setStock(false)} />
        </Col>
        <Col>
          <Button className="mt-4" onClick={variantHandler}>
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
                  <th>Quantity</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {variant.map(({ quantity, stock, _id }, i) => (
                  <tr key={i}>
                    <td>{quantity}</td>
                    <td>{stock ? <FaCheck className="green" /> : <ImCross className="red" />}</td>
                    <td>
                    <Button
                        onClick={(e) => { deleteVariant(e, _id) }}
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

      {/* <Row style={{ borderTop: "1px solid #0000002d" }}>
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
          <Button className="mt-4" onClick={variantHandler}>
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
                {variant.map(({ quantity, amount, volume, _id }, i) => (
                  <tr key={i}>
                    <td>{quantity.canada}</td>
                    <td>{quantity.us}</td>
                    <td>{amount}</td>
                    <td>{volume}</td>
                    <td>
                      <Button
                        onClick={(e) => { deleteVariant(e, _id) }}
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
      </Row> */}
    </EditForm>
  );
}