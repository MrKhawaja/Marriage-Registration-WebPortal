import logo from "./logo.svg";
import "./App.css";
import React, { Component, useEffect, useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

import Login from "./pages/login";
import Register from "./pages/register";
import Admin from "./pages/admin";
import Index from "./pages/index";
import Dashboard from "./pages/dashboard";
import SendRequest from "./pages/SendRequest";
import RecievedRequests from "./pages/RecievedRequests";
import Marriages from "./pages/Marriages";

const App = () => {
  const [user, setUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadUser({ token, current: "app" }).then(() => {
        setIsLoading(false);
      });
      setToken(token);
      localStorage.setItem("token", token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async ({ token, current }) => {
    const decodedToken = jwt_decode(token);
    setUser(decodedToken);
    if (current == "login") {
      setToken(token);
      localStorage.setItem("token", token);
    }
    return true;
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Login isLoading={isLoading} user={user} loadUser={loadUser} />
        }
      />
      <Route
        path="/register"
        element={
          <Register isLoading={isLoading} user={user} loadUser={loadUser} />
        }
      />
      {user && user.isAdmin && <Route path="/admin" Component={Admin} />}
      <Route
        path="/request/send"
        element={
          <SendRequest
            setUser={setUser}
            token={token}
            isLoading={isLoading}
            user={user}
          />
        }
      />
      <Route
        path="/request/recieved"
        element={
          <RecievedRequests
            setUser={setUser}
            token={token}
            isLoading={isLoading}
            user={user}
          />
        }
      />
      <Route
        path="/marriages"
        element={
          <Marriages
            setUser={setUser}
            token={token}
            isLoading={isLoading}
            user={user}
          />
        }
      />
      <Route
        path="/"
        element={
          <Dashboard setUser={setUser} user={user} isLoading={isLoading} />
        }
      />
    </Routes>
  );
};
export default App;
