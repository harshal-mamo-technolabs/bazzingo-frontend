import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CreditCardIcon, PlusIcon, StarIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { API_CONNECTION_HOST_URL } from '../../utils/constant';
import {
  getPaymentMethods,
  createCardSetupIntent,
  confirmCardSetup,
  removePaymentMethod,
  setDefaultPaymentMethod,
} from '../../services/paymentMethodService';

// Will be set dynamically from /stripe-elements/config
let stripePromise = null;
const getStripe = async () => {
  if (!stripePromise) {
    const response = await fetch(`${API_CONNECTION_HOST_URL}/stripe-elements/config`);
    const data = await response.json();
    stripePromise = loadStripe(data.data.publishableKey);
  }
  return stripePromise;
};

// The PaymentElement below opts out of collecting billing details (fields:
// {billingDetails: 'never'}), so Stripe requires the full set passed here instead.
const getBillingDetails = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    return {
      name: stored?.user?.name || stored?.name || 'Card holder',
      email: stored?.user?.email || stored?.email || 'customer@example.com',
      phone: '',
      address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: 'US' },
    };
  } catch (e) {
    return { name: 'Card holder', email: 'customer@example.com' };
  }
};

const EASE = [0.16, 1, 0.3, 1];

const BRAND_CHIP_STYLES = {
  visa: 'bg-blue-50 text-blue-600',
  mastercard: 'bg-rose-50 text-rose-600',
  amex: 'bg-sky-50 text-sky-600',
  discover: 'bg-amber-50 text-amber-600',
};

function AddCardForm({ onSaved, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription`,
          payment_method_data: { billing_details: getBillingDetails() },
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Could not save the card. Please try again.');
        setSubmitting(false);
        return;
      }

      if (setupIntent?.status === 'succeeded') {
        await confirmCardSetup(setupIntent.id);
        toast.success('Card added');
        onSaved();
        return;
      }

      toast.error('Could not save the card. Please try again.');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Could not save the card.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          fields: { billingDetails: 'never' },
          wallets: { applePay: 'never', googlePay: 'never', link: 'never' },
        }}
      />
      <div className="mt-4 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={!stripe || submitting}
          className="relative flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={`inline-flex items-center justify-center gap-2 transition-opacity ${submitting ? 'opacity-0' : 'opacity-100'}`}>
            Save Card
          </span>
          {submitting && (
            <span className="absolute inset-0 flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Saving...
            </span>
          )}
        </motion.button>
      </div>
    </form>
  );
}

const CardBrandChip = ({ brand }) => (
  <div
    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
      BRAND_CHIP_STYLES[brand?.toLowerCase()] || 'bg-gray-100 text-gray-500'
    }`}
  >
    <CreditCardIcon className="h-5 w-5" />
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5">
    <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-gray-200" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-32 animate-pulse rounded bg-gray-200" />
      <div className="h-2.5 w-20 animate-pulse rounded bg-gray-200" />
    </div>
  </div>
);

const PaymentMethodsCard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null); // id of the card being removed/switched
  const [confirmingId, setConfirmingId] = useState(null); // id pending remove confirmation
  const [adding, setAdding] = useState(false);
  const [preparingForm, setPreparingForm] = useState(false);
  const [stripeInstance, setStripeInstance] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  const loadCards = async () => {
    try {
      const res = await getPaymentMethods();
      setCards(res?.data?.paymentMethods || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not load your saved cards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const openAddCard = async () => {
    setAdding(true);
    setPreparingForm(true);
    try {
      const [stripe, res] = await Promise.all([getStripe(), createCardSetupIntent()]);
      setStripeInstance(stripe);
      setClientSecret(res?.data?.clientSecret || '');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
      setAdding(false);
    } finally {
      setPreparingForm(false);
    }
  };

  const closeAddCard = () => {
    setAdding(false);
    setClientSecret('');
  };

  const handleSaved = async () => {
    closeAddCard();
    setLoading(true);
    await loadCards();
  };

  const performRemove = async (paymentMethodId) => {
    setBusyId(paymentMethodId);
    try {
      const res = await removePaymentMethod(paymentMethodId);
      setCards(res?.data?.paymentMethods || []);
      toast.success('Card removed');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not remove this card.');
    } finally {
      setBusyId(null);
      setConfirmingId(null);
    }
  };

  const handleSetDefault = async (paymentMethodId) => {
    setBusyId(paymentMethodId);
    try {
      const res = await setDefaultPaymentMethod(paymentMethodId);
      setCards(res?.data?.paymentMethods || []);
      toast.success('Default card updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not switch the default card.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
            <CreditCardIcon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        </div>
        <AnimatePresence initial={false}>
          {!adding && !loading && (
            <motion.button
              key="add-card-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={openAddCard}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-orange-600"
            >
              <PlusIcon className="h-4 w-4" />
              Add Card
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : (
        <>
          <AnimatePresence>
            {cards.length === 0 && !adding && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 py-10 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <CreditCardIcon className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No cards saved yet</p>
                <p className="mt-1 text-xs text-gray-400">Add a card to enable one-click pay</p>
              </motion.div>
            )}
          </AnimatePresence>

          {cards.length > 0 && (
            <AnimatePresence mode="popLayout" initial={false}>
              <div className="space-y-2.5 mb-2">
                {cards.map((card, index) => {
                  const isBusy = busyId === card.id;
                  const clickable = !card.isDefault && !isBusy && confirmingId !== card.id;

                  return (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -16, scale: 0.97, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.25, delay: Math.min(index, 4) * 0.05, ease: EASE }}
                    onClick={clickable ? () => handleSetDefault(card.id) : undefined}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSetDefault(card.id);
                            }
                          }
                        : undefined
                    }
                    aria-label={
                      clickable
                        ? `Set ${(card.brand || 'card').toUpperCase()} ending in ${card.last4} as default`
                        : undefined
                    }
                    className={`group relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                      card.isDefault
                        ? 'border-orange-200 bg-gradient-to-r from-orange-50/80 to-white shadow-sm'
                        : 'border-gray-200 bg-white hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md'
                    } ${clickable ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2' : ''} ${
                      isBusy ? 'pointer-events-none opacity-70' : ''
                    }`}
                  >
                    {card.isDefault && <span className="absolute inset-y-0 left-0 w-1 bg-orange-500" />}

                    <div className="flex min-w-0 items-center gap-3">
                      <CardBrandChip brand={card.brand} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {(card.brand || 'Card').toUpperCase()} •••• {card.last4}
                          </p>
                          {card.isDefault && (
                            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                              <StarIconSolid className="h-2.5 w-2.5" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {card.expMonth && card.expYear
                            ? `Expires ${String(card.expMonth).padStart(2, '0')}/${card.expYear}`
                            : ''}
                          {card.isDefault && <span className="ml-1.5 text-gray-400">· used for one-click pay</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-1">
                      <AnimatePresence mode="wait" initial={false}>
                        {confirmingId === card.id ? (
                          <motion.div
                            key="confirm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-1.5"
                          >
                            <span className="hidden text-xs font-medium text-gray-500 sm:inline">Remove?</span>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                performRemove(card.id);
                              }}
                              disabled={busyId === card.id}
                              className="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-red-600 disabled:opacity-50"
                            >
                              {busyId === card.id ? '…' : 'Remove'}
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingId(null);
                              }}
                              disabled={busyId === card.id}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="actions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="flex items-center gap-2"
                          >
                            {!card.isDefault && (
                              <span className="flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors duration-150 group-hover:text-orange-500">
                                <StarIcon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Set as default</span>
                              </span>
                            )}
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingId(card.id);
                              }}
                              disabled={busyId === card.id}
                              title="Remove card"
                              className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}

          <AnimatePresence initial={false}>
            {adding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Add a new card</p>
                    <button
                      type="button"
                      onClick={closeAddCard}
                      className="rounded-lg p-1 text-gray-400 transition-colors duration-150 hover:bg-gray-200 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {preparingForm || !clientSecret || !stripeInstance ? (
                    <div className="flex justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
                    </div>
                  ) : (
                    <Elements
                      stripe={stripeInstance}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                          variables: { colorPrimary: '#f97316' },
                        },
                      }}
                    >
                      <AddCardForm onSaved={handleSaved} onCancel={closeAddCard} />
                    </Elements>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default PaymentMethodsCard;
