import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import SignIn from "../Pages/SignIn";

const NavBar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("authToken")));
  const [successMessage, setSuccessMessage] = useState("");
  const location = useLocation();


  useEffect(() => {
    const authPages = ["/forgot-password", "/reset-password", "/verify-email"];
    if (authPages.includes(location.pathname)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- route changes close the modal
      setIsLoginOpen(false);
    }
  }, [location.pathname]);

  const showSuccessToast = () => {
    setSuccessMessage("Welcome back! You signed in successfully");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setSuccessMessage("");
  };

  const handleLoginClose = (value) => {
    setIsLoginOpen(value);

    const token = localStorage.getItem("authToken");

    if (token && !value) {
      setIsLoggedIn(true);
      showSuccessToast();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {successMessage && (
        <div className="fixed top-3 right-6 z-[9999] bg-white border border-green-200 shadow-xl rounded-xl px-5 py-3 flex items-center gap-3 animate-fade-in">

          {/* Icon */}
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">
            ✓
          </div>

          {/* Text */}
          <span className="text-green-700 text-sm font-medium">
            {successMessage}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/Logo.png"
              alt="Infinity logo"
              className="w-25 h-25 object-contain"
            />
            <span className="text-[20px] font-semibold text-[#1f5d99]">
              InfinityDigital
            </span>
          </Link>

          <nav className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                  title="Profile"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.7}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full font-medium hover:from-blue-700 hover:to-blue-800 transition hidden md:block"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full font-medium hover:from-blue-700 hover:to-blue-800 transition hidden md:block"
              >
                Signup/Login
              </button>
            )}
          </nav>
        </div>
      </div>

      <SignIn open={isLoginOpen} setOpen={handleLoginClose} />
    </header>
  );
};

export default NavBar;