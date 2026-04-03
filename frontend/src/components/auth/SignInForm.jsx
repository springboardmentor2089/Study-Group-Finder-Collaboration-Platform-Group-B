import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SignInForm({ onSignIn, onSwitch, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSignIn({ email, password });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:border-orange-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div>
          <button 
            type="button" 
            onClick={onForgotPassword}
            className="text-sm text-gray-500 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded tracking-widest transition"
        >
          SIGN IN
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center md:hidden">
        Don't have an account?{" "}
        <button onClick={onSwitch} className="font-bold text-gray-800 hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  );
}