import React, { useState, useEffect } from "react";
import SideNav from "../components/Nav/SideNav";
import {
  Flex,
  Box,
  Card,
  FormLabel,
  FormErrorMessage,
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Heading,
} from "@chakra-ui/react";
import axios from "axios";
import qs from "qs";
import { Formik } from "formik";

import baseURL from "../config";
import { Navigate, Routes } from "react-router-dom";

const AdminDivorce = ({ setUser, user, isLoading, token }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [marriage, setMarriage] = useState(false);

  const [modal, setModal] = useState(false);
  const [submitError, setSubmitError] = useState(false);

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
          justifyContent={"center"}
          flexDirection={"column"}
          paddingTop={5}
        >
          <Card width="300px" padding="20px">
            <Heading
              fontSize={20}
              position={"relative"}
              textAlign="center"
              marginBottom="20px"
            >
              Find Marriage
            </Heading>
            <Formik
              initialValues={{ nidHusband: "", nidWife: "" }}
              validate={(values) => {
                const errors = {};
                if (!values.nidHusband) {
                  errors.nidHusband = "NID is required";
                } else if (values.nidHusband.length !== 10) {
                  errors.nidHusband = "NID must be 10 digits";
                } else if (isNaN(values.nidHusband)) {
                  errors.nidHusband = "NID must be a number";
                }
                if (!values.nidWife) {
                  errors.nidWife = "NID is required";
                } else if (values.nidWife.length !== 10) {
                  errors.nidWife = "NID must be 10 digits";
                } else if (isNaN(values.nidWife)) {
                  errors.nidWife = "NID must be a number";
                }
                return errors;
              }}
              onSubmit={({ nidHusband, nidWife }, { setSubmitting }) => {
                setTimeout(() => {
                  axios
                    .post(
                      baseURL + "/admin/marriages",
                      qs.stringify({ husband: nidHusband, wife: nidWife }),
                      {
                        headers: { token: token },
                      }
                    )
                    .then((res) => {
                      setMarriage(res.data);
                      onOpen();
                    })
                    .catch((err) => {
                      setSubmitError(err.response.data);
                      setTimeout(() => {
                        setSubmitError(false);
                      }, 10000);
                    });
                  setSubmitting(false);
                }, 400);
              }}
            >
              {({
                errors,
                values,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <>
                  <form onSubmit={handleSubmit}>
                    <FormControl
                      isInvalid={errors.nidHusband && touched.nidHusband}
                    >
                      <FormLabel>NID of Husband</FormLabel>
                      <Input
                        name="nidHusband"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.nidHusband}
                        type="text"
                      />
                      <FormErrorMessage>{errors.nidHusband}</FormErrorMessage>
                    </FormControl>
                    <FormControl
                      mt={3}
                      isInvalid={errors.nidWife && touched.nidWife}
                    >
                      <FormLabel>NID of Wife</FormLabel>
                      <Input
                        name="nidWife"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.nidWife}
                        type="text"
                      />
                      <FormErrorMessage>{errors.nidWife}</FormErrorMessage>
                    </FormControl>

                    <Button
                      width={"100%"}
                      disabled={isSubmitting}
                      type="submit"
                      onClick={handleSubmit}
                      marginTop="20px"
                      colorScheme="green"
                    >
                      Find
                    </Button>
                  </form>
                </>
              )}
            </Formik>
          </Card>
        </Box>
        <Alert
          animation="ease-in"
          status="error"
          position="fixed"
          alignSelf="flex-end"
          display={submitError ? "flex" : "none"}
        >
          <AlertIcon />
          <AlertTitle>{submitError}</AlertTitle>
          <AlertDescription>
            Contact us at your nearest office if you think theres an issue in
            the system.
          </AlertDescription>
        </Alert>
      </Flex>
      <Modal
        isOpen={isOpen}
        onClose={(e) => {
          setModal(false);
          setMarriage(false);
          onClose(e);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Initiate Divorce</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <b>Name of Husband:</b> {marriage.husband_name}
            <br />
            <b>NID of Husband:</b> {marriage.husband}
            <br />
            <b>Name of Wife:</b> {marriage.wife_name}
            <br />
            <b>NID of Wife:</b> {marriage.wife}
            <br />
            <b>Date of Marriage:</b> {marriage.date}
            <br />
            <b>Current Status:</b> {marriage.status}
            <br />
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              colorScheme={"red"}
              onClick={(e) => {
                axios
                  .post(
                    baseURL + "/admin/divorce",
                    qs.stringify({ id: marriage.id }),
                    { headers: { token: token } }
                  )
                  .then((res) => {
                    setModal(false);
                    setMarriage(false);
                    onClose(e);
                  })
                  .catch((err) => {
                    setSubmitError(err.response.data);
                    setTimeout(() => {
                      setSubmitError(false);
                    }, 10000);
                  });
              }}
            >
              Divorce
            </Button>
            <Button
              colorScheme="blue"
              ml={3}
              onClick={(e) => {
                setModal(false);
                setMarriage(false);
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

export default AdminDivorce;
