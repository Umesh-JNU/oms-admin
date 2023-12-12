
import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";
import { clearErrors } from "../../states/actions";
import { useNavigate } from "react-router-dom";

import { IoMdOpen } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import {
  MessageBox,
  useTitle,
  MotionDiv,
  CustomTable,
  ViewButton,
  DeleteButton,
  ArrayView,
} from "../../components";
import reducer from "./state/reducer";
import { getAll, del } from "./state/action";
import { toastOptions } from "../../utils/error";

export default function Products() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { token } = state;

  const [curPage, setCurPage] = useState(1);
  const [resultPerPage, setResultPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  const curPageHandler = (p) => setCurPage(p);
  const [variant, setVariant] = useState([]);
  const [categoryCountry, setCategoryCountry] = useState();
  const [modalShow, setModalShow] = useState(false);
  const showModelHandler = (ls, location) => {
    // // console.log("product_list", ls);
    setCategoryCountry(location);
    setVariant([...ls]);
    setModalShow(true);
  };

  const [{ loading, error, products, productCount }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });
  console.log({ products })
  const deleteProduct = async (id) => {
    await del(dispatch, token, id);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getAll(dispatch, token, curPage, resultPerPage, query)
    }
    fetchData();
  }, [token, curPage, resultPerPage, query]);

  useEffect(() => {
    if (error) {
      toast.error(error, toastOptions);
      clearErrors(dispatch);
    }
  }, [error]);

  const numOfPages = Math.ceil(productCount / resultPerPage);
  const skip = resultPerPage * (curPage - 1);
  // console.log("nuofPage", numOfPages, resultPerPage);

  const column = [
    "S.No",
    "Image",
    "Name",
    "Variant",
    "Category",
    "Description",
    "Actions"
  ];

  useTitle("Products");
  return (
    <MotionDiv>
      {error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <CustomTable
          loading={loading}
          column={column}
          rowNo={resultPerPage}
          rowProps={{ setResultPerPage }}
          paging={numOfPages > 0}
          pageProps={{ numOfPages, curPage }}
          pageHandler={curPageHandler}
          search={true}
          searchProps={{ searchInput, setSearchInput, setQuery }}
          isCreateBtn="true"
          createBtnProps={{
            createURL: "/admin/product/create",
            text: "Product"
          }}
        // isTitle="true"
        // title="Users"
        >
          {products && products.length > 0 &&
            products.map((product, i) => (
              <tr key={product._id} className="odd">
                <td className="text-center">{skip + i + 1}</td>
                <td>
                  <img
                    className="td-img"
                    src={product.product_img}
                    alt=""
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                    }}
                  />
                </td>
                <td>{product.name}</td>
                <td>
                  <IoMdOpen
                    className="open-model"
                    onClick={() => showModelHandler(product.subProducts, product.category?.location)}
                  />
                </td>
                <td>
                  {product.category ? (
                    `${product.category.name} - ${product.category.location}`
                  ) : (
                    <b>Category not set</b>
                  )}
                </td>
                <td>{product.description}</td>
                <td>
                  <ViewButton
                    onClick={() => navigate(`/admin/view/product/${product._id}`)}
                  />
                  <DeleteButton onClick={() => deleteProduct(product._id)} />
                </td>
              </tr>
            ))}
        </CustomTable>
      )}
      {variant && modalShow ? (
        <ArrayView
          show={modalShow}
          onHide={() => setModalShow(false)}
          arr={variant}
          column={{ [categoryCountry === 'CA' ? "Quantity (in ml)" : "Quantity (in fl. Oz.)"]: "quantity", "Stock": "stock" }}
          // arr={variant && variant.length > 0 && variant.map((v) => {
          //   return { ...v, canada: v.quantity.canada, us: v.quantity.us }
          // })}
          // column={{ "Canada Quantity (in ml)": "canada", "US Quantity (in fl. Oz.)": "us", "Amount": "amount", "Volume": "volume" }}
          title="Variant List"
        />
      ) : (
        <></>
      )}
      <ToastContainer />
    </MotionDiv>
  );
}
