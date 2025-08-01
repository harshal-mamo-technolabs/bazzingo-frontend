import { Input, Button } from '../Form';
import { useForm } from "react-hook-form";

export default function ForgetPasswordEmailInputForm({ forgotPasswordHandler }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(forgotPasswordHandler)} className="flex flex-col gap-5 md:gap-6">
      <div>
        <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-800 mb-2 text-left">
          Email address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
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
      <Button
        type="submit"
        className="w-full py-[10px] md:py-3 bg-orange-500 rounded-lg text-white font-bold tracking-wide hover:bg-orange-600 transition md:text-[16px] text-[12px]"
      >
        Send
      </Button>
    </form>
  )
}