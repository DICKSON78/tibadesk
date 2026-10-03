import React from "react";
import { Outlet } from "react-router-dom";

const Auth = () => {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 bg-grid-light">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/images/sarahcliniclogo.jpg"
            alt="Sarah Dental Clinic"
            className="w-28 h-28 object-cover rounded-full shadow-lift mx-auto border-4 border-white"
          />
          <h1 className="mt-4 text-2xl font-bold text-navy-900">
            Sarah Dental <span className="text-azure-600">Clinic</span>
          </h1>
          <p className="text-sm text-mist-500 mt-1">
            Sign in to continue to your dashboard
          </p>
        </div>

        <div className="card p-0">
          <Outlet />
        </div>

        <p className="text-center text-xs text-mist-500 mt-6">
          Sarah Dental Clinic &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Auth;
