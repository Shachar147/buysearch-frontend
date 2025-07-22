"use client";

import React, { useState } from 'react';
import { useLogin } from '../../api/auth/mutations';
import styles from './login.module.css';
import Header from '../../components/header/header';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export default function LoginPage() {
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
    <>
      <Header hideGenderSwitch hideSearch />
      <div className={styles.centerBox}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.title}>Sign In</h2>
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
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className={styles.switchText}>
            Don't have an account? <a href="/register">Sign up</a>
          </div>
        </form>
      </div>
    </>
  );
} 