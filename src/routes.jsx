import { createBrowserRouter } from "react-router-dom";
import App from "./App";

// Import non-game pages
import { Signup, Login, ForgotPassword, ResetPassword, UpdatePassword, ClientTicket, HelpFAQs, NotificationPreferences, PrivacyPolicy, TermsOfUse, Assessments, Dashboard, Games, Profile, Statistics, Leadboard, NotFound, VisualReasoningStaticAssessment, Payment, AssessmentPaymentDemo, PaymentSuccess, PaymentCancel } from "./pages";

// Import game routes
import { gameRoutes } from "./routes/gameRoutes";
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/payment",
        element: <Payment />,
    },
    {
        path: "/payment/demo",
        element: <AssessmentPaymentDemo />,
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
