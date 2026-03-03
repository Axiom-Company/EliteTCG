import { useCustomerAuth } from '../../contexts/AuthContext';

// Pass-through — the site-wide AuthProvider already wraps the app
export const AuthProvider = ({ children }) => children;

export const useAuth = () => {
  const auth = useCustomerAuth();
  return {
    user: auth.user,
    loading: auth.loading,
    error: null,
    login: auth.signIn,
    logout: auth.signOut,
    getToken: auth.getToken,
    isAuthenticated: auth.isAuthenticated && auth.user?.role === 'admin',
  };
};

export default useAuth;
