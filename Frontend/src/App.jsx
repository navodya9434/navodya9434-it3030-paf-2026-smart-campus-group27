import React from 'react'

import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import OAuth2Success from "./pages/OAuth2Success";

const App = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation(); // React Router hook
  const hideNavbarPaths = ["/login", "/oauth2/success", "/verify-email"];
  const hideFooterPaths = ["/login", "/oauth2/success", "/verify-email"];

   const isEmailVerified = (userData) => {
    const value =
      userData?.emailVerified ??
      userData?.isEmailVerified ??
      userData?.verified ??
      userData?.isVerified ??
      userData?.isAccountVerified ??
      userData?.accountVerified;

    return value === true || value === "true";
  };

   const hasVerifiedUser = user && isEmailVerified(user);

  // Decide whether to show navbar
  const showNavbar = !hideNavbarPaths.includes(location.pathname);
  const showFooter = !hideFooterPaths.includes(location.pathname);


  return (
    <div>
      
    </div>
  )
}

export default App
