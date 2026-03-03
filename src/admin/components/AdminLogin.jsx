import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
  const { isAuthenticated } = useCustomerAuth();

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
      <div className="w-full max-w-[360px] flex flex-col gap-6 text-center">
        <h1 className="text-2xl font-medium tracking-tight text-[#f1f1f1]">
          {isAuthenticated ? 'Access Denied' : 'Sign In Required'}
        </h1>
        <p className="text-sm text-[#6b6b6b]">
          {isAuthenticated
            ? 'Your account does not have admin privileges.'
            : 'Please sign in with an admin account to access this panel.'}
        </p>
        <Link
          to={isAuthenticated ? '/' : '/login'}
          className="h-10 w-full rounded-md bg-[#f1f1f1] text-[#0a0a0a] text-sm font-medium hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center"
        >
          {isAuthenticated ? 'Go Home' : 'Sign In'}
        </Link>
        <p className="text-xs text-[#4a4a4a]">Authorized personnel only</p>
      </div>
    </section>
  );
};

export default AdminLogin;
