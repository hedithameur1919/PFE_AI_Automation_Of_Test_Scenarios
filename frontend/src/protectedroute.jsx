import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/landing" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/landing" />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

export default ProtectedRoute;
