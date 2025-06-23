import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Signup, Login, ForgotPassword, ResetPassword, UpdatePassword, ClientTicket, HelpFAQs, NotificationPreferences, PrivacyPolicy, TermsOfUse, UserDashboard, Assessments } from "./pages";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
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
        element: <UserDashboard />,
    },
    {
        path: "/assessments",
        element: <Assessments />,
    }
]);

export default router;
