import {Navigate} from "react-router-dom";
import { useAuthStore } from "../store/authStore";


const PrivateRoute = ({ children }) => {
    const loggedIn = useAuthStore((state) => state.isLoggedIn());
    return loggedIn ? <>{children}</> : <Navigate to="/login" />;
}

export default PrivateRoute;
