import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../utils/api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- missing tokens fail immediately
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const run = async () => {
      try {
        const data = await verifyEmail(token);
        // Store token if returned in verification response
        if (data?.token || data?.access_token) {
          const authToken = data.token || data.access_token;
          localStorage.setItem("authToken", authToken);
        }
        setStatus("success");
        setMessage("Email verified successfully! Please log in again to continue using your account.");
      } catch (err) {
        setStatus("error");
        setMessage(
          err?.response?.data?.message || err.message || "Email verification failed."
        );
      }
    };

    run();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Email Verification</h1>

        <div className="mb-6">
          {status === "loading" && (
            <div>
              <p className="text-gray-600 text-lg">{message}</p>
              <div className="mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="mb-4 text-6xl">✓</div>
              <p className="text-gray-700 text-lg font-medium">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="mb-4 text-6xl">✗</div>
              <p className="text-gray-700 text-lg font-medium">{message}</p>
            </div>
          )}
        </div>

        {status !== "loading" && (
          <button
            onClick={() => navigate("/")}
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105"
          >
            Go to Home
          </button>
        )}
      </div>
    </div>
  );
}
