import { createBrowserRouter } from "react-router-dom";
import App from "./App";

// Import non-game pages
import { Signup, Login, ForgotPassword, ResetPassword, UpdatePassword, ClientTicket, HelpFAQs, SubscriptionTest, NotificationPreferences, PrivacyPolicy, TermsOfUse, Assessments, Dashboard, Games, Profile, Statistics, Leadboard, NotFound, VisualReasoningStaticAssessment, Plan, AssessmentPaymentDemo, AssessmentElementsDemo, PlanCheckoutDemo, PlanSubscribeElementsDemo, PlanSubscribePaymentElementDemo, PaymentSuccess, PaymentCancel, Report, Certificate, Download, Subscription, Notifications } from "./pages";

// Import game routes
import { gameRoutes } from "./routes/gameRoutes";
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/report/:id",
        element: <Report />,
    },
    {
        path: "/certificate/:id",
        element: <Certificate />,
    },
    {
        path: "/download/:id",
        element: <Download />,
    },
    {
        path: "/pricing",
        element: <Plan />,
    },
    {
        path: "/subscription",
        element: <Subscription />,
    },
    {
        path: "/notifications",
        element: <Notifications />,
    },
    {
        path: "/payment/demo",
        element: <AssessmentPaymentDemo />,
    },
    {
        path: "/payment/elements",
        element: <AssessmentElementsDemo />,
    },
    {
        path: "/payment/plan-demo",
        element: <PlanCheckoutDemo />,
    },
    {
        path: "/payment/subscription",
        element: <SubscriptionTest />,
    },
    {
        path: "/payment/plan-subscribe",
        element: <PlanSubscribeElementsDemo />,
    },
    {
        path: "/payment/plan-subscribe-payment-element",
        element: <PlanSubscribePaymentElementDemo />,
    },
    {
        path: "/payment/success",
        element: <PaymentSuccess />,
    },
    {
        path: "/payment/cancel",
        element: <PaymentCancel />,
    },
    {
        path: "/signup",
        element: <Signup />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
    },
    {
        path: "/forgot-password/:token",
        element: <ResetPassword />,
    },
    {
        path: "/update-password",
        element: <UpdatePassword />,
    },
    {
        path: "/client-ticket",
        element: <ClientTicket />,
    },
    {
        path: "/help-faqs",
        element: <HelpFAQs />,
    },
    {
        path: "/notification-preferences",
        element: <NotificationPreferences />,
    },
    {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
    },
    {
        path: "/terms-of-use",
        element: <TermsOfUse />,
    },
    {
        path: "/dashboard",
        element: <Dashboard />,
    },
    {
        path: "/assessments",
        element: <Assessments />,
    },
    {
        path: "/games",
        element: <Games />,
    },
    {
        path: "/profile",
        element: <Profile />,
    },
    {
        path: "/statistics",
        element: <Statistics />,
    },
    {
        path: "/leadboard",
        element: <Leadboard />,
    },
    {
        path: "/assessments/visual-reasoning",
        element: <VisualReasoningStaticAssessment />,
    },
    ...gameRoutes,
    {
        path: "*",
        element: <NotFound />,
    }
]);

export default router;
