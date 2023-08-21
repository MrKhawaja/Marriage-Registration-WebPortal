import { Button, Flex, Heading } from "@chakra-ui/react";
import React from "react";
import SideNavLink from "./SideNavLink";
import "./nav.css";
import SideNavLinkGroup from "./SideNavLinkGroup";
import { useNavigate } from "react-router-dom";

const SideNav = ({ user, setUser }) => {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    setUser(false);
    navigate("/login");
  };
  return (
    <Flex
      position={"fixed"}
      minHeight={"100vh"}
      width={"350px"}
      bg="gray.800"
      flexDirection={"column"}
      p={5}
      alignItems="center"
    >
      <Heading color="white" mb={10}>
        Dashboard
      </Heading>
      <SideNavLinkGroup groupName={"Profile"}>
        <SideNavLink to="/marriages" title={"Marriages"} />
      </SideNavLinkGroup>
      <SideNavLinkGroup groupName={"Requests"}>
        <SideNavLink to="/request/send" title={"Send Request"} />
        <SideNavLink to="/request/recieved" title={"Recieved Requests"} />
      </SideNavLinkGroup>
      {user && user.isAdmin && (
        <SideNavLinkGroup groupName={"Admin"}>
          <SideNavLink to="/admin/approve" title={"Approve Marriages"} />
          <SideNavLink to="/admin/divorce" title={"Divorce Marriages"} />
        </SideNavLinkGroup>
      )}
      <Button onClick={logout} colorScheme="red" mt={10} width={"90%"}>
        Logout
      </Button>
    </Flex>
  );
};

export default SideNav;
