import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { Store } from "../states/store";
import { reducer } from "../states/reducers";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useTitle } from "../components";
import { toastOptions } from "../utils/error";
import { clearErrors, login } from "../states/actions";

export default function AdminLoginScreen() {
  // const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { token, userInfo } = state;

  const navigate = useNavigate();
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: false,
    error: "",
  });

  const submitHandler = async (e) => {
    e.preventDefault();

    await login(ctxDispatch, dispatch, { email, password });
  };

  useEffect(() => {
    // if (token) {
    //   // setTimeout(() => {
    //   // navigate(userInfo.role === 'admin' ? "/admin/dashboard" : "/sale-person/dashboard");
    //   navigate("/admin/active-sale-tasks");
    //   // }, 1000);
    // }
    if (error) {
      toast.error(error, toastOptions);
      clearErrors(dispatch);
    }
  }, [error, token]);


  useTitle("Login");
  return (
    <Container fluid className="p-0 vh-100 f-center flex-column login-page">
      <div className="login-logo">
        <Link to="/" className="text-center">
          <b>OMS</b>
        </Link>
      </div>

      {/* <div className="f-center mb-4">
        <div
          className={`toggle-link-item ${role === "admin" && 'active-link'}`}
          style={{ cursor: "pointer" }}
          onClick={() => { setRole("admin") }}
        >
          Admin
        </div>
        <div
          className={`toggle-link-item ${role === "sale-person" && 'active-link'}`}
          style={{ cursor: "pointer" }}
          onClick={() => { setRole("sale-person") }}
        >
          Sale Person
        </div>
      </div> */}
      <Card className="login-box">
        <Card.Body>
          <p className="text-center">Sign in to start your session</p>
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="text" className="input-group mb-3">
              <Form.Control
                placeholder="Email/Mobile"
                type="text"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <InputGroup.Text>
                <FaEnvelope />
              </InputGroup.Text>
            </Form.Group>
            <Form.Group controlId="password" className="input-group mb-3">
              <Form.Control
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <InputGroup.Text>
                <FaLock />
              </InputGroup.Text>
            </Form.Group>
            <Row>
              <Col sm={7} className="mb-sm-0 mb-3">
                <Form.Group controlId="remember">
                  <Form.Check
                    type="checkbox"
                    id="default-checkbox"
                    label="Remember Me"
                  />
                </Form.Group>
              </Col>
              <Col sm={5}>
                {loading ? (
                  <Button type="submit" className="float-sm-end" disabled>
                    <Spinner animation="border" size="sm" />
                  </Button>
                ) : (
                  <Button id="login_submit" type="submit" className="float-sm-end">
                    Sign In
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
          <ToastContainer />
        </Card.Body>
      </Card>
    </Container>
  );
}
