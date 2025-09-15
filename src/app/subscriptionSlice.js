import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_CONNECTION_HOST_URL } from "../utils/constant";

// Async thunk to fetch subscription status
export const fetchSubscriptionStatus = createAsyncThunk(
  'subscription/fetchSubscriptionStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.user.accessToken;
      
      if (!token) {
        console.log('🔒 [SUBSCRIPTION] No user token found, setting default state');
        return {
          subscriptionStatus: 'none',
          planName: null,
          status: null,
          planDuration: null,
          planId: null,
          priceCatalogId: null,
          cancelAtPeriodEnd: false,
          cancelAt: null,
          subscription: null
        };
      }

      console.log('🔍 [SUBSCRIPTION] Fetching subscription status...');
      
      const response = await fetch(`${API_CONNECTION_HOST_URL}/stripe/user/subscription-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Subscription status check failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 [SUBSCRIPTION] Subscription status response:', data);

      if (data.status === 'success') {
        const subscriptionInfo = {
          subscriptionStatus: data.data.subscriptionStatus,
          planName: data.data.planName,
          status: data.data.subscription?.status || null,
          planDuration: data.data.subscription?.planDuration || null,
          planId: data.data.subscription?.planId || null,
          priceCatalogId: data.data.subscription?.priceCatalogId || null,
          cancelAtPeriodEnd: data.data.subscription?.cancelAtPeriodEnd || false,
          cancelAt: data.data.subscription?.cancelAt || null,
          subscription: data.data.subscription
        };

        console.log('✅ [SUBSCRIPTION] Subscription data updated:', subscriptionInfo);
        return subscriptionInfo;
      } else {
        throw new Error('Invalid response from subscription status API');
      }
    } catch (error) {
      console.error('❌ [SUBSCRIPTION] Error fetching subscription status:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  subscriptionData: {
    subscriptionStatus: 'none',
    planName: null,
    status: null,
    planDuration: null,
    planId: null,
    priceCatalogId: null,
    cancelAtPeriodEnd: false,
    cancelAt: null,
    subscription: null
  },
  isLoading: false,
  isInitialized: false,
  error: null
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    resetSubscription: (state) => {
      state.subscriptionData = {
        subscriptionStatus: 'none',
        planName: null,
        status: null,
        planDuration: null,
        planId: null,
        priceCatalogId: null,
        cancelAtPeriodEnd: false,
        cancelAt: null,
        subscription: null
      };
      state.isInitialized = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.subscriptionData = action.payload;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = action.payload;
        // Set default state on error
        state.subscriptionData = {
          subscriptionStatus: 'none',
          planName: null,
          status: null,
          planDuration: null,
          planId: null,
          priceCatalogId: null,
          cancelAtPeriodEnd: false,
          cancelAt: null,
          subscription: null
        };
      });
  }
});

// Selectors
export const selectSubscriptionData = (state) => state.subscription.subscriptionData;
export const selectSubscriptionLoading = (state) => state.subscription.isLoading;
export const selectSubscriptionInitialized = (state) => state.subscription.isInitialized;
export const selectSubscriptionError = (state) => state.subscription.error;
export const selectHasActiveSubscription = (state) => {
  const { subscriptionStatus, status, cancelAtPeriodEnd, cancelAt } = state.subscription.subscriptionData;
  
  // User has no subscription at all
  if (subscriptionStatus === 'none' || !status) {
    return false;
  }
  
  // Active or trialing subscriptions
  if (status === 'active' || status === 'trialing') {
    return true;
  }
  
  // Cancelled subscriptions that still have access until period end
  if (cancelAtPeriodEnd && cancelAt) {
    const cancelDate = new Date(cancelAt);
    const now = new Date();
    return now < cancelDate; // Still has access if current time is before cancellation date
  }
  
  return false;
};

export const { clearSubscriptionError, resetSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
