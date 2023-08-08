import React, { useState } from "react";
import "./css/login.css";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Card,
  Input,
  Button,
  HStack,
  RadioGroup,
  Radio,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

import axios from "axios";
import qs from "qs";
import baseURL from "../config";
import { Formik } from "formik";
import { Navigate } from "react-router-dom";
const Register = ({ user, loadUser }) => {
  const [submitError, setSubmitError] = useState(false);
  return (
    <>
      {user && <Navigate to="/dashboard" />}

      <div className="centered-container">
        <Card width="300px" padding="20px">
          <Formik
            initialValues={{
              nid: "",
              name: "",
              password: "",
              email: "",
              confirmpassword: "",
              gender: "male",
            }}
            validate={(values) => {
              const errors = {};
              if (!values.nid) {
                errors.nid = "NID is required";
              } else if (values.nid.length !== 10) {
                errors.nid = "NID must be 10 digits";
              } else if (isNaN(values.nid)) {
                errors.nid = "NID must be a number";
              }

              if (!values.name) {
                errors.name = "Name is required";
              }

              if (!values.password) {
                errors.password = "Password is required";
              }

              if (
                !values.confirmpassword ||
                values.password !== values.confirmpassword
              ) {
                errors.confirmpassword = "Confirm Password is not matched";
              }

              if (!values.email) {
                errors.email = "Email is required";
              } else if (!values.email.includes("@")) {
                errors.email = "Email is not valid";
              }

              return errors;
            }}
            onSubmit={(
              { nid, password, name, email, gender },
              { setSubmitting }
            ) => {
              setTimeout(() => {
                axios
                  .post(
                    baseURL + "/auth/register",
                    qs.stringify({
                      nid,
                      password,
                      name,
                      email,
                      isMale: gender,
                    })
                  )
                  .then((res) => {
                    if (res.status === 200) {
                      loadUser({ token: res.data, current: "login" });
                    }
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
                  <FormControl isInvalid={errors.name && touched.name}>
                    <FormLabel>Name</FormLabel>
                    <Input
                      name="name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.name}
                      type="text"
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={errors.email && touched.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                      type="email"
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
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
                  <FormControl
                    isInvalid={
                      errors.confirmpassword && touched.confirmpassword
                    }
                    marginTop="10px"
                  >
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="password"
                      name="confirmpassword"
                      value={values.confirmpassword}
                    />
                    <FormErrorMessage>
                      {errors.confirmpassword}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl
                    isInvalid={errors.gender && touched.gender}
                    marginTop="10px"
                  >
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup defaultValue="male">
                      <HStack spacing="24px">
                        <Radio value="male">Male</Radio>
                        <Radio value="female">Female</Radio>
                      </HStack>
                    </RadioGroup>
                    <FormErrorMessage>{errors.gender}</FormErrorMessage>
                  </FormControl>

                  <Button
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    marginTop="20px"
                    colorScheme="red"
                    width={"100%"}
                    type="submit"
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

export default Register;
