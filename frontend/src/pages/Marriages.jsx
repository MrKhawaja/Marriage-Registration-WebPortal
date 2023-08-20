import React, { useState, useEffect } from "react";
import SideNav from "../components/Nav/SideNav";
import {
  Flex,
  Box,
  calc,
  TableContainer,
  Table,
  TableCaption,
  Tbody,
  Thead,
  Tr,
  Td,
  Tfoot,
  Th,
  Heading,
  Button,
} from "@chakra-ui/react";
import axios from "axios";
import qs from "qs";
import baseURL from "../config";
import { Navigate, Routes } from "react-router-dom";

const Marriages = ({ setUser, user, isLoading, token }) => {
  const [marriages, setMarriages] = useState([]);
  const getMarriages = () => {
    axios
      .get(baseURL + "/marriages", { headers: { token: token } })
      .then((res) => {
        setMarriages(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (!token) return;
    getMarriages();
  }, [token]);
  return (
    <>
      {!isLoading && !user && <Navigate to="/login" />}
      <Flex back>
        <SideNav user={user} setUser={setUser} />
        <Box
          bg="gray.200"
          minHeight={"100vh"}
          overflowX="hidden"
          overflowY="scroll"
          marginLeft={"350px"}
          width="calc(100vw - 350px)"
          display={"flex"}
          alignItems={"center"}
          flexDirection={"column"}
          paddingTop={5}
        >
          <Heading marginBottom={5}>Marriages</Heading>
          <TableContainer
            minWidth={"90%"}
            borderRadius={"10px"}
            border={"1px solid"}
            borderColor={"gray.400"}
          >
            <Table variant="striped" colorScheme="blackAlpha">
              <TableCaption>
                This should list all of your marriages.
              </TableCaption>
              <Thead>
                <Tr>
                  <Th>Name of Husband</Th>
                  <Th>NID of Husband</Th>
                  <Th>Name of Wife</Th>
                  <Th>NID of Wife</Th>
                  <Th>Current Status Of Marriage</Th>
                  <Th>Date Created</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {marriages.map((marriage) => (
                  <Tr key={marriage.id}>
                    <Td>{marriage.husband_name}</Td>
                    <Td>{marriage.husband}</Td>
                    <Td>{marriage.wife_name}</Td>
                    <Td>{marriage.wife}</Td>
                    <Td>{marriage.status}</Td>
                    <Td>{marriage.date}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Flex>
    </>
  );
};

export default Marriages;
