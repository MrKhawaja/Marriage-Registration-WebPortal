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
const App = () => {
  const [user, setUser] = useState(false);
  const [token, setToken] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("p");
      loadUser({ token, current: "app" });
      setToken(token);
      localStorage.setItem("token", token);
    }
  }, []);

  const loadUser = ({ token, current }) => {
    const decodedToken = jwt_decode(token);
    setUser(decodedToken);
    if (current == "login") {
      setToken(token);
      localStorage.setItem("token", token);
    }
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login user={user} loadUser={loadUser} />}
      />
      <Route
        path="/register"
        element={<Register user={user} loadUser={loadUser} />}
      />
      {user && user.isAdmin && <Route path="/admin" Component={Admin} />}
      <Route path="/dashboard" Component={Dashboard} />
      <Route path="/" Component={Index} />
    </Routes>
  );
};
export default App;
