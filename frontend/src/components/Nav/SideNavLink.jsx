import { Button, Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import React from "react";

const SideNavLink = ({ to, title }) => {
  const navigate = useNavigate();
  return (
    <Box
      _hover={{ bg: "gray.600" }}
      textColor="white"
      cursor={"pointer"}
      onClick={() => navigate(to)}
      p={2}
      width={"90%"}
      bg="gray.700"
      className="nav-link"
    >
      {title}
    </Box>
  );
};

export default SideNavLink;
