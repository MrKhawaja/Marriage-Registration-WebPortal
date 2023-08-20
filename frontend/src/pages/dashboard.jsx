import React from "react";
import SideNav from "../components/Nav/SideNav";
import SendRequest from "./SendRequest";
import { Flex, Box, calc } from "@chakra-ui/react";
import { Navigate, Route, Routes } from "react-router-dom";
const Dashboard = ({ setUser, user, isLoading }) => {
  return (
    <>
      {console.log(user, isLoading)}
      {!isLoading && !user && <Navigate to="/login" />}
      <Flex back>
        <SideNav user={user} setUser={setUser} />
        <Box
          bg="gray.200"
          minHeight={"200vh"}
          overflowX="hidden"
          overflowY="scroll"
          marginLeft={"350px"}
          width="calc(100vw - 350px)"
        >
          Welcome
        </Box>
      </Flex>
    </>
  );
};

export default Dashboard;
