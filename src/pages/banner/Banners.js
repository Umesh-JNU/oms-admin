
import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";

import { getError } from "../../utils/error";
import { Button, Card, Row, Col, Image } from "react-bootstrap";
import { MessageBox, useTitle, MotionDiv, DeleteButton } from "../../components";
import Skeleton from "react-loading-skeleton";
import axiosInstance from "../../utils/axiosUtil";
import { useNavigate } from "react-router-dom";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };

    case "FETCH_SUCCESS":
      return {
        ...state,
        banners: action.payload.banners,
        loading: false,
      };

    case "DELETE_SUCCESS":
      const deletedId = action.payload;
      const updatedBanners = state.banners.filter(banner => banner._id !== deletedId);
      return {
        ...state,
        banners: updatedBanners,
        loading: false
      };

    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default function Banners() {
  const { state } = useContext(Store);
  const { token } = state;

  const navigate = useNavigate();
  const [{ loading, error, banners }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  console.log("ALL BANNERS", banners)

  const deleteBanner = async (id) => {
    try {
      dispatch({ type: "FETCH_REQUEST" });

      const { data } = await axiosInstance.delete(`/api/admin/banner/${id}`, {
        headers: { Authorization: token }
      });
      if (data.message) {
        dispatch({ type: "DELETE_SUCCESS", payload: id });
      }
    } catch (error) {
      dispatch({ type: "FETCH_FAIL", payload: getError(error) });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });

        const { data } = await axiosInstance.get("/api/banner/all", {
          headers: { Authorization: token }
        });

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: getError(error) })
      }
    })();
  }, [token]);

  useTitle("Banners");
  return (
    <MotionDiv>
      {error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Card>
          <Card.Header>
            <Button
              onClick={() => navigate(`/admin/banner/create`)}
              type="success"
              className="btn btn-primary btn-block mt-1"
            >
              Add Banner
            </Button>
          </Card.Header>

          <Card.Body style={{ backgroundColor: loading ? '#fff' : '#d1d1d1', paddingBottom: loading ? '1rem' : 0 }}>
            <Row>
              {loading
                ? [...Array(4).keys()].map(i => (
                  <Col md={6} key={i} className="p-3"><Skeleton height={150} /></Col>
                ))
                : banners && banners.length === 0 ? <div><h5>No Banners</h5><p>Please add a new banner</p></div> : banners.map(({ img_url, _id }) => (
                  <Col md={6} key={_id} className="position-relative">
                    <div style={{
                      position: 'absolute',
                      right: '1.25rem',
                      top: '5px'
                    }}>
                      <DeleteButton onClick={() => deleteBanner(_id)} />
                    </div>
                    <Image className="img-fluid mb-3" src={img_url} rounded />
                  </Col>
                ))}
            </Row>
          </Card.Body>
        </Card>
      )
      }
    </MotionDiv >
  );
}
