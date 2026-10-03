import React from "react";
import { Route, Routes } from "react-router-dom";
import UserRegistration from "./users/UserRegistration";
import Users from "./users/Users";
import DoctorTasks from "./doctor-tasks/DoctorTasks";

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
      <Route
        path="/doctor-tasks"
        element={<DoctorTasks />}
      />
    </Routes>
  );
};

export default UserManagementRoutes;
