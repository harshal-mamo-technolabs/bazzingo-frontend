import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Signup, Login, ForgotPassword, ResetPassword } from "./pages";

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
    }
]);

export default router;
