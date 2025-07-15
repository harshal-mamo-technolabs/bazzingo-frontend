import { Input, Button, PasswordInput } from '../Form';
import { useForm } from "react-hook-form";
import { countries } from '../../utils/constant';
import { Globe, ChevronDown } from 'lucide-react';

export default function SignupForm({ signupHandler }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const selectedCountry = watch("country");

  return (
    <form onSubmit={handleSubmit(signupHandler)} className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-3 md:gap-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
            Email address
          </label>
          <Input
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
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
            Password
          </label>
          <PasswordInput
            placeholder="Enter password"
            className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            })}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* Age + Country Fields */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {/* Age Field */}
          <div className="flex-1">
            <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
              Age
            </label>
            <Input
              type="number"
              placeholder="Enter your age"
              className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
              {...register("age", {
                required: "Age is required",
                min: { value: 13, message: "You must be at least 13 years old" },
                max: { value: 120, message: "Please enter a valid age" },
              })}
            />
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
          </div>

          {/* Country Select */}
          <div className="flex-1">
            <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
              Country
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className={`w-full pl-12 pr-12 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px] bg-white appearance-none ${selectedCountry ? "text-gray-800" : "text-gray-400"
                  }`}
                defaultValue=""
                {...register("country", {
                  required: "Country is required",
                })}
                style={{
                  color: selectedCountry ? '#1F2937' : '#9CA3AF'
                }}
              >
                <option value="" disabled hidden style={{ color: '#9CA3AF' }}>Select your country</option>
                {countries.map((country) => (
                  <option key={country} value={country} style={{ color: '#1F2937' }}>
                    {country}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full py-[10px] md:py-3 bg-orange-500 rounded-lg md:text-[16px] text-[12px] text-white font-bold tracking-wide hover:bg-orange-600 transition"
      >
        SIGNUP
      </Button>
    </form>
  );
}
