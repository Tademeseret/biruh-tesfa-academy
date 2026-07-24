// pages/StudentPortal.jsx
// Requires the student to be authenticated. Displays resources filtered for their grade.
// Refactored for 100% mobile responsiveness.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient, { fileUrl } from '../api/axiosClient';

export default function StudentPortal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('studentToken');
  const studentName = localStorage.getItem('studentName');
  const grade = localStorage.getItem('studentGrade');
  const studentId = localStorage.getItem('studentId');

  const [resources, setResources] = useState([]);
  const [studentStatus, setStudentStatus] = useState(localStorage.getItem('studentStatus') || 'pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [billing, setBilling] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentGrade');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentStatus');
    navigate('/student/login');
  };

  useEffect(() => {
    if (!token) {
      navigate('/student/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!studentId || !token) return;

    axiosClient
      .get(`/students/${studentId}/status`)
      .then((res) => {
        const freshStatus = res.data.student.registration_status;
        setStudentStatus(freshStatus);
        localStorage.setItem('studentStatus', freshStatus);

        if (freshStatus === 'inactive' || freshStatus === 'rejected') {
          handleLogout();
          alert(freshStatus === 'inactive'
            ? t('student.accountDeactivated', 'Your account has been deactivated. Please contact the administrator.')
            : t('student.registrationRejected', 'Your registration has been rejected. Please contact the administrator.')
          );
        }
      })
      .catch((err) => {
        console.error('Failed to sync student status:', err);
      });
  }, [studentId, token, navigate]);

  useEffect(() => {
    if (!grade) return;
    if (studentStatus !== 'approved') return;
    
    setLoading(true);
    setError('');
    axiosClient
      .get('/resources', { params: { grade } })
      .then((res) => setResources(res.data.resources))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [grade, studentStatus]);

  useEffect(() => {
    if (!studentId || !token) return;
    if (studentStatus !== 'approved') return;

    setBillingLoading(true);
    setBillingError('');
    axiosClient.get(`/students/${studentId}/billing`)
      .then((res) => {
        setBilling(res.data.billing);
        setPaymentStatus(res.data.paymentStatus);
      })
      .catch((err) => {
        setBillingError(err.message || 'Failed to load billing information.');
      })
      .finally(() => setBillingLoading(false));
  }, [studentId, token, studentStatus]);

  if (!token) {
    return null;
  }

  if (studentStatus === 'pending') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8 bg-gray-50/50">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sm:p-8 text-center border-t-4 border-yellow-500">
          <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-100">
            <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-green mb-2">{t('portal.pendingTitle')}</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
            {t('portal.pendingMessage')}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-xs sm:text-sm text-left text-brand-blue-dark space-y-2 border border-gray-100">
            <div><span className="font-semibold text-gray-500 block text-[10px] uppercase">{t('portal.pendingStudent')}</span> {studentName}</div>
            <div><span className="font-semibold text-gray-500 block text-[10px] uppercase">{t('portal.pendingGrade')}</span> {grade}</div>
            <div><span className="font-semibold text-gray-500 block text-[10px] uppercase">{t('portal.pendingStatus')}</span> {t('portal.pendingVerification')}</div>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full py-2.5 text-xs sm:text-sm">
            {t('common.logout', 'Log Out')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-brand-green">{t('portal.title')}</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {t('portal.welcome')}, <span className="font-semibold text-brand-blue-dark">{studentName}</span> (
            <span className="font-semibold text-brand-green">{grade}</span>)
          </p>
        </div>
        <button onClick={handleLogout} className="btn-secondary text-xs sm:text-sm py-2 px-4 self-start sm:self-center">
          {t('common.logout', 'Log Out')}
        </button>
      </div>

      {/* Dynamic Tuition & Billing Card */}
      <section className="mb-8 sm:mb-10 bg-white border border-gray-200 rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-brand-green">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-brand-blue-dark mb-0.5">{t('portal.billingTitle')}</h2>
            <p className="text-xs text-gray-500">{t('portal.billingSubtitle')}</p>
          </div>
          <div className="self-start sm:self-auto">
            {paymentStatus === 'approved' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                ✅ {t('portal.paidVerified')}
              </span>
            )}
            {paymentStatus === 'pending' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-250">
                ⏳ {t('portal.underVerification')}
              </span>
            )}
            {paymentStatus === 'unpaid' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                ⚠️ {t('portal.unpaidAction')}
              </span>
            )}
          </div>
        </div>

        {billingLoading ? (
          <p className="text-xs sm:text-sm text-gray-500 italic">{t('portal.billingLoading')}</p>
        ) : billingError ? (
          <p className="text-xs sm:text-sm text-red-650 font-semibold">{billingError}</p>
        ) : billing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-2">
              <div className="flex justify-between pb-1 text-gray-650">
                <span>{t('portal.baseTuitionRate')}</span>
                <span className="font-semibold text-gray-800">{billing.baseFee.toFixed(2)} ETB</span>
              </div>
              
              {billing.siblingDiscountApplied > 0 && (
                <div className="flex justify-between pb-1 text-brand-green font-semibold">
                  <span>{t('portal.siblingDiscount', { percent: billing.siblingDiscountPercent })}</span>
                  <span>-{billing.siblingDiscountApplied.toFixed(2)} ETB</span>
                </div>
              )}

              {billing.penalty > 0 ? (
                <div className="flex justify-between pb-1 text-red-650 font-bold">
                  <span>{t('portal.latePenalty', { days: billing.overdueDays })}</span>
                  <span>+{billing.penalty.toFixed(2)} ETB</span>
                </div>
              ) : (
                <div className="flex justify-between pb-1 text-gray-400 italic">
                  <span>{t('portal.noPenalty')}</span>
                  <span>{t('portal.noPenaltyValue')}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base sm:text-lg text-brand-blue-dark">
                <span>{t('portal.totalAmountDue')}</span>
                <span>{billing.totalDue.toFixed(2)} ETB</span>
              </div>
            </div>

            <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-150 flex flex-col justify-center text-xs text-gray-650">
              <h4 className="font-bold text-brand-blue-dark mb-1 text-[11px] uppercase tracking-wide">{t('portal.policyTitle')}</h4>
              <ul className="space-y-1 mt-1 leading-relaxed list-disc list-inside">
                <li>{t('portal.policyDueDay', { day: billing.dueDay })}</li>
                <li>{t('portal.policyDailyPenalty', { amount: billing.dailyPenaltyAmount.toFixed(2) })}</li>
                <li>{t('portal.policySiblingDiscount', { percent: billing.siblingDiscountPercent, index: billing.siblingIndex + 1 })}</li>
                {paymentStatus === 'unpaid' && (
                  <li className="text-red-700 font-semibold">{t('portal.policyUnpaidWarning')}</li>
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      {/* Learning Resources Grid */}
      <h2 className="text-lg sm:text-xl font-bold text-brand-blue-dark mb-4">📚 {t('portal.resources')}</h2>
      
      {loading && <p className="text-brand-blue/70 text-sm">{t('common.loading')}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && resources.length === 0 && !error && (
        <p className="text-brand-blue/70 text-sm py-4">{t('portal.noResources')}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((r) => (
          <article key={r.id} className="card p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-green mb-1.5 bg-green-50 px-2 py-0.5 rounded">
                {r.resource_type === 'worksheet' ? t('portal.worksheet') : t('portal.textbook')}
              </span>
              <h3 className="font-bold text-brand-blue-dark text-base sm:text-lg leading-snug">{r.title}</h3>
              {r.description && <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">{r.description}</p>}
            </div>
            <a
              href={fileUrl(r.file_path)}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-center text-xs sm:text-sm mt-4 py-2.5 flex items-center justify-center gap-1.5"
            >
              <span>📥</span> {t('portal.download')}
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
