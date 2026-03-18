import { Input, Button } from '../Form';
import { useForm } from "react-hook-form";
import { useEffect } from 'react';
import { Phone } from 'lucide-react';
import TranslatedText from '../TranslatedText.jsx';
import { useTranslateText } from '../../hooks/useTranslate';
import {
  getDefaultCountry,
  getMsisdnConfigForCountry,
  normalizeMsisdnForCountry,
  isMsisdnValidForCountry,
  getMsisdnTooltipForCountry,
} from '../../config/accessControl';

export default function MSISDNLoginForm({ loginHandler, loading = false }) {
  const defaultCountry = getDefaultCountry();
  const defaultMsisdnConfig = getMsisdnConfigForCountry(defaultCountry);
  const msisdnTooltip = getMsisdnTooltipForCountry(defaultCountry);
  const translatedMsisdnTooltip = useTranslateText(msisdnTooltip || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      msisdn: defaultMsisdnConfig?.inputPrefix || '',
    },
  });

  const msisdnValue = watch("msisdn");

  // Ensure the input prefix is always present and cannot be removed
  useEffect(() => {
    if (!defaultMsisdnConfig?.inputPrefix) return;

    const prefix = String(defaultMsisdnConfig.inputPrefix);
    const current = String(msisdnValue || '');
    const digitsOnly = current.replace(/\D/g, '');

    if (!digitsOnly.startsWith(prefix)) {
      const withoutPrefix = digitsOnly.startsWith(prefix)
        ? digitsOnly.slice(prefix.length)
        : digitsOnly;
      const nextValue = prefix + withoutPrefix;

      if (nextValue !== current) {
        setValue("msisdn", nextValue, { shouldValidate: true });
      }
    }
  }, [defaultMsisdnConfig, msisdnValue, setValue]);

  // Translated strings for validation messages
  const msisdnRequiredText = useTranslateText('Phone number is required');
  const invalidMSISDNFormatText = useTranslateText('Invalid phone number format');

  const onSubmit = (data) => {
    const formattedMsisdn = normalizeMsisdnForCountry(data.msisdn);
    loginHandler({ ...data, msisdn: formattedMsisdn });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-3 md:gap-4">
        {/* MSISDN Field */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-1">
            <TranslatedText text="Phone Number" />
          </label>
          {msisdnTooltip && (
            <div className="mb-2">
              <p className="inline-block text-xs md:text-[13px] text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 leading-snug">
                {translatedMsisdnTooltip}
              </p>
            </div>
          )}
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="tel"
              placeholder={useTranslateText('Enter your phone number')}
              className="w-full pl-12 pr-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
              title={msisdnTooltip ? translatedMsisdnTooltip : undefined}
              {...register("msisdn", {
                required: msisdnRequiredText,
                validate: (value) => {
                  const isValid = isMsisdnValidForCountry(value);
                  if (!isValid) {
                    return invalidMSISDNFormatText;
                  }
                  return true;
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
