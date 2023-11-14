import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Store } from "../states/store";

export default function UnprotectedRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  return userInfo && userInfo.role === "admin" ? (
    <Navigate to="/admin/dashboard" />
  ) : (
    children
  );
}
