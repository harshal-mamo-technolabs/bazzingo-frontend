import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Signup } from "./pages";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/signup",
                element: <Signup />,
            }
        ],
    },
]);

export default router;
