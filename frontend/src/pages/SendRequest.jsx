import React, { useState } from "react";
import SideNav from "../components/Nav/SideNav";
import { Flex, Box } from "@chakra-ui/react";
import { Navigate, useNavigate } from "react-router-dom";
import "./css/login.css";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Card,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import axios from "axios";
import qs from "qs";
import baseURL from "../config";
import { Formik } from "formik";

const SendRequest = ({ setUser, user, isLoading, token }) => {
  const [submitError, setSubmitError] = useState(false);
  const [reciever, setReciever] = useState({ nid: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        baseURL + "/marry/request",
        qs.stringify({ reciever: reciever.nid }),
        {
          headers: { token: token },
        }
      )
      .then((res) => {
        setRequestSent(true);
      })
      .catch((err) => {
        setSubmitError(err.response.data);
        console.log(err);
        setTimeout(() => {
          setSubmitError(false);
        }, 10000);
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
          justifyContent={"center"}
          alignItems={"center"}
          display={"flex"}
        >
          {requestSent && (
            <Alert
              width="500px"
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Request has been sent!
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                Thanks for sending request to {reciever.name}. We will notify
                you
              </AlertDescription>
            </Alert>
          )}
          {!requestSent && (
            <Card width="300px" padding="20px">
              <Formik
                initialValues={{ nid: "" }}
                validate={(values) => {
                  const errors = {};
                  if (!values.nid) {
                    errors.nid = "NID is required";
                  } else if (values.nid.length !== 10) {
                    errors.nid = "NID must be 10 digits";
                  } else if (isNaN(values.nid)) {
                    errors.nid = "NID must be a number";
                  }
                  return errors;
                }}
                onSubmit={({ nid }, { setSubmitting }) => {
                  setTimeout(() => {
                    axios
                      .get(baseURL + "/marry/user:" + nid, {
                        headers: { token: token },
                      })
                      .then((res) => {
                        setReciever(res.data);
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
                      <FormControl isInvalid={errors.nid && touched.nid}>
                        <FormLabel>NID</FormLabel>
                        <Input
                          name="nid"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.nid}
                          type="text"
                        />
                        <FormErrorMessage>{errors.nid}</FormErrorMessage>
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
              <>
                <form onSubmit={(e) => handleSubmit(e)}>
                  <FormControl marginTop={4}>
                    <FormLabel>Name</FormLabel>
                    <Input name="name" value={reciever.name} type="text" />
                  </FormControl>

                  <Button
                    isDisabled={reciever.name === ""}
                    width={"100%"}
                    disabled={isSubmitting}
                    type="submit"
                    onClick={handleSubmit}
                    marginTop="20px"
                    colorScheme="green"
                  >
                    Send Request
                  </Button>
                </form>
              </>
            </Card>
          )}
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
    </>
  );
};

export default SendRequest;
