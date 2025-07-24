"use client";

import React, { useState } from 'react';
import { useRegister } from '../../api/auth/mutations';
import styles from '../login/login.module.css';
import Header from '../../components/header/header';
import { useRouter } from 'next/navigation';
import SourceSlider from '../../components/source-slider';

function RegisterPage() {
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
    <>
      <Header hideGenderSwitch hideSearch />
      <SourceSlider/>
      <div className={styles.centerBox}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.title}>Sign up</h2>
          <input
            className={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password again"
            value={passwordAgain}
            onChange={e => setPasswordAgain(e.target.value)}
            required
          />
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
          <div className={styles.switchText}>
            Already have an account? <a href="/login">Sign In</a>
          </div>
        </form>
      </div>
    </>
  );
}

export default RegisterPage; 