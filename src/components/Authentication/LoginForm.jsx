import { Input, Button, PasswordInput } from '../Form';
import { useForm } from "react-hook-form";
import TranslatedText from '../TranslatedText.jsx';
import { useTranslateText } from '../../hooks/useTranslate';

export default function LoginForm({ loginHandler, loading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  // Translated strings for validation messages
  const emailRequiredText = useTranslateText('Email is required');
  const invalidEmailFormatText = useTranslateText('Invalid email format');
  const passwordRequiredText = useTranslateText('Password is required');

  return (
    <form onSubmit={handleSubmit(loginHandler)} className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
            <TranslatedText text="Email address" />
          </label>
          <Input
            type="email"
            placeholder={useTranslateText('Enter email address')}
            className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
            {...register("email", {
              required: emailRequiredText,
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: invalidEmailFormatText,
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              <TranslatedText text={errors.email.message} />
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
            <TranslatedText text="Password" />
          </label>
          <PasswordInput
            placeholder={useTranslateText('Enter password')}
            className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
            {...register("password", {
              required: passwordRequiredText,
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              <TranslatedText text={errors.password.message} />
            </p>
          )}
        </div>
      </div>

      <div className="text-right">
        <a href="/forgot-password" className="block text-xs md:text-sm font-medium text-gray-800 mb-1 underline">
          <TranslatedText text="Forgot password?" />
        </a>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className={`w-full py-[10px] md:py-3 bg-orange-500 rounded-lg text-white md:text-[16px] text-[12px] font-bold tracking-wide hover:bg-orange-600 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? <TranslatedText text="SIGNING IN..." /> : <TranslatedText text="SIGNIN" />}
      </Button>
    </form>
  )
}