import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  X,
  AlertTriangle,
  Trash2,
  CreditCard,
  Download,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import TranslatedText from '../TranslatedText.jsx';
import { useTranslateText } from '../../hooks/useTranslate';
import { deleteAccount } from '../../services/gdprService';
import {
  fetchSubscriptionStatus,
  selectSubscriptionData,
  selectSubscriptionLoading,
  resetSubscription,
} from '../../app/subscriptionSlice';
import { logout } from '../../app/userSlice';

// Reasons a user may give for leaving (single-select). Mirrors the reference
// project's survey, adapted to this product.
const DELETION_REASONS = [
  "I wasn't using it often enough",
  'Too expensive.',
  "Didn't find the value worth the cost.",
  "It didn't meet my needs or expectations.",
  'Features I needed were unavailable.',
  'Reports or insights were too basic.',
  'I encountered technical problems.',
  'Poor app performance or usability issues.',
  "Reports or results weren't accurate.",
  'Information was repetitive or unhelpful.',
  'Other',
];

// Retention offers (multi-select).
const RETENTION_OFFERS = [
  'Lower-cost subscription',
  'Annual discounted rates',
  'Additional premium content',
];

// Statuses that count as a live subscription. A subscription already scheduled
// to cancel (cancelAtPeriodEnd) does NOT block deletion.
const BLOCKING_STATUSES = ['active', 'trialing', 'past_due'];

// Small helper so each <option> label can be translated with its own hook.
function ReasonOption({ value }) {
  const label = useTranslateText(value);
  return <option value={value}>{label}</option>;
}

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subscriptionData = useSelector(selectSubscriptionData);
  const isSubLoading = useSelector(selectSubscriptionLoading);

  // 'checking' | 'blocked' | 'warning' | 'survey'
  const [step, setStep] = useState('checking');
  const [reason, setReason] = useState('');
  const [offers, setOffers] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const selectReasonPlaceholder = useTranslateText('Select a reason');
  const deletingText = useTranslateText('Deleting your account...');
  const successText = useTranslateText('Your account has been permanently deleted.');
  const genericErrorText = useTranslateText('Something went wrong. Please try again.');

  // A subscription blocks deletion only when it is live and NOT already
  // scheduled to cancel at period end.
  const hasBlockingSubscription = useMemo(() => {
    const { status, cancelAtPeriodEnd } = subscriptionData || {};
    return BLOCKING_STATUSES.includes(status) && !cancelAtPeriodEnd;
  }, [subscriptionData]);

  // On open: reset state and refresh subscription status.
  useEffect(() => {
    if (isOpen) {
      setStep('checking');
      setReason('');
      setOffers([]);
      setDeleting(false);
      dispatch(fetchSubscriptionStatus());
    }
  }, [isOpen, dispatch]);

  // Once the subscription status resolves, route to the correct first step.
  useEffect(() => {
    if (isOpen && step === 'checking' && !isSubLoading) {
      setStep(hasBlockingSubscription ? 'blocked' : 'warning');
    }
  }, [isOpen, step, isSubLoading, hasBlockingSubscription]);

  if (!isOpen) return null;

  const closeAll = () => {
    if (deleting) return;
    onClose();
  };

  const toggleOffer = (offer) => {
    setOffers((prev) =>
      prev.includes(offer) ? prev.filter((o) => o !== offer) : [...prev, offer]
    );
  };

  const goToSubscription = () => {
    onClose();
    navigate('/subscription');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount({ reason, wouldHaveStayedIfOffered: offers });

      toast.success(successText);

      // Clear cached profile + subscription state, log out, redirect.
      localStorage.removeItem('cachedUserProfile');
      localStorage.removeItem('cachedUserProfileTimestamp');
      dispatch(resetSubscription());
      dispatch(logout());
      onClose();
      navigate('/login');
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || genericErrorText;

      // The account still has an active subscription — send them to cancel it.
      if (status === 409) {
        dispatch(fetchSubscriptionStatus());
        setStep('blocked');
      }
      toast.error(message);
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-[90vw] md:w-[60vw] lg:w-[38vw] max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <button
          onClick={closeAll}
          disabled={deleting}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* ---------- Checking subscription ---------- */}
          {step === 'checking' && (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
              <p className="text-gray-600 text-sm">
                <TranslatedText text="Checking your account status..." />
              </p>
            </div>
          )}

          {/* ---------- Blocked: active subscription ---------- */}
          {step === 'blocked' && (
            <div>
              <div className="flex flex-col items-center text-center mb-5">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 mb-3">
                  <CreditCard className="w-7 h-7 text-amber-500" />
                </span>
                <h2 className="text-xl font-bold text-gray-900">
                  <TranslatedText text="Cancel your subscription first" />
                </h2>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  <TranslatedText text="You have an active subscription. To delete your account, please cancel your subscription first. You'll keep access until the end of your current billing period." />
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={closeAll}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <TranslatedText text="Go back" />
                </button>
                <button
                  onClick={goToSubscription}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 text-sm font-medium transition-colors"
                >
                  <TranslatedText text="Manage subscription" />
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ---------- Warning: irreversible ---------- */}
          {step === 'warning' && (
            <div>
              <div className="flex flex-col items-center text-center mb-5">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-3">
                  <ShieldAlert className="w-7 h-7 text-red-500" />
                </span>
                <h2 className="text-xl font-bold text-gray-900">
                  <TranslatedText text="Delete your account?" />
                </h2>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  <TranslatedText text="This action is permanent and cannot be undone. Before you continue, please understand:" />
                </p>
              </div>

              <ul className="space-y-2.5 mb-5">
                {[
                  'You will lose access to your account immediately.',
                  'All your assessments, scores, games, badges and reports will be permanently deleted.',
                  'Your personal data will be erased from our systems and cannot be recovered.',
                ].map((line, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[13px] text-gray-700 p-3 rounded-xl border border-red-100 bg-red-50/50"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><TranslatedText text={line} /></span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  onClose();
                  navigate('/data-privacy');
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 mb-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-[13px] font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                <TranslatedText text="Download my data first" />
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeAll}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <TranslatedText text="Keep my account" />
                </button>
                <button
                  onClick={() => setStep('survey')}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium transition-colors"
                >
                  <TranslatedText text="Continue" />
                </button>
              </div>
            </div>
          )}

          {/* ---------- Survey ---------- */}
          {step === 'survey' && (
            <div>
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                  <TranslatedText text="We're sorry to see you go" />
                </h2>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  <TranslatedText text="We'd appreciate it if you could tell us why you're leaving." />
                </p>
              </div>

              {/* Reason */}
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                <TranslatedText text="Reason for leaving" />
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 mb-5 rounded-xl border border-gray-300 text-[14px] text-gray-800 bg-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 transition-all"
              >
                <option value="">{selectReasonPlaceholder}</option>
                {DELETION_REASONS.map((r) => (
                  <ReasonOption key={r} value={r} />
                ))}
              </select>

              {/* Offers */}
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                <TranslatedText text="Would you have stayed if we offered:" />
              </label>
              <div className="space-y-2 mb-6">
                {RETENTION_OFFERS.map((offer) => {
                  const checked = offers.includes(offer);
                  return (
                    <label
                      key={offer}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checked
                          ? 'border-red-300 bg-red-50/60'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOffer(offer)}
                        className="w-4 h-4 accent-red-600"
                      />
                      <span className="text-[13px] text-gray-700">
                        <TranslatedText text={offer} />
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStep('warning')}
                  disabled={deleting}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  <TranslatedText text="Back" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || !reason}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {deletingText}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <TranslatedText text="Delete My Account" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
