import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { MessageBox } from '../components';
import { Store } from '../states/store';

export default function SaleProtectedRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  console.log("user", userInfo)
  return userInfo ? (userInfo.role === "sale-person" ? (children) : <MessageBox variant={"danger"}>Restricted</MessageBox>) : <Navigate to="/" />;
}