import { Button, PasswordInput } from '../Form';
import { useForm } from "react-hook-form";

export default function ResetPasswordForm({ resetPasswordHandler }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  return (
    <form onSubmit={handleSubmit(resetPasswordHandler)} className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-2 md:gap-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
            New Password
          </label>
          <PasswordInput
            placeholder="Enter new password"
            className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
            Confirm New Password
          </label>
          <PasswordInput
            placeholder="Confirm new password"
            className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
            {...register("confirmPassword", {
              validate: (value) =>
                value === getValues("password") || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full py-[10px] md:py-3 bg-orange-500 rounded-lg text-white font-bold tracking-wide hover:bg-orange-600 transition md:text-[16px] text-[12px]"
      >
        Reset Password
      </Button>
    </form>
  )
} 