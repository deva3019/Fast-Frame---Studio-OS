import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../services/api';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [serverStatus, setServerStatus] = useState('waking');
  
  const navigate = useNavigate();

  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await api.get('/health');
        setServerStatus('ready');
      } catch (err) {
        console.error("Server waking up...");
      }
    };
    wakeUpServer();
  }, []);

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later or reset your password.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (secretKey !== import.meta.env.VITE_STUDIO_SECRET_KEY) {
          throw new Error("Invalid Studio Invite Key. Access denied.");
        }
        await createUserWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.code ? getFriendlyErrorMessage(err.code) : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (secretKey !== import.meta.env.VITE_STUDIO_SECRET_KEY) {
      setError("Invalid Studio Invite Key. Reset denied.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset link sent to your email.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setSecretKey('');
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.code ? getFriendlyErrorMessage(err.code) : err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setIsForgotPassword(false);
    setError('');
    setSuccessMessage('');
    setPassword('');
    setSecretKey('');
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Brand & Value Proposition Side */}
      <div className="flex-1 flex flex-col justify-between p-10 md:p-20 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center mb-8 shadow-lg shadow-indigo-600/20">
            <span className="text-white font-black text-xl tracking-tighter">F</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">StudioOS Workspace</h1>
          <p className="mt-4 text-zinc-400 max-w-md leading-relaxed text-sm">
            The secure operating system for high-volume photography studios. Authenticate to manage CRM data, automated billing, and Google Drive API integrations.
          </p>
        </div>
        
        <div className="hidden md:block relative z-10">
          <div className="flex items-center space-x-3 text-sm text-zinc-500 bg-zinc-900/50 w-max px-4 py-2 rounded-full border border-zinc-800">
            <div className={`w-2 h-2 rounded-full ${serverStatus === 'ready' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
            <span className="font-mono text-xs uppercase tracking-wider">
              {serverStatus === 'ready' ? 'API Node Clusters: Online' : 'Waking Render Server...'}
            </span>
          </div>
        </div>
      </div>

      {/* Auth Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in transition-all duration-500">
          
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight">
              {isForgotPassword ? 'Reset Password' : isSignUp ? 'Initialize Workspace' : 'Access Workspace'}
            </h2>
            <p className="text-zinc-400 text-sm mt-2">
              {isForgotPassword ? 'Verify your key to reset credentials.' : isSignUp ? 'Configure your new studio environment.' : 'Sign in to manage your studio operations.'}
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400 rounded-md">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
              {successMessage}
            </div>
          )}

          <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-5">
            <div className="space-y-1.5 group">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">
                Email Address
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-700"
                placeholder="admin@studio.com"
              />
            </div>
            
            {!isForgotPassword && (
              <div className="space-y-1.5 group relative">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">
                    Password
                  </label>
                  {!isSignUp && (
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-700 pr-10"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {(isSignUp || isForgotPassword) && (
              <div className="space-y-1.5 group animate-fade-in">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors flex items-center justify-between">
                  <span>Studio Invite Key</span>
                  <span className="text-[9px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">Required</span>
                </label>
                <input 
                  type="password" 
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-700"
                  placeholder="Enter administrator key"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-semibold text-sm py-3.5 rounded-lg transition-all duration-200 flex justify-center items-center h-12 mt-4"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Initialize Account' : 'Secure Sign In'
              )}
            </button>
          </form>
          
          <div className="text-center mt-6">
            {isForgotPassword ? (
              <button 
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Back to Sign In
              </button>
            ) : (
              <button 
                type="button"
                onClick={toggleMode}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                {isSignUp ? 'Already have access? Sign in to workspace.' : 'Need a workspace? Enter invite key to create account.'}
              </button>
            )}
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default Login;