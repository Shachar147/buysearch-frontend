"use client";

import React, { useState } from 'react';
import { login } from '../../services/auth-api-service';
import styles from './login.module.css';
import Header from '../../components/header/header';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(username, password);
      if (res.status === 'success') {
        router.push('/');
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (e: any) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
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
            Don't have an account? <a href="/register">Register</a>
          </div>
        </form>
      </div>
    </>
  );
} 