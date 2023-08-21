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
  Modal,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  ModalBody,
  FormControl,
  Input,
} from "@chakra-ui/react";
import axios from "axios";
import qs from "qs";
import baseURL from "../config";
import { Navigate, Routes } from "react-router-dom";

const AdminApprove = ({ setUser, user, isLoading, token }) => {
  const [requests, setRequests] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [documents, setDocuments] = useState(false);
  const [modal, setModal] = useState(false);
  const loadDocuments = (id) => {
    axios
      .get(baseURL + "/admin/documents/" + id, { headers: { token: token } })
      .then((res) => {
        setDocuments(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getRequests = () => {
    axios
      .get(baseURL + "/admin/approve", { headers: { token: token } })
      .then((res) => {
        setRequests(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleReject = (id) => {
    axios
      .post(baseURL + "/admin/reject", qs.stringify({ id: id }), {
        headers: { token: token },
      })
      .then((res) => {
        getRequests();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleApproval = (id) => {
    axios
      .post(baseURL + "/admin/approve", qs.stringify({ id: id }), {
        headers: { token: token },
      })
      .then((res) => {
        getRequests();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (!token) return;
    getRequests();
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
          <Heading marginBottom={5}>Awaiting Approval</Heading>
          <TableContainer
            minWidth={"90%"}
            borderRadius={"10px"}
            border={"1px solid"}
            borderColor={"gray.400"}
          >
            <Table variant="striped" colorScheme="blackAlpha">
              <TableCaption>
                This should list all marriages awaiting approval.
              </TableCaption>
              <Thead>
                <Tr>
                  <Th>NID of Husband</Th>
                  <Th>NID of Wife</Th>
                  <Th>Documents</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {requests.map((request) => (
                  <Tr key={request.id}>
                    <Td>{request.husband}</Td>
                    <Td>{request.wife}</Td>
                    <Td>
                      <Button
                        onClick={(e) => {
                          setModal(request.id);
                          onOpen(e);
                          loadDocuments(request.id);
                        }}
                      >
                        See Documents
                      </Button>
                    </Td>
                    <Td>
                      <Button
                        colorScheme="twitter"
                        onClick={() => handleApproval(request.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        ml={3}
                        colorScheme="red"
                        onClick={() => handleReject(request.id)}
                      >
                        Reject
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Flex>
      <Modal
        isOpen={isOpen}
        onClose={(e) => {
          setModal(false);
          setDocuments(false);
          onClose(e);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Documents</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {documents &&
              documents.map((document) => (
                <Button
                  mt={3}
                  key={document.name}
                  onClick={() => {
                    window.location.href =
                      baseURL + "/uploads/" + document.name;
                  }}
                >
                  {document.name}
                </Button>
              ))}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={(e) => {
                setModal(false);
                setDocuments(false);
                onClose(e);
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AdminApprove;
