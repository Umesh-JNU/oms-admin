import React, { useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Store } from "../states/store";
import { MessageBox } from "../components";
import jwt_decode from "jwt-decode";

export default function AdminProtectedRoute({ children }) {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo, token } = state;

  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      if (jwt_decode(token)?.exp < Date.now() / 1000) {
        ctxDispatch({ type: "USER_SIGNOUT" });
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");

        navigate("/");
      }
    };

    checkToken();
  }, [token]);

  return userInfo ? (
    userInfo.role === "admin" ? (
      children
    ) : (
      <MessageBox variant={"danger"}>Restricted</MessageBox>
    )
  ) : (
    <Navigate to="/" />
  );
}
