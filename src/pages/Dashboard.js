import React, { useContext, useEffect, useReducer } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { Store } from "../states/store";
// icons
import { MdContactPhone } from "react-icons/md";
import { BsShieldFillPlus } from "react-icons/bs";
import { FaArrowCircleRight } from "react-icons/fa";
import { BiSolidShieldMinus, BiSolidShieldX } from "react-icons/bi";
import { HiShieldCheck, HiShieldExclamation } from "react-icons/hi";


import Skeleton from "react-loading-skeleton";
import axiosInstance from "../utils/axiosUtil";
import { getError } from "../utils/error";
import { MotionDiv, MessageBox, CountUp } from "../components";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};


const card = [
  {
    key: "awaited",
    bg: "primary",
    icon: <BsShieldFillPlus />,
    text: "Awaited Warranties",
    url: "/admin/warranty/?status=AWAITED"
  },
  {
    key: "passed",
    bg: "success-1",
    icon: <HiShieldCheck />,
    text: "Passed Warranties",
    url: "/admin/warranty/?status=PASSED"
  },
  {
    key: "active",
    bg: "success",
    icon: <HiShieldCheck />,
    text: "Active Warranties",
    url: "/admin/warranty/?status=ACTIVE"
  },
  {
    key: "rejected",
    bg: "danger",
    icon: <BiSolidShieldX />,
    text: "Rejected Warranties",
    url: "/admin/warranty/?status=REJECTED"
  },
  {
    key: "toExpired",
    bg: "warning",
    icon: <HiShieldExclamation />,
    text: "Expiring Warranties In 30 Days",
    url: "/admin/warranty/?status=TO-BE-EXPIRED"
  },
  {
    key: "expired",
    bg: "danger",
    icon: <BiSolidShieldMinus />,
    text: "Expired Warranties",
    url: "/admin/warranty/?status=EXPIRED"
  },
  {
    key: "enquiry",
    bg: "info",
    icon: <MdContactPhone />,
    text: "Enquiry",
    url: "/admin/enquiry"
  }
];

const ViewCard = ({ loading, data, bg, icon, text, url }) => {
  return (
    <div>
      {loading ? (
        <Skeleton count={5} />
      ) : (
        <div className={`small-box bg-${bg}`}>
          {/* <div className="inner p-sm-1 p-md-2 p-lg-3"> */}
          <div className="inner">
            <CountUp start={0} end={data} duration={2} />
            {/* <h1>
              {data && data[0] ? data[0].total : 0}
            </h1> */}
            <h5 style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap', 
              textOverflow: 'ellipsis'
            }}>{text}</h5>
          </div>
          <div className="icon">
            {icon}
          </div>
          <Link to={url} className="small-box-footer">
            More info {<FaArrowCircleRight />}
          </Link>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  const { state } = useContext(Store);
  const { token } = state;

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       dispatch({ type: "FETCH_REQUEST" });
  //       const { data } = await axiosInstance.get(
  //         `/api/admin/summary`,
  //         {
  //           headers: { Authorization: token },
  //         }
  //       );
  //       console.log({ data })
  //       dispatch({ type: "FETCH_SUCCESS", payload: data });
  //     } catch (err) {
  //       dispatch({
  //         type: "FETCH_FAIL",
  //         payload: getError(err),
  //       });
  //       toast.error(getError(err), {
  //         position: toast.POSITION.BOTTOM_CENTER,
  //       });
  //     }
  //   })();
  // }, [token]);

  return (
    <MotionDiv>
      {error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
        <h3>Dashboard</h3>
          {/* <Row
            className="my-3 pb-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.2)" }}
          >
            <Col md={6}>
              <h3>Active Sale Tasks</h3>
            </Col>
            <Col md={6}></Col>
          </Row>

          <Row className="m-0 mb-3">
            {card.map(({ key, bg, icon, text, url }) => (
              <Col key={url} lg={4} md={6} sm={12} className="p-sm-1 p-md-2 p-lg-3">
                <ViewCard loading={loading} data={summary && summary[key]} bg={bg} icon={icon} text={text} url={url} />
              </Col>
            ))}
          </Row> */}
          <ToastContainer />
        </>
      )}
    </MotionDiv >
  );
}
