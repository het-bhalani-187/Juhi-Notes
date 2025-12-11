import React, { useState } from 'react';
import { Button, Input } from './UI';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const IndianFlag = () => (
  <svg className="w-5 h-4 rounded-sm shadow-sm" viewBox="0 0 640 480">
    <path fill="#f93" d="M0 0h640v160H0z"/>
    <path fill="#fff" d="M0 160h640v160H0z"/>
    <path fill="#128807" d="M0 320h640v160H0z"/>
    <g transform="translate(320 240) scale(20)">
      <circle r="2.2" fill="#008"/>
      <circle r="1.6" fill="#fff"/>
      <circle r="0.4" fill="#008"/>
      <g id="d">
        <g id="c">
          <g id="b">
            <g id="a">
              <circle r="0.2" transform="rotate(7.5 -2.2 0)" fill="#008"/>
              <path d="M0-2.2v2.2" stroke="#008" strokeWidth="0.2"/>
              <path d="M0-2.2v2.2" transform="rotate(15)" stroke="#008" strokeWidth="0.2"/>
            </g>
            <use xlinkHref="#a" transform="rotate(30)"/>
          </g>
          <use xlinkHref="#b" transform="rotate(60)"/>
        </g>
        <use xlinkHref="#c" transform="rotate(120)"/>
      </g>
      <use xlinkHref="#d" transform="rotate(240)"/>
    </g>
  </svg>
);

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [method, setMethod] = useState<'google' | 'phone'>('google');
  const [loading, setLoading] = useState(false);
  
  // Phone State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      // For demo purposes, we log in as the first mock user
      onLogin(MOCK_USERS[0]);
      setLoading(false);
    }, 1500);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and max 10 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
  };

  const handleSendOtp = () => {
    if (phoneNumber.length !== 10) return;
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setStep('otp');
      setLoading(false);
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) return;
    setLoading(true);
    // Simulate verification
    setTimeout(() => {
      const fullNumber = `+91${phoneNumber}`;
      const newUser: User = {
        id: `user_phone_${phoneNumber}`,
        name: `User ${phoneNumber.slice(-4)}`,
        email: `${phoneNumber}@juhi.in`,
        avatar: `https://ui-avatars.com/api/?name=${phoneNumber}&background=random`
      };
      onLogin(newUser);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-serif font-bold mx-auto mb-4 shadow-lg shadow-indigo-200">
            J
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif mb-2">Welcome to Juhi</h1>
          <p className="text-slate-500 text-sm">Your elegant, AI-powered workspace.</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => { setMethod('google'); setStep('phone'); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${method === 'google' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-600'}`}
          >
            Google
          </button>
          <button
            onClick={() => setMethod('phone')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${method === 'phone' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-600'}`}
          >
            Mobile Number
          </button>
        </div>

        <div className="space-y-4">
          {method === 'google' ? (
            <div className="py-4 space-y-4">
              <p className="text-center text-sm text-slate-500 mb-4">
                Sign in to sync your notes across devices.
              </p>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {step === 'phone' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                    <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                       <div className="flex items-center gap-2 px-3 bg-slate-50 border-r border-slate-100 text-slate-600 font-medium">
                          <IndianFlag />
                          <span>+91</span>
                       </div>
                       <input
                          type="tel"
                          placeholder="98765 43210"
                          value={phoneNumber}
                          onChange={handlePhoneNumberChange}
                          className="flex-1 py-3 px-3 outline-none text-slate-800 placeholder:text-slate-300"
                          maxLength={10}
                       />
                    </div>
                    {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                      <p className="text-[10px] text-red-500 pl-1">Please enter a valid 10-digit Indian number.</p>
                    )}
                  </div>
                  <Button
                    onClick={handleSendOtp}
                    disabled={loading || phoneNumber.length !== 10}
                    className="w-full !py-3 !rounded-xl !text-base shadow-lg shadow-indigo-100"
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </>
              ) : (
                <div className="animate-in slide-in-from-right duration-300">
                  <div className="mb-4 text-center">
                    <p className="text-sm text-slate-500">Enter the code sent to</p>
                    <p className="font-medium text-slate-800">+91 {phoneNumber}</p>
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="1234"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="!py-3 !text-base text-center tracking-[0.5em] font-mono font-bold"
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length < 4}
                      className="w-full !py-3 !rounded-xl !text-base shadow-lg shadow-indigo-100"
                    >
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </Button>
                    <button 
                      onClick={() => setStep('phone')}
                      className="w-full text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          By continuing, you agree to Juhi's Terms & Privacy Policy.
        </div>
      </div>
    </div>
  );
};