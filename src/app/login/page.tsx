"use client";

import React, { useState, useEffect } from 'react';
import { useLogin } from '../../api/auth/mutations';
import { useRegister } from '../../api/auth/mutations';
import styles from './login.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import SourceSlider from '../../components/source-slider';
import { getGoogleAuthUrl } from '../../services/auth-api-service';
import Cookies from 'js-cookie';
import { Loader } from '../../components/loader/loader';

function LoginForm({ onSuccess, redirectSignup }: { onSuccess?: () => void, redirectSignup?: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    loginMutation.mutate(
      { username, password },
      {
        onSuccess: (res: any) => {
          if (res.status === 'success') {
            queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
            if (onSuccess) onSuccess();
            router.push('/');
          } else {
            setError(res.error || 'Login failed');
          }
        },
        onError: () => {
          setError('Invalid credentials');
        },
        onSettled: () => {
          setLoading(false);
        },
      }
    );
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <form className={styles.form} style={{ background: 'transparent', boxShadow: 'none', padding: 0, minWidth: 320, maxWidth: 340, width: '100%' }} onSubmit={handleSubmit}>
      <h2 className={styles.title} style={{ marginBlock: 4, fontWeight: 700, fontSize: 22, textAlign: 'left', letterSpacing: 0.5 }}>Log in to your account</h2>
      {/* <div style={{ color: '#444', fontSize: 15, marginBottom: 4 }}>Log in to your account to see all your saved collections and trips, and keep planning!</div> */}
      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Username</label>
      <input
        className={styles.input}
        type="text"
        placeholder="Type your Username..."
        value={username}
        onChange={e => setUsername(e.target.value)}
        // autoFocus
        required
      />
      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2, marginTop: 0 }}>Password</label>
      <input
        className={styles.input}
        type="password"
        placeholder="Type your Password..."
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <div className={styles.error}>{error}</div>}
      <button className={styles.button} type="submit" disabled={loading} style={{ marginTop: 4, marginBottom: 8 }}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, backgroundColor: '#e0e0e0' }}></div>
        <span style={{ margin: '0 16px', color: '#666', fontSize: 14 }}>or</span>
        <div style={{ flex: 1, height: 1, backgroundColor: '#e0e0e0' }}></div>
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#fff',
          color: '#333',
          border: '1px solid #ddd',
          borderRadius: '8px',
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.borderColor = '#ccc';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#fff';
          e.currentTarget.style.borderColor = '#ddd';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div className={styles.switchText} style={{ textAlign: 'left', marginTop: 8, fontSize: 14 }}>
        Not a member yet? <a href="#" onClick={e => { e.preventDefault(); if (redirectSignup) redirectSignup(); }}>sign up!</a>
      </div>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const registerMutation = useRegister();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (password !== passwordAgain) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    registerMutation.mutate(
      { username, password },
      {
        onSuccess: (res: any) => {
          if (res.status === 'success') {
            if (onSuccess) onSuccess();
            router.push('/login');
          } else if (res.error === 'userAlreadyExist') {
            setError('Username already exists');
          } else if (res.error === 'usernameTooShort') {
            setError('Username must be at least 4 characters');
          } else if (res.error === 'passwordTooShort') {
            setError('Password must be at least 8 characters');
          } else {
            setError(res.error || 'Registration failed');
          }
        },
        onError: (err: any) => {
          if (err?.response?.data?.error === 'userAlreadyExist') {
            setError('Username already exists');
          } else if (err?.response?.data?.error === 'usernameTooShort') {
            setError('Username must be at least 4 characters');
          } else if (err?.response?.data?.error === 'passwordTooShort') {
            setError('Password must be at least 8 characters');
          } else {
            setError('Registration failed');
          }
        },
        onSettled: () => {
          setLoading(false);
        },
      }
    );
  }

  return (
    <form className={styles.form} style={{ background: 'transparent', boxShadow: 'none', padding: 0, minWidth: 320, maxWidth: 340, width: '100%' }} onSubmit={handleSubmit}>
      <h2 className={styles.title} style={{ marginBlock: 4, fontWeight: 700, fontSize: 22, textAlign: 'left', letterSpacing: 0.5 }}>Create your account</h2>
      {/* <div style={{ color: '#444', fontSize: 15, marginBottom: 18 }}>Sign up to save your favorite products and get the best deals from all sources!</div> */}
      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Username</label>
      <input
        className={styles.input}
        type="text"
        placeholder="Type your Username..."
        value={username}
        onChange={e => setUsername(e.target.value)}
        // autoFocus
        required
      />
      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2, marginTop: 0 }}>Password</label>
      <input
        className={styles.input}
        type="password"
        placeholder="Type your Password..."
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2, marginTop: 0 }}>Password again</label>
      <input
        className={styles.input}
        type="password"
        placeholder="Type your Password again..."
        value={passwordAgain}
        onChange={e => setPasswordAgain(e.target.value)}
        required
      />
      {error && <div className={styles.error}>{error}</div>}
      <button className={styles.button} type="submit" disabled={loading} style={{ marginTop: 4, marginBottom: 8 }}>
        {loading ? 'Signing up...' : 'Sign up'}
      </button>
      <div className={styles.switchText} style={{ textAlign: 'left', marginTop: 8, fontSize: 14 }}>
        Already have an account? <a href="#" onClick={e => { e.preventDefault(); if (onSuccess) onSuccess(); }}>Login</a>
      </div>
    </form>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const googleStatus = searchParams.get('google');
    const isNewUser = searchParams.get('isNewUser');
    const errorMessage = searchParams.get('message');
    const token = searchParams.get('token');

    if (token) {
      setTab('login');
      setLoading(true);
    } else {
      setLoading(false);
    }
    
    if (googleStatus === 'success') {
      // Google login successful
      if (token) {
        Cookies.set('token', token, {
          sameSite: 'lax',
          secure: false,
          expires: 7 // 7 days
        });
      }
      // Redirect to home page
      router.push('/');
    } else if (googleStatus === 'error') {
      // Google login failed
      const message = errorMessage || 'Google login failed. Please try again.';
      alert(message);
    }
  }, [searchParams, router, queryClient]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader isGray />
      </div>
    );
  }

  return (
    <>
      <div style={{ minHeight: '100vh', background: '#fafbfc', display: 'flex', flexDirection: 'column' }}>
        {/* Banner */}
        <div style={{
          width: '100%',
          minHeight: 550,
          background: 'linear-gradient(120deg, #222 60%, #444 100%)',
          backgroundImage: 'url(https://buysearch.s3.eu-north-1.amazonaws.com/bg-3.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1,
          }} />
          <div style={{ position: 'relative', zIndex: 2, marginTop: -200 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'start',
                width: '100%',
                marginBottom: 8,
              }}
            >
              <div className={styles.logo} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <button
                onClick={() => setTab('login')}
                style={{
                  background: tab === 'login' ? '#fff' : 'transparent',
                  color: tab === 'login' ? '#222' : 'white',
                  fontWeight: tab === 'login' ? 700 : 300,
                  fontSize: 18,
                  border: 'none',
                  borderRadius: '16px 16px 0 0',
                  padding: '12px 36px',
                  // marginLeft: 8,
                  cursor: 'pointer',
                  boxShadow: tab === 'login' ? '0 2px 12px rgba(0,0,0,0.08)' : undefined,
                  transition: 'all 0.18s', 
                  outline: 'none',
                }}
              >
                Log in
              </button>
              <button
                onClick={() => setTab('signup')}
                style={{
                  background: tab === 'signup' ? '#fff' : 'transparent',
                  color: tab === 'signup' ? '#222' : 'white',
                  fontWeight: tab === 'signup' ? 700 : 300,
                  fontSize: 18,
                  border: 'none',
                  borderRadius: '16px 16px 0 0',
                  padding: '12px 36px',
                  // marginLeft: 8,
                  cursor: 'pointer',
                  boxShadow: tab === 'signup' ? '0 2px 12px rgba(0,0,0,0.08)' : undefined,
                  transition: 'all 0.18s', 
                  outline: 'none',
                }}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
        {/* Card with tabs */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginTop: -282, zIndex: 3 }}>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.05)', padding: '24px 32px', minWidth: 320, maxWidth: 340, width: '100%', margin: '0 8px' }}>
            {tab === 'login' ? <LoginForm redirectSignup={() => setTab('signup')} /> : <RegisterForm onSuccess={() => setTab('login')} />}
          </div>
        </div>
        <SourceSlider />
      </div>
    </>
  );
} 