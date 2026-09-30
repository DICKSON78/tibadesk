import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChevronDown,
  faLock,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import MenuIcon from "../components/icons/Menu";
import Menu from "../components/Menu";
import Modal from "../components/Modal";
import ChangePassword from "../pages/auth/ChangePassword";
import useFetch from "../hooks/useFetch";
import { clearToken } from '../lib/session';

const SIDEBAR_GRADIENT =
  "linear-gradient(180deg, #0E1743 0%, #010736 50%, #01052B 100%)";

const Default = ({ setUser, smsBalance }) => {
  const notificationsTimer = useRef();
  const modalRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: user, loading, error } = useFetch(
    "/api/auth/user",
    null,
    true,
    null,
    (response) => response.data.data
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [splashLoading, setSplashLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSplashLoading(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationsTimer.current) {
        window.clearInterval(notificationsTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      window.user = user;
      setUser(user);
      try {
        if (
          window.notificationEvents &&
          typeof window.notificationEvents.refresh === "function"
        ) {
          window.notificationEvents.refresh();
        }
      } catch (e) {
        // Notification refresh is best-effort.
      }
    }
  }, [user, setUser]);

  useEffect(() => {
    if (error && !loading) {
      navigate("/login");
    }
  }, [error, loading, navigate]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const openChangePasswordModal = () => {
    modalRef.current.open("Change Password", <ChangePassword modal={modalRef.current} />);
  };

    const handleLogout = () => {
      // This application's token only. The mounted applications beside this
      // one share the origin and therefore this localStorage, so clearing all
      // of it would sign the user out of eye and pharmacy as a side effect of
      // logging out of dental.
      clearToken();
      navigate("/login");
    };

  const initials = (user?.full_name || "U")
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-white/10">
        <span className="text-white font-bold tracking-wide text-lg">
          Sarah Dental{" "}
          <span className="text-azure-400">Clinic</span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Menu
          drawerOpen={isDrawerOpen}
          setDrawerOpen={setIsDrawerOpen}
          user={user}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen">
      {user ? (
        <div className="flex h-screen overflow-hidden">
          {isDrawerOpen ? (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsDrawerOpen(false)}
            />
          ) : null}

          <div
            className={`fixed inset-y-0 left-0 z-50 w-[272px] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
              isDrawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{ background: SIDEBAR_GRADIENT }}
          >
            {sidebarContent}
          </div>

          <aside
            className={`hidden lg:flex w-[272px] shrink-0 flex-col transition-all duration-300 ease-in-out ${
              isDrawerOpen ? "" : "w-0 overflow-hidden"
            }`}
            style={{ background: SIDEBAR_GRADIENT }}
          >
            {sidebarContent}
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="bg-white border-b border-mist-200 h-14 px-4 md:px-6 flex items-center justify-between shrink-0 z-30">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen((prev) => !prev)}
                  className="text-mist-500 hover:text-navy-900 transition-colors p-1 rounded-lg hover:bg-mist-100"
                  aria-label="Toggle sidebar"
                >
                  <MenuIcon className="w-5 h-5" />
                </button>
                <div className="hidden sm:flex items-center gap-2 text-sm text-mist-500">
                  <div className="h-4 w-px bg-mist-200" />
                  <FontAwesomeIcon
                    icon={faUser}
                    className="w-4 h-4 text-mist-400"
                  />
                  <span className="font-medium text-mist-700">
                    {now.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <div className="h-4 w-px bg-mist-200" />
                  <span className="font-medium text-mist-700">
                    {now.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-mist-100 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-azure-300 shrink-0 bg-azure-600">
                      {initials}
                    </div>
                    <span className="hidden md:inline text-sm font-semibold text-mist-800">
                      {user.full_name}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`w-3.5 h-3.5 text-mist-400 hidden md:block transition-transform ${
                        isAccountMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isAccountMenuOpen ? (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAccountMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lift border border-mist-200 py-1 z-50 animate-fadeIn">
                        <div className="px-4 py-3 border-b border-mist-100">
                          <p className="font-semibold text-sm text-navy-900">
                            {user.full_name}
                          </p>
                          {user.job_title?.name ? (
                            <p className="text-xs text-mist-500">
                              {user.job_title.name}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            openChangePasswordModal();
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-mist-700 hover:bg-mist-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faLock} className="w-4 h-4" />
                          Change Password
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faRightFromBracket}
                            className="w-4 h-4"
                          />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <main className="flex-1 overflow-y-auto bg-canvas">
              <div className="p-4 md:p-6">
                <Outlet />
              </div>
            </main>
          </div>

          <Modal ref={modalRef} />

          {loading || (splashLoading && location.pathname !== "/dashboard") ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 pointer-events-none">
              <div className="w-10 h-10 border-4 border-azure-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Default;
