import "./SideNavBar.css";
import React, { useContext, useState } from "react";
import { Store } from "../../states/store";
import { Link, useNavigate } from "react-router-dom";
import { HiUsers } from "react-icons/hi";
import { RiDashboard2Fill } from "react-icons/ri";
import { FaQuestion, FaShoppingBasket, FaSignOutAlt, FaImage } from "react-icons/fa";
import { MdCategory, MdOutlineProductionQuantityLimits } from "react-icons/md";
import { BiMessageDetail } from "react-icons/bi";

const linkList = [
  { icon: <RiDashboard2Fill className="icon-md" />, text: "Dashboard", url: "/admin/dashboard" },
  { icon: <MdCategory className="icon-md" />, text: "Category", url: "/admin/category" },
  { icon: <MdOutlineProductionQuantityLimits className="icon-md" />, text: "Products", url: "/admin/products" },
  { icon: <FaShoppingBasket className="icon-md" />, text: "Orders", url: "/admin/orders" },
  { icon: <HiUsers className="icon-md" />, text: "Wholesalers", url: "/admin/wholesalers" },
  { icon: <BiMessageDetail className="icon-md" />, text: "Chats", url: "/admin/chats" },
  { icon: <FaQuestion className="icon-md" />, text: "FAQs", url: "/admin/faqs" },
  { icon: <FaImage className="icon-md" />, text: "Banners", url: "/admin/banners" },
];

const active_text = {
  "Dashboard": "dashboard",
  "Category": "category",
  "Products": "product",
  "Orders": "order",
  "Wholesalers": "wholesaler",
  "Chats": "chat",
  "FAQs": "faq",
  "Banners": "banner",
};

export default function SideNavbar({ isExpanded }) {
  const pathname = window.location.pathname;
  const [activeLink, setActiveLink] = useState('Dashboard');
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();
  const signoutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");

    navigate("/");
  };

  const activeLinkHandler = (text) => {
    // console.log("text", active_text[text]);
    // console.log(pathname.includes(active_text[text]));
    return pathname.includes(active_text[text]);
  };

  const cls = `nav-item has-treeview ${isExpanded ? "menu-item" : "menu-item menu-item-NX"}`;

  console.log({ userInfo })
  return (
    <>
      {userInfo ? (
        <div
          className={
            isExpanded
              ? "side-nav-container"
              : "side-nav-container side-nav-container-NX"
          }
        >
          <div className="brand-link">
            <img src="/logo/logo.png" alt="" width={isExpanded ? "80%" : "100%"} height="auto" />
            {/* <span className="brand-text ms-2 font-weight-light">
              OMS
            </span> */}
          </div>

          <div className="sidebar">
            {/* Sidebar user panel (optional) */}
            <div className="user-panel mt-3 pb-3 mb-3 d-flex">
              <div className="info">
                <Link to={`${userInfo.role}/view-profile`} className="d-block">
                  {/* {userInfo.profile_img && (
                    <img
                      src={userInfo.profile_img}
                      alt=""
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        marginRight: "0.5rem",
                      }}
                    />
                  )} */}
                  <span className="info-text">
                    Welcome{" "}
                    {userInfo
                      ? `${userInfo.firstname} ${userInfo.lastname}`
                      : "Back"}
                  </span>
                </Link>
              </div>
            </div>
            {/* Sidebar Menu */}
            <nav className="mt-2">
              <ul
                className="nav-pills nav-sidebar px-0 d-flex flex-column flex-wrap"
                data-widget="treeview"
                role="menu"
                data-accordion="false"
              >
                {linkList.map(({ icon, text, url }) => (
                  <li
                    key={url}
                    className={`${cls} ${activeLinkHandler(text) && "active-item"
                      }`}
                    onClick={() => setActiveLink(text)}
                  >
                    <Link to={url} className="nav-link">
                      {icon}
                      <p className="ms-2">{text}</p>
                    </Link>
                  </li>
                ))}

                <li className={cls}>
                  <Link onClick={signoutHandler} to="/" className="nav-link">
                    <FaSignOutAlt className="icon-md" />
                    <p className="ms-2">Log Out</p>
                  </Link>
                </li>
              </ul>
            </nav>
            {/* /.sidebar-menu */}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
