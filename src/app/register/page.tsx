"use client";

import React, { useState } from 'react';
import { useRegister } from '../../api/auth/mutations';
import styles from '../login/login.module.css';
import Header from '../../components/header/header';
import { useRouter } from 'next/navigation';
import SourceLogoRow from '../../components/SourceLogoRow';

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
          } else {
            setError(res.error || 'Registration failed');
          }
        },
        onError: () => {
          setError('Registration failed');
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
      <SourceLogoRow />
      <div className={styles.centerBox}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.title}>Register</h2>
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
            {loading ? 'Registering...' : 'Register'}
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