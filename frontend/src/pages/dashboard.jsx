import React, { useEffect, useState } from "react";
import SideNav from "../components/Nav/SideNav";
import SendRequest from "./SendRequest";
import { Flex, Box, calc, Card, CardBody, Text } from "@chakra-ui/react";
import { Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";
import baseURL from "../config";
const Dashboard = ({ setUser, user, isLoading }) => {
  const [stats, setStats] = useState(false);
  const getStats = () => {
    axios
      .get(baseURL + "/stats")
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getStats();
  }, []);

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
        >
          {stats && (
            <>
              <Card minWidth={200} height={200} margin={10}>
                <CardBody>
                  <Text>
                    <b>Marriage Stats:</b>
                    <br />
                    {stats.marriages.map((stat) => (
                      <Text key={stat.status}>
                        {stat.status} marriages : {stat.count}
                      </Text>
                    ))}
                  </Text>
                </CardBody>
              </Card>
              <Card minWidth={200} height={200} margin={10}>
                <CardBody>
                  <Text>
                    <b>Payment Stats:</b>
                    <br />
                    {stats.marriages.map((stat) => (
                      <Text key={stat.status}>
                        {stat.status} payment : {stat.count}
                      </Text>
                    ))}
                  </Text>
                </CardBody>
              </Card>
              <Card minWidth={200} height={200} margin={10}>
                <CardBody>
                  <Text>
                    <b>Request Count:</b> {stats.requests}
                  </Text>
                  <Text>
                    <b>Users Count:</b> {stats.users}
                  </Text>
                </CardBody>
              </Card>
            </>
          )}
        </Box>
      </Flex>
    </>
  );
};

export default Dashboard;
