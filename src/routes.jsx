import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Signup, Login, ForgotPassword } from "./pages";

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
    }
]);

export default router;
