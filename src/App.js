import { useContext, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Store } from "./states/store";

import { AdminProtectedRoute, UnprotectedRoute } from "./routes";
import { Header, SideNavBar, NotFound } from "./components";
import {
  AdminLoginScreen, Dashboard, Profile,
  Users, AddUser, ViewUser,
  Category, AddCategory, ViewCategory,
  Product, AddProduct, ViewProduct,
  Order, ViewOrder,
  FAQ, AddFAQ, 
  Banners, AddBanner, 
  Chat
} from "./pages";

function App() {
  const { state } = useContext(Store);
  const { token } = state;

  const pageLocation = useLocation();

  const [isExpanded, setExpandState] = useState(window.innerWidth > 768);
  const sidebarHandler = () => setExpandState((prev) => !prev);

  const routeList = [
    { path: "/admin/view-profile", element: <Profile /> },
    // { path: "/admin/dashboard", element: <Dashboard /> },
    { path: "/admin/wholesalers", element: <Users /> },
    { path: "/admin/wholesaler/create", element: <AddUser /> },
    { path: "/admin/view/wholesaler/:id", element: <ViewUser /> },
    { path: "/admin/category", element: <Category /> },
    { path: "/admin/category/create", element: <AddCategory /> },
    { path: "/admin/view/category/:id", element: <ViewCategory /> },
    { path: "/admin/products", element: <Product /> },
    { path: "/admin/product/create", element: <AddProduct /> },
    { path: "/admin/view/product/:id", element: <ViewProduct /> },
    { path: "/admin/faqs", element: <FAQ /> },
    { path: "/admin/faq/create", element: <AddFAQ /> },
    { path: "/admin/orders", element: <Order /> },
    { path: "/admin/view/order/:id", element: <ViewOrder /> },
    { path: "/admin/banners", element: <Banners /> },
    { path: "/admin/banner/create", element: <AddBanner /> },
    { path: "/admin/chats", element: <Chat /> },
  ];

  return (
    <div className="main-wrapper">
      {isExpanded && token && (
        <div className="sidebar-overlay" onClick={sidebarHandler}></div>
      )}
      <div className="sidebar-wrapper">
        <SideNavBar isExpanded={isExpanded} />
      </div>
      <div
        className={`body-wrapper ${isExpanded ? "mini-body" : "full-body"}
        ${token ? "" : "m-0"} d-flex flex-column`}
      >
        <Header sidebarHandler={sidebarHandler} />
        <Routes location={pageLocation} key={pageLocation.pathname}>
          <Route
            path="/"
            element={
              <UnprotectedRoute>
                <AdminLoginScreen />
              </UnprotectedRoute>
            }
          />

          {routeList.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<AdminProtectedRoute>{element}</AdminProtectedRoute>}
            />
          ))}

          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default App;
