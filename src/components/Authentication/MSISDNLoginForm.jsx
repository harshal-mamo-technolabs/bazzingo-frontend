import { Input, Button } from '../Form';
import { useForm } from "react-hook-form";
import { Phone } from 'lucide-react';
import TranslatedText from '../TranslatedText.jsx';
import { useTranslateText } from '../../hooks/useTranslate';

export default function MSISDNLoginForm({ loginHandler, loading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Translated strings for validation messages
  const msisdnRequiredText = useTranslateText('MSISDN number is required');
  const invalidMSISDNFormatText = useTranslateText('Invalid MSISDN format');

  return (
    <form onSubmit={handleSubmit(loginHandler)} className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-3 md:gap-4">
        {/* MSISDN Field */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
            <TranslatedText text="MSISDN Number" />
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="tel"
              placeholder={useTranslateText('Enter your MSISDN number')}
              className="w-full pl-12 pr-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
              {...register("msisdn", {
                required: msisdnRequiredText,
                pattern: {
                  value: /^\+?[1-9]\d{1,14}$/,
                  message: invalidMSISDNFormatText,
                },
              })}
            />
          </div>
          {errors.msisdn && <p className="text-red-500 text-sm mt-1"><TranslatedText text={errors.msisdn.message} /></p>}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className={`w-full py-[10px] md:py-3 bg-orange-500 rounded-lg md:text-[16px] text-[12px] text-white font-bold tracking-wide hover:bg-orange-600 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? <TranslatedText text="SIGNING IN..." /> : <TranslatedText text="SIGNIN" />}
      </Button>
    </form>
  );
}
