import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpForm({ onSignUp, onSwitch }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm_password: "", university: "", passing_year: "", passing_gpa: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      alert("Passwords do not match.");
      return;
    }
    onSignUp(form);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-5">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Name"
          value={form.name}
          onChange={set("name")}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={set("email")}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={set("password")}
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
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={set("confirm_password")}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:border-orange-400"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <input
          placeholder="University Name"
          value={form.university}
          onChange={set("university")}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <input
          placeholder="Passing Year"
          value={form.passing_year}
          onChange={set("passing_year")}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <input
          type="text"
          placeholder="Passing GPA"
          value={form.passing_gpa}
          onChange={set("passing_gpa")}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          step="0.1"
          min="0"
          max="4"
        />
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded tracking-widest transition"
        >
          SIGN UP
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center md:hidden">
        Already have an account?{" "}
        <button onClick={onSwitch} className="font-bold text-gray-800 hover:underline">
          Sign In
        </button>
      </p>
    </div>
  );
}