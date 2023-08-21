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

const RecievedRequests = ({ setUser, user, isLoading, token }) => {
  const [requests, setRequests] = useState([]);
  const getRequests = () => {
    axios
      .get(baseURL + "/marry/requests/recieved", { headers: { token: token } })
      .then((res) => {
        setRequests(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (!token) return;
    getRequests();
  }, [token]);
  const handlePayment = (id, paymentId) => {
    console.log(id);
    axios
      .post(
        baseURL + "/payments/pay",
        qs.stringify({ id: id, paymentId: paymentId }),
        {
          headers: { token: token },
        }
      )
      .then((res) => {
        getRequests();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleAccept = (id) => {
    axios
      .post(baseURL + "/marry/accept", qs.stringify({ id: id }), {
        headers: { token: token },
      })
      .then((res) => {
        getRequests();
      })
      .catch((err) => {
        console.log(err);
      });
  };
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
          <Heading marginBottom={5}>Recieved Requests</Heading>
          <TableContainer
            minWidth={"90%"}
            borderRadius={"10px"}
            border={"1px solid"}
            borderColor={"gray.400"}
          >
            <Table variant="striped" colorScheme="blackAlpha">
              <TableCaption>
                This should list all the request you have recieved.
              </TableCaption>
              <Thead>
                <Tr>
                  <Th>NID of Sender</Th>
                  <Th>Name of Sender</Th>
                  <Th>Sent on</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {requests.map((request) => (
                  <Tr key={request.id}>
                    <Td>{request.sender_nid}</Td>
                    <Td>{request.sender_name}</Td>

                    <Td>{request.date}</Td>
                    <Td>
                      {!request.payment_status ? (
                        <Button
                          colorScheme="twitter"
                          onClick={() => handleAccept(request.id)}
                        >
                          Accept Request
                        </Button>
                      ) : request.payment_status == "pending" ? (
                        <Button
                          width={"100%"}
                          colorScheme="whatsapp"
                          onClick={() =>
                            handlePayment(request.id, request.payment_id)
                          }
                        >
                          Pay
                        </Button>
                      ) : (
                        <Button width={"100%"} colorScheme="red">
                          Payment {request.payment_status}
                        </Button>
                      )}
                    </Td>
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

export default RecievedRequests;
