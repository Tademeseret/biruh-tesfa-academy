// pages/RegistrationPage.jsx
// Public admission & registration form.
// Streamlined 4-step form (Student Details, Parent & Emergency, Account Setup, Payment & Review)
// with responsive mobile layout, step navigation, validation, and i18n translation support.

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import PasswordInput from '../components/PasswordInput';

const GRADES = ['KG1', 'KG2', 'KG3', 'Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6'];

const initialForm = {
  // Step 1: Student Details
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: '',
  date_of_birth: '',
  place_of_birth: '',
  nationality: 'Ethiopian',
  grade_applied: '',

  // Step 2: Parent & Emergency
  parent_full_name: '',
  relationship_to_student: 'Father',
  primary_phone: '',
  secondary_phone: '',
  email: '',
  occupation: '',
  residential_address: '',
  emergency_contact_name: '',
  emergency_relation: '',
  emergency_phone: '',

  // Step 3: Account Creation
  username: '',
  password: '',
  confirm_password: '',
};

export default function RegistrationPage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [receipt, setReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const steps = [
    { id: 1, title: t('registration.step1') },
    { id: 2, title: t('registration.step2') },
    { id: 3, title: t('registration.step3') },
    { id: 4, title: t('registration.step4') },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setReceipt(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
    if (errors.receipt) {
      setErrors((prev) => ({ ...prev, receipt: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!form.first_name.trim()) newErrors.first_name = t('registration.validation.required');
      if (!form.middle_name.trim()) newErrors.middle_name = t('registration.validation.required');
      if (!form.last_name.trim()) newErrors.last_name = t('registration.validation.required');
      if (!form.gender) newErrors.gender = t('registration.validation.required');
      if (!form.date_of_birth) newErrors.date_of_birth = t('registration.validation.required');
      if (!form.place_of_birth.trim()) newErrors.place_of_birth = t('registration.validation.required');
      if (!form.grade_applied) newErrors.grade_applied = t('registration.validation.required');
    }

    if (step === 2) {
      if (!form.parent_full_name.trim()) newErrors.parent_full_name = t('registration.validation.required');
      if (!form.relationship_to_student.trim()) newErrors.relationship_to_student = t('registration.validation.required');
      
      const phoneRegex = /^(?:\+251|0)[79]\d{8}$/;
      if (!form.primary_phone.trim()) {
        newErrors.primary_phone = t('registration.validation.required');
      } else if (!phoneRegex.test(form.primary_phone.replace(/\s+/g, ''))) {
        newErrors.primary_phone = t('registration.validation.invalidPhone');
      }

      if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {
        newErrors.email = t('registration.validation.invalidEmail');
      }

      if (!form.residential_address.trim()) newErrors.residential_address = t('registration.validation.required');
      if (!form.emergency_contact_name.trim()) newErrors.emergency_contact_name = t('registration.validation.required');
      if (!form.emergency_relation.trim()) newErrors.emergency_relation = t('registration.validation.required');
      
      if (!form.emergency_phone.trim()) {
        newErrors.emergency_phone = t('registration.validation.required');
      } else if (!phoneRegex.test(form.emergency_phone.replace(/\s+/g, ''))) {
        newErrors.emergency_phone = t('registration.validation.invalidPhone');
      }
    }

    if (step === 3) {
      if (!form.username.trim() || form.username.trim().length < 4) {
        newErrors.username = t('registration.validation.usernameMin');
      }
      if (!form.password || form.password.length < 6) {
        newErrors.password = t('registration.validation.passwordMin');
      }
      if (form.password !== form.confirm_password) {
        newErrors.confirm_password = t('registration.validation.passwordMismatch');
      }
    }

    if (step === 4) {
      if (!receipt) {
        newErrors.receipt = t('registration.validation.receiptRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!validateStep(4)) {
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'confirm_password') {
        payload.append(key, value);
      }
    });
    payload.append('receipt', receipt);

    setSubmitting(true);
    try {
      await axiosClient.post('/students/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ type: 'success', message: t('registration.successMessage') });
      setForm(initialForm);
      setReceipt(null);
      setReceiptPreview(null);
      setCurrentStep(1);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || t('registration.errorMessage'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* Header Banner */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-green tracking-tight">{t('registration.title')}</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-xs sm:text-base">{t('registration.subtitle')}</p>
      </div>

      {/* Progress Step Indicator */}
      <div className="mb-6 sm:mb-10 px-1 sm:px-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 -translate-y-1/2"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-brand-green transition-all duration-300 -z-0 -translate-y-1/2"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (step.id < currentStep || validateStep(currentStep)) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm ${
                    isCompleted
                      ? 'bg-brand-green text-white ring-2 sm:ring-4 ring-green-100'
                      : isCurrent
                      ? 'bg-brand-green text-white ring-2 sm:ring-4 ring-green-200 scale-105 sm:scale-110'
                      : 'bg-white text-gray-400 border-2 border-gray-300'
                  }`}
                >
                  {isCompleted ? '✓' : step.id}
                </button>
                <span
                  className={`mt-1 text-[9px] sm:text-xs font-semibold text-center max-w-[60px] sm:max-w-[100px] leading-tight truncate sm:whitespace-normal ${
                    isCurrent ? 'text-brand-green font-bold' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Alert Banner */}
      {status && (
        <div
          className={`mb-6 p-4 rounded-xl shadow-sm text-xs sm:text-sm font-medium border flex items-start space-x-3 ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="text-xl">{status.type === 'success' ? '🎉' : '⚠️'}</div>
          <div>
            <h4 className="font-bold">{status.type === 'success' ? t('registration.successTitle') : t('common.error')}</h4>
            <p>{status.message}</p>
          </div>
        </div>
      )}

      {/* Main Multi-Step Form */}
      <form onSubmit={handleSubmit} className="card shadow-md border border-gray-100 p-4 sm:p-6 md:p-8 space-y-6">
        {/* STEP 1: Student Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-brand-green border-b pb-2 flex items-center gap-2">
              <span>👤</span> {t('registration.step1')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label-field">{t('registration.firstName')} *</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="e.g. Abebe"
                  className={`input-field ${errors.first_name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label className="label-field">{t('registration.middleName')} *</label>
                <input
                  type="text"
                  name="middle_name"
                  value={form.middle_name}
                  onChange={handleChange}
                  placeholder="e.g. Bikila"
                  className={`input-field ${errors.middle_name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.middle_name && <p className="text-red-500 text-xs mt-1">{errors.middle_name}</p>}
              </div>

              <div>
                <label className="label-field">{t('registration.lastName')} *</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Desta"
                  className={`input-field ${errors.last_name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">{t('registration.gender')} *</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={`input-field ${errors.gender ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                >
                  <option value="">-- {t('registration.gender')} --</option>
                  <option value="male">{t('registration.male')}</option>
                  <option value="female">{t('registration.female')}</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label className="label-field">{t('registration.dateOfBirth')} *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className={`input-field ${errors.date_of_birth ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label-field">{t('registration.placeOfBirth')} *</label>
                <input
                  type="text"
                  name="place_of_birth"
                  value={form.place_of_birth}
                  onChange={handleChange}
                  placeholder="e.g. Injibara"
                  className={`input-field ${errors.place_of_birth ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.place_of_birth && <p className="text-red-500 text-xs mt-1">{errors.place_of_birth}</p>}
              </div>

              <div>
                <label className="label-field">{t('registration.nationality')} *</label>
                <input
                  type="text"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field">{t('registration.gradeApplied')} *</label>
                <select
                  name="grade_applied"
                  value={form.grade_applied}
                  onChange={handleChange}
                  className={`input-field ${errors.grade_applied ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                >
                  <option value="">{t('registration.selectGrade')}</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.grade_applied && <p className="text-red-500 text-xs mt-1">{errors.grade_applied}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Parent/Guardian & Emergency Contact Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-brand-green border-b pb-2 flex items-center gap-2">
              <span>🏠</span> {t('registration.step2')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">{t('registration.parentFullName')} *</label>
                <input
                  type="text"
                  name="parent_full_name"
                  value={form.parent_full_name}
                  onChange={handleChange}
                  placeholder="e.g. Kebede Worku"
                  className={`input-field ${errors.parent_full_name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.parent_full_name && <p className="text-red-500 text-xs mt-1">{errors.parent_full_name}</p>}
              </div>

              <div>
                <label className="label-field">{t('registration.relationshipToStudent')} *</label>
                <select
                  name="relationship_to_student"
                  value={form.relationship_to_student}
                  onChange={handleChange}
                  className={`input-field ${errors.relationship_to_student ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                >
                  <option value="Father">{t('registration.relFather')}</option>
                  <option value="Mother">{t('registration.relMother')}</option>
                  <option value="Guardian">{t('registration.relGuardian')}</option>
                  <option value="Other">{t('registration.relOther')}</option>
                </select>
                {errors.relationship_to_student && <p className="text-red-500 text-xs mt-1">{errors.relationship_to_student}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label-field">{t('registration.primaryPhone')} *</label>
                <input
                  type="tel"
                  name="primary_phone"
                  value={form.primary_phone}
                  onChange={handleChange}
                  placeholder="0911234567"
                  className={`input-field ${errors.primary_phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.primary_phone && <p className="text-red-500 text-xs mt-1">{errors.primary_phone}</p>}
              </div>

              <div>
                <label className="label-field">{t('registration.secondaryPhone')}</label>
                <input
                  type="tel"
                  name="secondary_phone"
                  value={form.secondary_phone}
                  onChange={handleChange}
                  placeholder="0922334455"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field">{t('registration.parentEmail')}</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="parent@example.com"
                  className={`input-field ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">{t('registration.occupation')}</label>
                <input
                  type="text"
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  placeholder="e.g. Teacher / Businessman"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field">{t('registration.residentialAddress')} *</label>
                <input
                  type="text"
                  name="residential_address"
                  value={form.residential_address}
                  onChange={handleChange}
                  placeholder="Injibara, Kebele 01, House #123"
                  className={`input-field ${errors.residential_address ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.residential_address && <p className="text-red-500 text-xs mt-1">{errors.residential_address}</p>}
              </div>
            </div>

            {/* Emergency Contact Sub-section */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-4">
              <h3 className="text-sm sm:text-md font-bold text-amber-900 flex items-center gap-2">
                <span>🚨</span> {t('registration.emergencySection')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label-field text-amber-950">{t('registration.emergencyContactName')} *</label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={form.emergency_contact_name}
                    onChange={handleChange}
                    placeholder="e.g. Almaz Tadesse"
                    className={`input-field ${errors.emergency_contact_name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  />
                  {errors.emergency_contact_name && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_name}</p>}
                </div>

                <div>
                  <label className="label-field text-amber-950">{t('registration.emergencyRelation')} *</label>
                  <input
                    type="text"
                    name="emergency_relation"
                    value={form.emergency_relation}
                    onChange={handleChange}
                    placeholder="e.g. Aunt / Uncle"
                    className={`input-field ${errors.emergency_relation ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  />
                  {errors.emergency_relation && <p className="text-red-500 text-xs mt-1">{errors.emergency_relation}</p>}
                </div>

                <div>
                  <label className="label-field text-amber-950">{t('registration.emergencyPhone')} *</label>
                  <input
                    type="tel"
                    name="emergency_phone"
                    value={form.emergency_phone}
                    onChange={handleChange}
                    placeholder="0911000000"
                    className={`input-field ${errors.emergency_phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  />
                  {errors.emergency_phone && <p className="text-red-500 text-xs mt-1">{errors.emergency_phone}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Account Credentials */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-brand-green border-b pb-2 flex items-center gap-2">
              <span>🔐</span> {t('registration.step3')}
            </h2>

            <div className="max-w-md mx-auto space-y-4 bg-gray-50 p-4 sm:p-6 rounded-xl border">
              <div>
                <label className="label-field">{t('registration.chooseUsername')} *</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose unique portal username"
                  className={`input-field ${errors.username ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="label-field">{t('registration.choosePassword')} *</label>
                <PasswordInput
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="label-field">{t('registration.confirmPassword')} *</label>
                <PasswordInput
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Re-enter password to confirm"
                />
                {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Payment Receipt Attachment & Summary Review */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-brand-green border-b pb-2 flex items-center gap-2">
              <span>💳</span> {t('registration.step4')}
            </h2>

            {/* Receipt Upload Box */}
            <div className="bg-blue-50 border-2 border-dashed border-brand-blue/30 rounded-xl p-4 sm:p-6 text-center space-y-4">
              <div className="text-3xl">🧾</div>
              <div>
                <h3 className="font-bold text-brand-blue text-sm sm:text-base">{t('registration.receipt')} *</h3>
                <p className="text-xs text-gray-600 mt-1">{t('registration.receiptRequired')}</p>
              </div>

              <input
                type="file"
                name="receipt"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="block w-full max-w-xs mx-auto text-xs sm:text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg
                           file:border-0 file:bg-brand-blue file:text-white file:font-semibold hover:file:bg-brand-blue-dark cursor-pointer"
              />
              {errors.receipt && <p className="text-red-500 text-xs font-semibold">{errors.receipt}</p>}

              {receiptPreview && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs font-bold text-brand-blue mb-2">{t('registration.receiptPreview')}</p>
                  <img
                    src={receiptPreview}
                    alt="Receipt Preview"
                    className="max-h-48 mx-auto rounded-lg shadow border object-contain"
                  />
                </div>
              )}
            </div>

            {/* Summary Review Card */}
            <div className="bg-gray-50 border rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-brand-blue flex items-center gap-2 text-sm sm:text-base">
                  <span>📋</span> {t('registration.summaryTitle')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-gray-700">{t('registration.fullName')}:</span>{' '}
                  <span className="text-brand-blue font-semibold">
                    {form.first_name} {form.middle_name} {form.last_name}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">{t('registration.gradeApplied')}:</span>{' '}
                  <span className="bg-brand-green/10 text-brand-green font-bold px-2 py-0.5 rounded">
                    {form.grade_applied}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-gray-700">{t('registration.gender')}:</span>{' '}
                  <span className="capitalize">{t(`registration.${form.gender}`)}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">{t('registration.dateOfBirth')}:</span> {form.date_of_birth}
                </div>

                <div>
                  <span className="font-bold text-gray-700">{t('registration.parentFullName')}:</span>{' '}
                  {form.parent_full_name} ({form.relationship_to_student})
                </div>
                <div>
                  <span className="font-bold text-gray-700">{t('registration.primaryPhone')}:</span>{' '}
                  {form.primary_phone}
                </div>

                <div>
                  <span className="font-bold text-gray-700">{t('registration.residentialAddress')}:</span>{' '}
                  {form.residential_address}
                </div>
                <div>
                  <span className="font-bold text-gray-700">{t('registration.emergencyContactName')}:</span>{' '}
                  {form.emergency_contact_name} ({form.emergency_phone})
                </div>

                <div>
                  <span className="font-bold text-gray-700">{t('registration.chooseUsername')}:</span>{' '}
                  <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">{form.username}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t">
          {currentStep > 1 ? (
            <button type="button" onClick={handlePrev} className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
              <span>←</span> {t('registration.prev')}
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 4 ? (
            <button type="button" onClick={handleNext} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
              {t('registration.next')} <span>→</span>
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto px-8 py-3 text-base flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  {t('registration.submitting')}
                </>
              ) : (
                <>
                  <span>🚀</span> {t('registration.submit')}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
