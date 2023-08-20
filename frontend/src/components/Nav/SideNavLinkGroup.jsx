import { Button, Box, Icon } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import React from "react";

const SideNavLinkGroup = ({ children, groupName }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Box
        marginTop={2}
        display={"flex"}
        flexDirection={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        _hover={{ bg: "gray.600" }}
        textColor="white"
        textAlign={"left"}
        cursor={"pointer"}
        onClick={() => setIsOpen(!isOpen)}
        p={2}
        width={"90%"}
        bg="gray.700"
        className="nav-link"
      >
        {groupName ? groupName : "Please set groupName atribute"}
        {!isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
      </Box>

      {isOpen && children}
    </>
  );
};

export default SideNavLinkGroup;
