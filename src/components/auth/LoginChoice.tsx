import { Link } from "react-router-dom";
import logo from '../../assets/logo.png';

const LoginChoice = () => {
  return (
    <div className="min-h-screen page-background flex items-center justify-center p-2 sm:p-4">
      <div className="edusync-glass-card p-4 sm:p-8 w-full max-w-md transform transition-all hover:scale-105 mx-auto">
        <div className="text-center mb-8">
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Company Logo"
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          </div>

          <h2 className="text-4xl font-bold text-text-primary mb-2">
            CollegeGate ERP
          </h2>
          <p className="text-text-secondary">Sign in to access your account</p>
        </div>

        <div className="space-y-4">
          <Link to="/admin-login" className="btn btn-primary w-full">
            Login as Admin
          </Link>

          <Link to="/staff-login" className="btn btn-success w-full">
            Login as Staff
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginChoice;
