"use client";

import React, { useState } from 'react';
import { useLogin } from '../../api/auth/mutations';
import { useRegister } from '../../api/auth/mutations';
import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import SourceSlider from '../../components/source-slider';

function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
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
      <div className={styles.switchText} style={{ textAlign: 'left', marginTop: 8, fontSize: 14 }}>
        Not a member yet? <a href="#" onClick={e => { e.preventDefault(); if (onSuccess) onSuccess(); }}>sign up!</a>
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

  return (
    <>
      <div style={{ minHeight: '100vh', background: '#fafbfc', display: 'flex', flexDirection: 'column' }}>
        {/* Banner */}
        <div style={{
          width: '100%',
          minHeight: 300,
          background: 'linear-gradient(120deg, #222 60%, #444 100%)',
          backgroundImage: 'url(https://buysearch.s3.eu-north-1.amazonaws.com/bg-2.png)',
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
          <div style={{ position: 'relative', zIndex: 2, marginTop: 32 }}>
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
              <div
                style={{
                  color: '#fff',
                  fontWeight: 900,
                  letterSpacing: 0.5,
                  // textAlign: 'center',
                  textShadow: '0 2px 16px rgba(0,0,0,0.18)',
                  // fontSize: 'clamp(24px, 6vw, 48px)',
                  fontSize: 48,
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                BuySearch
              </div>
              <div
                style={{
                  color: '#fff',
                  fontWeight: 600,
                  // fontSize: 'clamp(14px, 3vw, 28px)',
                  fontSize: 20,
                  letterSpacing: 0.2,
                  // textAlign: 'center',
                  textShadow: '0 2px 16px rgba(0,0,0,0.18)',
                  marginTop: 8,
                  whiteSpace: 'nowrap',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                Search once, buy everywhere
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 62 }}>
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
                  // marginRight: 8,
                  cursor: 'pointer',
                  boxShadow: tab === 'login' ? '0 2px 12px rgba(0,0,0,0.08)' : undefined,
                  transition: 'all 0.18s',
                  outline: 'none',
                }}
              >
                Login
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
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginTop: -40, zIndex: 3 }}>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.05)', padding: '24px 32px', minWidth: 320, maxWidth: 340, width: '100%', margin: '0 8px' }}>
            {tab === 'login' ? <LoginForm onSuccess={() => setTab('signup')} /> : <RegisterForm onSuccess={() => setTab('login')} />}
          </div>
        </div>
        <SourceSlider />
      </div>
    </>
  );
} 