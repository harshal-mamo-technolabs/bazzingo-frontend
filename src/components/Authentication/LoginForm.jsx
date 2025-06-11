import { Input, Button, PasswordInput } from '../Form';
import { useForm } from "react-hook-form";

export default function LoginForm({ loginHandler }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(loginHandler)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Email address
          </label>
          <Input
            type="email"
            placeholder="Enter email address"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email format",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Password
          </label>
          <PasswordInput
            placeholder="Enter password"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="text-right">
        <a href="/forgot-password" className="block text-sm font-medium text-gray-800 mb-1 underline">
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        className="w-full py-3 bg-orange-500 rounded-lg text-white font-bold tracking-wide hover:bg-orange-600 transition"
      >
        SIGNIN
      </Button>
    </form>
  )
}