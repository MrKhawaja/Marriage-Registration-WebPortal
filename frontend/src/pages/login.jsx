import React, { useState } from "react";
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
import { Navigate, useNavigate } from "react-router-dom";

const Login = ({ loadUser, user }) => {
  const [submitError, setSubmitError] = useState(false);

  const navigate = useNavigate();
  return (
    <>
      {user && <Navigate to="/dashboard" />}
      <div className="centered-container">
        <Card width="300px" padding="20px">
          <Formik
            initialValues={{ nid: "", password: "" }}
            validate={(values) => {
              const errors = {};
              if (!values.nid) {
                errors.nid = "NID is required";
              } else if (values.nid.length !== 10) {
                errors.nid = "NID must be 10 digits";
              } else if (isNaN(values.nid)) {
                errors.nid = "NID must be a number";
              }

              if (!values.password) {
                errors.password = "Password is required";
              }
              return errors;
            }}
            onSubmit={({ nid, password }, { setSubmitting }) => {
              setTimeout(() => {
                axios
                  .post(
                    baseURL + "/auth/login",
                    qs.stringify({ nid, password })
                  )
                  .then((res) => {
                    loadUser({ token: res.data, current: "login" });
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
                  <FormControl
                    isInvalid={errors.password && touched.password}
                    marginTop="10px"
                  >
                    <FormLabel>Password</FormLabel>
                    <Input
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="password"
                      name="password"
                      value={values.password}
                    />
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>
                  <Button
                    width={"100%"}
                    disabled={isSubmitting}
                    type="submit"
                    onClick={handleSubmit}
                    marginTop="20px"
                    colorScheme="green"
                  >
                    Login
                  </Button>
                  <Button
                    width={"100%"}
                    onClick={() => {
                      navigate("/register");
                    }}
                    marginTop="20px"
                    colorScheme="red"
                  >
                    Register
                  </Button>
                </form>
              </>
            )}
          </Formik>
        </Card>
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
            Seems like there might be a problem with your credentials. Contact
            us at your nearest office if you think theres an issue in the
            system.
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
};

export default Login;
