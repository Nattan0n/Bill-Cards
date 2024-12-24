import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import LogoIcon from "../../assets/images/IPlan_Logo.png";
import { authService } from "../../services/authService";

const Navigation = ({ user, roles, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenHamburger, setIsOpenHamburger] = useState(false);
  const [isOpenProfile, setIsOpenProfile] = useState(null);

  const checkRole = (rolesNeeded) => {
    if (!roles) return false;
    return roles.some((role) => rolesNeeded.includes(role));
  };

  const handleNavigate = async (url) => {
    try {
      // เรียก CSRF cookie ก่อน
      await axios.get("http://129.200.6.50:83/sanctum/csrf-cookie", {
        withCredentials: true,
      });
      // redirect ไปยัง URL ที่ต้องการ
      window.location.href = url;
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      // รอให้ logout สำเร็จก่อนแล้วค่อย redirect
      setTimeout(() => {
        window.location.href = "http://129.200.6.50:83/login";
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      {/* Primary Navigation Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="shrink-0 flex items-center">
              <button
                onClick={() => window.location.href = "http://129.200.6.50:83/landing" }
              >
                <img
                  src={LogoIcon}
                  alt="Logo"
                  className="block h-15 w-auto fill-current text-gray-800"
                />
              </button>
            </div>

            {/* Navigation Links */}
            {checkRole(["plAdmin", "plSuperAdmin", "superAdmin"]) && (
              <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                <button
                  onClick={() => window.location.href = "http://129.200.6.50:83/plan" }
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  Plan
                </button>
              </div>
            )}

            {checkRole(["plAdmin", "plSuperAdmin", "superAdmin"]) && (
              <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                <button
                  onClick={() => window.location.href = "http://129.200.6.50:83/part" }
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  AddPart
                </button>
              </div>
            )}

            {checkRole([
              "plAdmin",
              "plSuperAdmin",
              "superAdmin",
              "commoner",
              "scanner",
              "unlocker",
            ]) && (
              <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                <button
                  onClick={() =>
                    window.location.href = "http://129.200.6.50:83/listplan" 
                  }
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  ListPlan
                </button>
              </div>
            )}

            {checkRole(["scanner"]) && (
              <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                <button
                  onClick={() => window.location.href = "http://129.200.6.50:83/scan"}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  Scanconfirm
                </button>
              </div>
            )}

            {checkRole(["lock"]) && (
              <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                <button
                  onClick={() => window.location.href = "http://129.200.6.50:83/unlock"}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  Unlock
                </button>
              </div>
            )}

            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
              <button
                onClick={() => window.location.href = "http://129.200.6.50:83/history" }
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
              >
                History
              </button>
            </div>

            {checkRole(["plAdmin", "plSuperAdmin", "superAdmin"]) && (
              <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                <button
                  onClick={() => window.location.href = "http://129.200.6.50:83/image"}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  AddImage
                </button>
              </div>
            )}

            {checkRole(["superAdmin"]) && (
              <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                <button
                  onClick={() =>
                    window.location.href = "http://129.200.6.50:83/createuser"
                  }
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  CreateUser
                </button>
              </div>
            )}

            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
              <NavLink
                className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-400 text-sm font-medium leading-5 text-gray-900 focus:outline-none focus:border-indigo-700 transition duration-150 ease-in-out"
                to="/iplan/billcard"
              >
                Bill Card
              </NavLink>
            </div>
          </div>

          {/* Settings Dropdown */}
          <div className="hidden sm:flex sm:items-center sm:ms-6">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
              >
                <div>{"User"}</div>
                <div className="ms-1">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpenHamburger(false);
                      setIsOpenProfile(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger */}
          <div className="-me-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpenHamburger(!isOpenHamburger)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition duration-150 ease-in-out"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  className={`${isOpenHamburger ? "hidden" : "inline-flex"}`}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  className={`${isOpenHamburger ? "inline-flex" : "hidden"}`}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Navigation Menu */}
      {isOpenHamburger && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 animate__animated ${
              isOpenHamburger
                ? "animate__fadeIn animate__faster"
                : "animate__fadeOut"
            }`}
            onClick={() => setIsOpenHamburger(false)}
          ></div>

          {/* Menu Panel */}
          <div
            className={`fixed top-0 right-0 w-72 h-full bg-white shadow-xl z-50 
            transform transition-all duration-300 animate__animated animate__faster
            ${
              isOpenHamburger
                ? "animate__slideInRight"
                : "animate__slideOutRight"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button
                onClick={() => setIsOpenHamburger(false)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-3 px-3">
              {/* Bill Card Link */}
              <NavLink
                to="iplan/billcard"
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                onClick={() => setIsOpenHamburger(false)}
              >
                <span className="material-symbols-outlined mr-3 text-blue-600">
                  description
                </span>
                <span>Bill Card</span>
              </NavLink>

              {/* Profile Section */}
              <div className="mt-2">
                <button
                  onClick={() => setIsOpenProfile(!isOpenProfile)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <span className="material-symbols-outlined mr-3 text-blue-600">
                      person
                    </span>
                    <span>{user?.name || "User"}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isOpenProfile ? "rotate-180" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Logout Button */}
                {isOpenProfile && (
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpenHamburger(false);
                      setIsOpenProfile(false);
                    }}
                    className="flex items-center w-full px-4 py-2.5 mt-1 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    <span className="material-symbols-outlined mr-3">
                      logout
                    </span>
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};
export default Navigation;
