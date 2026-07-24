// pages/StudentLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import PasswordInput from '../components/PasswordInput';

export default function StudentLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await axiosClient.post('/students/login', { username, password });
      localStorage.setItem('studentToken', res.data.token);
      localStorage.setItem('studentGrade', res.data.student.grade);
      localStorage.setItem('studentName', res.data.student.fullName);
      localStorage.setItem('studentId', res.data.student.id);
      localStorage.setItem('studentStatus', res.data.student.registrationStatus);
      navigate('/portal');
    } catch (err) {
      setError(t('student.loginError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-green">{t('nav.portal', 'Student Portal Login')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Access learning resources & billing</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs sm:text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card shadow-md p-6 sm:p-8 space-y-4">
        <div>
          <label className="label-field">{t('registration.chooseUsername', 'Username')}</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            placeholder="Enter student username"
          />
        </div>
        <div>
          <label className="label-field">{t('admin.password', 'Password')}</label>
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm sm:text-base">
          {submitting ? t('common.loading') : t('admin.login', 'Log In')}
        </button>
      </form>
    </div>
  );
}
