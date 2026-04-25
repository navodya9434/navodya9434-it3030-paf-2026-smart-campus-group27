import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const OAuth2Success = () => {

   return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-sm font-medium text-slate-700">Signing you in with Google...</p>
    </div>
  );
};

export default OAuth2Success;

