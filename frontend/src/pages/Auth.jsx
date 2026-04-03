import { useState } from "react";
import { createPageUrl } from "@/utils/index.js";
import SignInForm from "../components/auth/SignInForm";
import SignUpForm from "../components/auth/SignUpForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import PasswordResetSuccessModal from "../components/auth/PasswordResetSuccessModal";
import SuccessModal from "../components/auth/SuccessModal";

export default function Auth() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "forgot"
  const [successModal, setSuccessModal] = useState(null); // { type: "register"|"login", name }
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const handleSignUp = async ({ name, email, password, university, passing_year, passing_gpa }) => {
    // Get existing users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    
    // Check if email already exists
    if (existingUsers.some(user => user.email === email)) {
      alert("An account with this email already exists.");
      return;
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      full_name: name,
      email,
      password_hash: password, // In production, this should be properly hashed
      university,
      passing_year,
      passing_gpa,
      created_at: new Date().toISOString()
    };
    
    // Save to localStorage
    existingUsers.push(newUser);
    localStorage.setItem("studyconnect_users", JSON.stringify(existingUsers));
    
    setSuccessModal({ type: "register", name });
  };

  const handleSignIn = async ({ email, password }) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    
    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      alert("No account found with this email.");
      return;
    }
    
    // Check password
    if (user.password_hash !== password) {
      alert("Incorrect password.");
      return;
    }
    
    // Save current user to localStorage
    localStorage.setItem("studyconnect_user", JSON.stringify(user));
    setSuccessModal({ type: "login", name: user.full_name });
  };

  const handleSuccessOk = () => {
    if (successModal?.type === "register") {
      setSuccessModal(null);
      setMode("signin");
    } else {
      window.location.href = createPageUrl("Dashboard");
    }
  };

  const handlePasswordResetSuccess = () => {
    setPasswordResetSuccess(false);
    setMode("signin");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex w-[820px] max-w-full min-h-[480px]">
        {/* Left panel - image side */}
        <div
          className="hidden md:flex flex-col justify-between w-[45%] relative"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/30 rounded-l-2xl" />
          <div className="relative z-10 p-8 flex-1 flex flex-col justify-between">
            {mode === "signin" ? (
              <>
                <div />
                <div>
                  <h2 className="text-white text-2xl font-bold leading-tight mb-6">
                    Pull Up a Chair,<br />Join Us!
                  </h2>
                  <button
                    onClick={() => setMode("signup")}
                    className="border-2 border-white text-white px-8 py-2 rounded-full font-bold tracking-widest hover:bg-white hover:text-gray-800 transition"
                  >
                    SIGN UP
                  </button>
                </div>
              </>
            ) : (
              <>
                <div />
                <div>
                  <h2 className="text-white text-2xl font-bold leading-tight mb-6">
                    Welcome Back<br />Your Seat Is Waiting!
                  </h2>
                  <button
                    onClick={() => setMode("signin")}
                    className="border-2 border-white text-white px-8 py-2 rounded-full font-bold tracking-widest hover:bg-white hover:text-gray-800 transition"
                  >
                    SIGN IN
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right panel - form side */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10">
          {mode === "signin" ? (
            <SignInForm onSignIn={handleSignIn} onSwitch={() => setMode("signup")} onForgotPassword={() => setMode("forgot")} />
          ) : mode === "signup" ? (
            <SignUpForm onSignUp={handleSignUp} onSwitch={() => setMode("signin")} />
          ) : (
            <ForgotPasswordForm onBack={() => setMode("signin")} onResetSuccess={handlePasswordResetSuccess} />
          )}
        </div>
      </div>

      {successModal && (
        <SuccessModal
          type={successModal.type}
          name={successModal.name}
          onOk={handleSuccessOk}
        />
      )}
      
      {passwordResetSuccess && (
        <PasswordResetSuccessModal onClose={handlePasswordResetSuccess} />
      )}
    </div>
  );
}