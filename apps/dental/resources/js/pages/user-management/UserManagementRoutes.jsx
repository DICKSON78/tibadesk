import React from "react";
import { Route, Routes } from "react-router-dom";
import UserRegistration from "./users/UserRegistration";
import Users from "./users/Users";

const UserManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="/users"
        exact
        element={<Users />}
      />
      <Route
        path="/users/new"
        element={<UserRegistration />}
      />
    </Routes>
  );
};

export default UserManagementRoutes;
