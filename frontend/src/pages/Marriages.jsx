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
import { Link, Navigate, Routes } from "react-router-dom";

const Marriages = ({ setUser, user, isLoading, token }) => {
  const [marriages, setMarriages] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [documents, setDocuments] = useState(false);
  const [modal, setModal] = useState(false);
  const [files, setFiles] = useState(false);
  const loadDocuments = (id) => {
    axios
      .get(baseURL + "/documents/" + id, { headers: { token: token } })
      .then((res) => {
        setDocuments(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getMarriages = () => {
    axios
      .get(baseURL + "/marriages", { headers: { token: token } })
      .then((res) => {
        setMarriages(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("marriage_id", modal);
    axios
      .post(baseURL + "/documents/upload", formData, {
        headers: { token: token },
      })
      .then((res) => {
        setModal(false);
        onClose();
        getMarriages();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDelete = () => {
    axios
      .post(
        baseURL + "/documents/delete",
        qs.stringify({ marriage_id: modal }),
        { headers: { token: token } }
      )
      .then((res) => {
        setModal(false);
        onClose();
        setDocuments(false);
        getMarriages();
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
                  <Th>Status</Th>
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
                    <Td>
                      {marriage.status != "divorced" && (
                        <Button
                          onClick={(e) => {
                            setModal(marriage.id);
                            onOpen(e);
                            loadDocuments(marriage.id);
                          }}
                        >
                          Upload Documents
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
            {documents && "Already Uploaded Documents:"}
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
            <form onSubmit={handleUpload}>
              <FormControl mt={3}>
                <Input
                  padding={3}
                  height={"auto"}
                  accept="application/pdf"
                  onChange={(e) => {
                    setFiles(e.target.files);
                  }}
                  type="file"
                  multiple
                />
              </FormControl>
              <Button mt={3} type="submit">
                Upload
              </Button>
            </form>
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
            <Button onClick={handleDelete} colorScheme="red">
              Delete All Documents
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Marriages;
