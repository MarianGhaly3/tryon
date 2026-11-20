import { useState, type FormEvent } from 'react';
import { asset } from '../components/Art';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import { link } from '../lib/router';

export default function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const signup = mode === 'signup';
  const [message, setMessage] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('This is a sign-in preview. Secure authentication is not connected; no credentials have been submitted or stored.');
  };
  return (
    <section className="auth-layout">
      <div className="auth-visual">
        <img src={asset('studio-portrait.webp')} alt="ÉCLAT styling inspiration" />
        <div>
          <h2>
            Try It Virtually.
            <br />
            Own It Confidently.
          </h2>
          <p>Your next favorite look starts here.</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <Logo />
        <span className="eyebrow">YOUR PERSONAL STYLING JOURNEY</span>
        <h1>{signup ? 'Create an account' : 'Welcome back'}</h1>
        <p>{signup ? 'A world of possibilities. One beautiful you.' : 'Your favorite looks are waiting for you.'}</p>
        <form id="authForm" onSubmit={submit}>
          {signup && (
            <label>
              Full Name
              <input className="field" name="name" autoComplete="name" required placeholder="Your name" />
            </label>
          )}
          <label>
            Email Address
            <input className="field" type="email" name="email" autoComplete="email" required placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input className="field" type="password" name="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} required placeholder="At least 8 characters" />
          </label>
          <button className="button primary" type="submit">
            {signup ? 'Create Account' : 'Sign In'} <Icon name="arrow" />
          </button>
        </form>
        <p className="form-status" id="authMessage" role="status">
          {message}
        </p>
        <p className="auth-switch">
          {signup ? 'Already have an account?' : 'New to ÉCLAT?'} <a href={link(signup ? 'login' : 'signup')}>{signup ? 'Sign In' : 'Create Account'}</a>
        </p>
        <a className="guest-link" href={link('home')}>
          Continue exploring as a guest <Icon name="arrow" />
        </a>
      </div>
    </section>
  );
}
