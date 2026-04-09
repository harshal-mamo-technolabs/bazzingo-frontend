import { Input, Button } from '../Form';
import { useForm } from "react-hook-form";
import { useEffect } from 'react';
import { countries } from '../../utils/constant';
import { Globe, ChevronDown, Phone } from 'lucide-react';
import TranslatedText from '../TranslatedText.jsx';
import { useTranslateText } from '../../hooks/useTranslate';
import {
  getDefaultCountry,
  getMsisdnConfigForCountry,
  normalizeMsisdnForCountry,
  isMsisdnValidForCountry,
  getMsisdnTooltipForCountry,
  MSISDN_SIGNUP_COUNTRY_FILTER,
} from '../../config/accessControl';

export default function MSISDNSignupForm({ signupHandler, loading = false, msisdn = null }) {
  // Get default country from access control
  const defaultCountry = getDefaultCountry();
  const defaultMsisdnConfig = getMsisdnConfigForCountry(defaultCountry);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      msisdn: msisdn || (defaultMsisdnConfig?.inputPrefix || '')
    }
  });

  const selectedCountry = watch("country");
  const msisdnValue = watch("msisdn");
  const countryForConfig = selectedCountry || defaultCountry;
  const signupCountryOptions = MSISDN_SIGNUP_COUNTRY_FILTER.filter((c) =>
    countries.includes(c)
  );
  const msisdnTooltip = getMsisdnTooltipForCountry(countryForConfig);
  const translatedMsisdnTooltip = useTranslateText(msisdnTooltip || '');

  // Keep MSISDN input prefix in sync with selected country when no msisdn prop is provided
  useEffect(() => {
    if (msisdn) return;

    const countryForConfig = selectedCountry || defaultCountry;
    const config = getMsisdnConfigForCountry(countryForConfig);
    if (!config?.inputPrefix) return;

    const prefix = String(config.inputPrefix);
    const current = String(msisdnValue || '');

    // Strip non-digits but keep what the user has typed
    const digitsOnly = current.replace(/\D/g, '');

    // Ensure the value always starts with the prefix and preserve the rest of the digits
    if (!digitsOnly.startsWith(prefix)) {
      const withoutPrefix = digitsOnly.startsWith(prefix)
        ? digitsOnly.slice(prefix.length)
        : digitsOnly;
      const nextValue = prefix + withoutPrefix;

      if (nextValue !== current) {
        setValue("msisdn", nextValue, { shouldValidate: true });
      }
    }
  }, [selectedCountry, defaultCountry, msisdn, msisdnValue, setValue]);
  
  // Translated strings for validation messages
  const fullNameRequiredText = useTranslateText('Full name is required');
  const nameMinLengthText = useTranslateText('Name must be at least 2 characters long');
  const msisdnRequiredText = useTranslateText('Phone number is required');
  const msisdnInvalidText = useTranslateText('Please enter a valid phone number');
  const ageRequiredText = useTranslateText('Age is required');
  const ageMinText = useTranslateText('You must be at least 13 years old');
  const ageMaxText = useTranslateText('Please enter a valid age');
  const countryRequiredText = useTranslateText('Country is required');
  const selectCountryPlaceholder = useTranslateText('Select your country');

  const onSubmit = (data) => {
    // If msisdn prop is provided, keep the exact value coming from props/input
    if (msisdn) {
      signupHandler(data);
      return;
    }

    const formattedMsisdn = normalizeMsisdnForCountry(
      data.msisdn,
      data.country || defaultCountry
    );

    signupHandler({ ...data, msisdn: formattedMsisdn });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-3 md:gap-4">
        {/* Name Field */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
            <TranslatedText text="Full Name" />
          </label>
          <Input
            type="text"
            placeholder={useTranslateText('Enter your full name')}
            className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
            {...register("name", {
              required: fullNameRequiredText,
              minLength: {
                value: 2,
                message: nameMinLengthText,
              },
            })}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1"><TranslatedText text={errors.name.message} /></p>}
        </div>

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
              className={`w-full pl-12 pr-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px] ${msisdn ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              title={msisdnTooltip ? translatedMsisdnTooltip : undefined}
              {...register("msisdn", {
                required: msisdnRequiredText,
                validate: (value) => {
                  const isValid = isMsisdnValidForCountry(value, countryForConfig);
                  if (!isValid) {
                    return msisdnInvalidText;
                  }

                  return true;
                },
              })}
              readOnly={!!msisdn}
            />
          </div>
          {errors.msisdn && <p className="text-red-500 text-sm mt-1"><TranslatedText text={errors.msisdn.message} /></p>}
        </div>

        {/* Age + Country Fields */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {/* Age Field */}
          <div className="flex-1">
            <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
              <TranslatedText text="Age" />
            </label>
            <Input
              type="number"
              placeholder={useTranslateText('Enter your age')}
              className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px]"
              {...register("age", {
                required: ageRequiredText,
                min: { value: 8, message: ageMinText },
                max: { value: 120, message: ageMaxText },
              })}
            />
            {errors.age && <p className="text-red-500 text-sm mt-1"><TranslatedText text={errors.age.message} /></p>}
          </div>

          {/* Country Select */}
          <div className="flex-1">
            <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
              <TranslatedText text="Country" />
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className={`w-full pl-12 pr-12 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px] bg-white appearance-none ${selectedCountry ? "text-gray-800" : "text-gray-400"
                  }`}
                defaultValue={defaultCountry || ""}
                {...register("country", {
                  required: countryRequiredText,
                })}
                style={{
                  color: selectedCountry ? '#1F2937' : '#9CA3AF'
                }}
              >
                {!defaultCountry && <option value="" disabled hidden style={{ color: '#9CA3AF' }}>{selectCountryPlaceholder}</option>}
                {signupCountryOptions.map((country) => (
                  <option key={country} value={country} style={{ color: '#1F2937' }}>
                    {country}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.country && <p className="text-red-500 text-sm mt-1"><TranslatedText text={errors.country.message} /></p>}
          </div>
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
        {loading ? <TranslatedText text="SIGNING UP..." /> : <TranslatedText text="SIGNUP" />}
      </Button>
    </form>
  );
}
