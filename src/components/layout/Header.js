import React, { useContext } from "react";
import { Store } from "../../states/store";
import { Link } from "react-router-dom";
import { Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import { FaUserCircle, FaBars, FaUser } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";

export default function Header({ sidebarHandler }) {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  return (
    <>
      {userInfo ? (
        <Navbar className="header">
          <Container fluid className="ps-0">
            <GiHamburgerMenu
              style={{
                fontSize: "1.5rem",
                color: "#fff",
                marginLeft: "1.75rem",
                cursor: "pointer",
              }}
              onClick={() => sidebarHandler()}
            />

            <Nav className="ms-auto">
              <Dropdown align="end">
                <Dropdown.Toggle
                  id="user_profile"
                  className="right-profile-logo"
                >
                  {userInfo.profile_img ?
                    <img
                      src={userInfo.profile_img}
                      alt="profile_img"
                      className="dropdown-logo"
                    /> :
                    <FaUserCircle size={"25px"} />}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Header>
                    Signed in as
                    <br />
                    <b>{userInfo.firstname} {userInfo.lastname}</b>
                  </Dropdown.Header>

                  <Dropdown.Divider />
                  <Dropdown.Item>
                    <Link to={`${userInfo.role}/view-profile`} className="dropdown-item">
                      <FaUser className="me-2" /> Profile
                    </Link>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Container>
        </Navbar>
      ) : (
        <></>
      )}
    </>
  );
}
