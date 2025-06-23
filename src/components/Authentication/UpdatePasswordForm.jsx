import { Button, PasswordInput } from '../Form';
import { useForm } from "react-hook-form";

export default function UpdatePasswordForm({ updatePasswordHandler }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  // Password validation function
  const validatePassword = (password) => {
    if (!password) return "New password is required";
    if (password.length < 8) return "Use at least 8 characters";

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLetter || !hasNumber || !hasSymbol) {
      return "Include a mix of letters, numbers, and symbols";
    }

    return true;
  };

  return (
    <form onSubmit={handleSubmit(updatePasswordHandler)} className="flex flex-col gap-4 max-w-sm">
      {/* Current Password */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Current Password
        </label>
        <PasswordInput
          placeholder="Enter Current Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          {...register("currentPassword", {
            required: "Current password is required",
          })}
        />
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          New Password
        </label>
        <PasswordInput
          placeholder="Enter New Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          {...register("newPassword", {
            validate: validatePassword,
          })}
        />
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Confirm New Password
        </label>
        <PasswordInput
          placeholder="Enter New Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          {...register("confirmPassword", {
            validate: (value) =>
              value === getValues("newPassword") || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Password Requirements */}
      <div className="text-sm text-gray-600 mb-2">
        <ul className="space-y-1">
          <li className="flex items-center">
            <span className="w-1 h-1 bg-gray-600 rounded-full mr-2"></span>
            Use at least 8 characters
          </li>
          <li className="flex items-center">
            <span className="w-1 h-1 bg-gray-600 rounded-full mr-2"></span>
            Include a mix of letters, numbers, and symbols
          </li>
        </ul>
      </div>

      <Button
        type="submit"
        className="w-full py-3 bg-orange-500 rounded-lg text-white font-bold hover:bg-orange-600 transition text-sm"
      >
        Change Password
      </Button>
    </form>
  );
}
