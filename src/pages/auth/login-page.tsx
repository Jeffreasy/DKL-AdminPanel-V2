import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { isAxiosError } from 'axios';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Local state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bepaal waar we naartoe gaan na login (default: dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validatie
    const emailInput = email.trim();
    if (!emailInput) {
      setError('Email is verplicht');
      return;
    }

    if (!password) {
      setError('Wachtwoord is verplicht');
      return;
    }

    // Domein logic: voeg automatisch domein toe als het ontbreekt
    // Dit is een handige UX feature uit je originele code
    const fullEmail = emailInput.includes('@') 
      ? emailInput 
      : `${emailInput}@dekoninklijkeloop.nl`;

    setIsSubmitting(true);

    try {
      // Await de login call vanuit AuthContext
      // Let op: we mappen 'password' naar 'wachtwoord' zoals de backend verwacht
      await login({ 
        email: fullEmail, 
        wachtwoord: password 
      });

      // Redirect bij succes
      navigate(from, { replace: true });
      
    } catch (err: unknown) {

      // Specifieke error handling op basis van backend codes
      if (isAxiosError(err) && err.response?.data) {
        const errorCode = err.response.data.code;
        
        switch (errorCode) {
          case 'INVALID_CREDENTIALS':
            setError('Ongeldig e-mailadres of wachtwoord.');
            break;
          case 'USER_INACTIVE':
            setError('Je account is inactief. Neem contact op met de beheerder.');
            break;
          case 'RATE_LIMIT_EXCEEDED':
            setError('Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.');
            break;
          default:
            // Fallback voor generieke errors of 500's
            setError(err.response.data.error || 'Er is een onverwachte fout opgetreden.');
        }
      } else {
        // Netwerkfouten of client-side errors
        setError('Kan geen verbinding maken met de server. Controleer je internetverbinding.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <img
                  className="h-16 w-auto"
                  src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png"
                  alt="DKL25 Logo"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welkom Terug
            </h2>
            <p className="text-gray-300 text-sm">
              Log in op het DKL25 Admin Panel
            </p>
          </div>

          {/* Form */}
          <form className="px-8 pb-8 space-y-6" onSubmit={handleSubmit}>
            
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 flex items-start">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 backdrop-blur-sm transition-colors"
                placeholder="admin of admin@dekoninklijkeloop.nl"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-400">
                Je kunt inloggen met alleen je gebruikersnaam of volledig email adres
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 backdrop-blur-sm transition-colors"
                  placeholder="Voer je wachtwoord in"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 text-base font-semibold rounded-lg shadow-lg transition-all duration-200 
                  ${isSubmitting 
                    ? 'bg-blue-600/50 cursor-not-allowed text-white/80' 
                    : 'bg-blue-600 hover:bg-blue-500 hover:shadow-xl text-white'
                  }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Bezig met inloggen...</span>
                  </div>
                ) : (
                  'Inloggen'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-white/5 border-t border-white/10">
            <p className="text-center text-xs text-gray-400">
              © {new Date().getFullYear()} De Koninklijke Loop. Alle rechten voorbehouden.
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Problemen met inloggen? Neem contact op met de beheerder.
          </p>
        </div>
      </div>
    </div>
  );
}