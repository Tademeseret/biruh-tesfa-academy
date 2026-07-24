// pages/AdminDashboard.jsx
// Protected dashboard for the director/staff. Composed of five tabs:
// Registrations review, Resource uploads, Announcements, Gallery, Fee Configuration.
// Refactored for 100% mobile responsiveness with horizontal table scrolling and card modal dialogs.

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient, { fileUrl } from '../api/axiosClient';

const GRADES = ['KG1', 'KG2', 'KG3', 'Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6'];
const TABS = ['registrations', 'resources', 'announcements', 'gallery', 'fee_config'];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('registrations');

  useEffect(() => {
    if (!localStorage.getItem('bta_admin_token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('bta_admin_token');
    localStorage.removeItem('bta_admin_info');
    navigate('/admin/login');
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-green">{t('admin.dashboardTitle')}</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage Biruh Tesfa Academy students, resources & announcements</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary text-xs sm:text-sm py-2 px-4 self-start sm:self-center">
          {t('common.logout')}
        </button>
      </div>

      {/* Responsive Horizontal Scroll Tab Bar */}
      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-1 scrollbar-thin">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
              activeTab === tab
                ? 'border-brand-green text-brand-green bg-green-50/50 rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-brand-blue hover:bg-gray-50 rounded-t-lg'
            }`}
          >
            {t(`admin.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {activeTab === 'registrations' && <RegistrationsTab />}
      {activeTab === 'resources' && <ResourcesTab />}
      {activeTab === 'announcements' && <AnnouncementsTab />}
      {activeTab === 'gallery' && <GalleryTab />}
      {activeTab === 'fee_config' && <FeeConfigTab />}
    </div>
  );
}

// ------------------------------------------------------------------
// Receipt Modal
// ------------------------------------------------------------------
function ReceiptModal({ url, onClose }) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-fadeIn my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close receipt"
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors z-20 focus:outline-none"
        >
          ✕
        </button>
        <p className="text-xs font-bold text-gray-500 text-center mb-3 uppercase tracking-wider">{t('admin.registrations.receipt')}</p>
        <img
          src={url}
          alt="Payment receipt"
          className="max-w-full max-h-[60vh] object-contain rounded-lg mx-auto block shadow-sm border"
        />
        <div className="mt-4 flex justify-center">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            {t('admin.registrations.viewReceipt')} ↗
          </a>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// View Student Profile Modal
// ------------------------------------------------------------------
function ViewStudentModal({ student, onClose }) {
  const { t } = useTranslation();
  const [billing, setBilling] = useState(null);
  const [billingLoading, setBillingLoading] = useState(true);

  useEffect(() => {
    if (!student.id) return;
    setBillingLoading(true);
    axiosClient.get(`/students/${student.id}/billing`)
      .then((res) => setBilling(res.data.billing))
      .catch((err) => console.error('Failed to load billing:', err))
      .finally(() => setBillingLoading(false));
  }, [student.id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-brand-blue-dark text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>🎓</span> {t('admin.viewModal.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-xl font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-grow text-left">
          {/* Section 1: Child details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-green border-b pb-1.5 mb-3">
              {t('admin.viewModal.childDetails')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="block text-[11px] text-gray-500 font-semibold">{t('admin.viewModal.fullName')}</span>
                <span className="text-gray-900 font-bold">{student.full_name}</span>
              </div>
              <div>
                <span className="block text-[11px] text-gray-500 font-semibold">{t('admin.viewModal.gradeApplying')}</span>
                <span className="text-brand-blue font-bold bg-blue-50 px-2 py-0.5 rounded">{student.grade}</span>
              </div>
              <div>
                <span className="block text-[11px] text-gray-500 font-semibold">{t('admin.viewModal.gender')}</span>
                <span className="text-gray-800 capitalize font-medium">{student.gender || '--'}</span>
              </div>
              <div>
                <span className="block text-[11px] text-gray-500 font-semibold">{t('admin.viewModal.dateOfBirth')}</span>
                <span className="text-gray-800 font-medium">{formatDate(student.date_of_birth)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-green border-b pb-1.5 mb-3">
              {t('admin.viewModal.parentContact')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="block text-[11px] text-gray-500 font-semibold">{t('admin.viewModal.parentGuardian')}</span>
                <span className="text-gray-900 font-bold">{student.parent_name}</span>
              </div>
              <div>
                <span className="block text-[11px] text-gray-500 font-semibold">{t('admin.viewModal.parentPhone')}</span>
                <span className="text-gray-900 font-mono font-bold">{student.parent_phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-[11px] text-gray-500 font-semibold">{t('admin.viewModal.parentEmail')}</span>
                <span className="text-gray-800 font-medium">{student.parent_email || '--'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-[11px] text-gray-500 font-semibold">{t('admin.viewModal.homeAddress')}</span>
                <span className="text-gray-800 font-medium">{student.address || '--'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Billing breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-green border-b pb-1.5 mb-3">
              {t('admin.viewModal.billingTitle')}
            </h4>
            {billingLoading ? (
              <div className="text-xs text-gray-500 italic">{t('admin.viewModal.billingLoading')}</div>
            ) : billing ? (
              <div className="bg-gray-50 rounded-xl p-3.5 border space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">{t('admin.viewModal.billingBaseFee')}</span>
                  <span className="font-bold text-gray-900">{billing.baseFee.toFixed(2)} ETB</span>
                </div>
                {billing.siblingDiscountApplied > 0 && (
                  <div className="flex justify-between text-brand-green font-semibold">
                    <span>{t('admin.viewModal.billingSiblingDiscount', { percent: billing.siblingDiscountPercent })}</span>
                    <span>-{billing.siblingDiscountApplied.toFixed(2)} ETB</span>
                  </div>
                )}
                {billing.penalty > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>{t('admin.viewModal.billingPenalty', { days: billing.overdueDays })}</span>
                    <span>+{billing.penalty.toFixed(2)} ETB</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-extrabold text-sm sm:text-base text-brand-blue-dark">
                  <span>{t('admin.viewModal.billingTotalDue')}</span>
                  <span>{billing.totalDue.toFixed(2)} ETB</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 flex justify-end border-t shrink-0">
          <button onClick={onClose} className="btn-secondary text-xs py-1.5 px-4">
            {t('admin.viewModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Edit Student Modal
// ------------------------------------------------------------------
function EditStudentModal({ student, onClose, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    full_name: student?.full_name || '',
    grade: student?.grade || 'Grade1',
    parent_name: student?.parent_name || '',
    parent_phone: student?.parent_phone || '',
    parent_email: student?.parent_email || '',
    address: student?.address || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.parent_name || !form.parent_phone) {
      setError(t('admin.editModal.requiredError'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(student.id, form);
      onClose();
    } catch (err) {
      setError(err.message || t('admin.editModal.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-brand-blue-dark text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-white">{t('admin.editModal.title')}</h3>
          <button type="button" onClick={onClose} className="text-white hover:text-gray-300 text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-grow text-left">
          {error && (
            <div className="text-xs bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="label-field">{t('admin.editModal.fullName')}</label>
            <input
              type="text"
              name="full_name"
              required
              value={form.full_name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t('admin.editModal.grade')}</label>
            <select name="grade" required value={form.grade} onChange={handleChange} className="input-field">
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">{t('admin.editModal.parentName')}</label>
            <input
              type="text"
              name="parent_name"
              required
              value={form.parent_name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t('admin.editModal.parentPhone')}</label>
            <input
              type="text"
              name="parent_phone"
              required
              value={form.parent_phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t('admin.editModal.parentEmail')}</label>
            <input
              type="email"
              name="parent_email"
              value={form.parent_email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t('admin.editModal.homeAddress')}</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 flex justify-end gap-3 border-t shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary text-xs py-2 px-4">
            {t('admin.editModal.cancel')}
          </button>
          <button type="submit" disabled={saving} className="btn-primary text-xs py-2 px-4">
            {saving ? t('admin.editModal.saving') : t('admin.editModal.save')}
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------------------------------------------------------
// Registrations Tab
// ------------------------------------------------------------------
function RegistrationsTab() {
  const { t } = useTranslation();
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receiptUrl, setReceiptUrl] = useState(null);

  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const loadData = useCallback(() => {
    setLoading(true);
    axiosClient
      .get('/admin/registrations', { params: filter ? { status: filter } : {} })
      .then((res) => setRegistrations(res.data.registrations))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDecision = async (id, decision) => {
    try {
      await axiosClient.patch(`/admin/registrations/${id}`, { decision });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(t('admin.registrations.deactivateConfirm', { name }))) return;
    try {
      await axiosClient.patch(`/admin/registrations/${id}`, { decision: 'inactive' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSave = async (id, formData) => {
    try {
      await axiosClient.put(`/admin/students/${id}`, formData);
      loadData();
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Status Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {['pending', 'approved', 'rejected', 'inactive', ''].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all capitalize ${
                filter === s ? 'bg-brand-blue text-white border-brand-blue shadow-sm' : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
              }`}
            >
              {s ? (s === 'inactive' ? t('common.inactive') : t(`common.${s}`)) : t('common.all')}
            </button>
          ))}
        </div>

        {loading && <p className="text-brand-blue/70 text-sm">{t('common.loading')}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && registrations.length === 0 && (
          <p className="text-brand-blue/70 text-sm py-4">{t('admin.registrations.noRecords')}</p>
        )}

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="w-full min-w-[700px] text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 text-brand-blue bg-gray-50">
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.registrations.student')}</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.registrations.grade')}</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.registrations.parent')}</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.registrations.phone')}</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.registrations.receipt')}</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.registrations.status')}</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-right">{t('admin.registrations.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-brand-blue-dark">{r.full_name}</td>
                  <td className="py-3 px-4 font-semibold text-gray-700">{r.grade}</td>
                  <td className="py-3 px-4 text-gray-600">{r.parent_name}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-xs">{r.parent_phone}</td>
                  <td className="py-3 px-4">
                    {r.receipt_image_path ? (
                      <button
                        onClick={() => setReceiptUrl(fileUrl(r.receipt_image_path))}
                        className="underline text-brand-blue font-semibold hover:text-brand-blue-dark text-xs"
                      >
                        {t('admin.registrations.viewReceipt')}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No receipt</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{statusBadge(r.registration_status)}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {r.registration_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleDecision(r.id, 'approved')}
                            className="text-green-700 font-bold text-xs border border-green-300 bg-green-50 hover:bg-green-600 hover:text-white px-2.5 py-1 rounded transition-colors"
                          >
                            {t('admin.registrations.approve')}
                          </button>
                          <button
                            onClick={() => handleDecision(r.id, 'rejected')}
                            className="text-red-700 font-bold text-xs border border-red-300 bg-red-50 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded transition-colors"
                          >
                            {t('admin.registrations.reject')}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setViewingStudent(r)}
                        className="text-brand-blue hover:bg-brand-blue hover:text-white font-bold text-xs border border-brand-blue px-2.5 py-1 rounded transition-colors"
                      >
                        {t('admin.registrations.view')}
                      </button>

                      <button
                        onClick={() => setEditingStudent(r)}
                        className="text-amber-600 hover:bg-amber-600 hover:text-white font-bold text-xs border border-amber-600 px-2.5 py-1 rounded transition-colors"
                      >
                        {t('admin.registrations.edit')}
                      </button>

                      {r.registration_status !== 'inactive' && (
                        <button
                          onClick={() => handleDeactivate(r.id, r.full_name)}
                          className="text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs border border-red-600 px-2.5 py-1 rounded transition-colors"
                        >
                          {t('admin.registrations.deactivate')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewingStudent && <ViewStudentModal student={viewingStudent} onClose={() => setViewingStudent(null)} />}
      {editingStudent && <EditStudentModal student={editingStudent} onClose={() => setEditingStudent(null)} onSave={handleEditSave} />}
      {receiptUrl && <ReceiptModal url={receiptUrl} onClose={() => setReceiptUrl(null)} />}
    </>
  );
}

// ------------------------------------------------------------------
// Resources Tab
// ------------------------------------------------------------------
function ResourcesTab() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ title: '', description: '', grade: '', resourceType: 'worksheet' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    payload.append('file', file);

    setSubmitting(true);
    setStatus(null);
    try {
      await axiosClient.post('/admin/resources', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ type: 'success', message: t('admin.resourceForm.successMessage') });
      setForm({ title: '', description: '', grade: '', resourceType: 'worksheet' });
      setFile(null);
      e.target.reset();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl mx-auto sm:mx-0 space-y-4 p-4 sm:p-6">
      <h3 className="font-bold text-brand-green text-base border-b pb-2">📚 {t('admin.resourceForm.title')}</h3>
      {status && (
        <div className={`text-xs sm:text-sm rounded-lg p-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {status.message}
        </div>
      )}
      <div>
        <label className="label-field">{t('admin.resourceForm.title')}</label>
        <input name="title" required value={form.title} onChange={handleChange} className="input-field" />
      </div>
      <div>
        <label className="label-field">{t('admin.resourceForm.description')}</label>
        <input name="description" value={form.description} onChange={handleChange} className="input-field" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">{t('admin.resourceForm.grade')}</label>
          <select name="grade" required value={form.grade} onChange={handleChange} className="input-field">
            <option value="">-- {t('registration.selectGrade')} --</option>
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">{t('admin.resourceForm.type')}</label>
          <select name="resourceType" value={form.resourceType} onChange={handleChange} className="input-field">
            <option value="worksheet">{t('admin.resourceForm.worksheet')}</option>
            <option value="textbook">{t('admin.resourceForm.textbook')}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label-field">{t('admin.resourceForm.file')}</label>
        <input
          type="file" accept="application/pdf" required
          onChange={(e) => setFile(e.target.files[0] || null)}
          className="block w-full text-xs sm:text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-blue file:text-white file:font-semibold cursor-pointer"
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
        {t('admin.resourceForm.upload')}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------
// Announcements Tab
// ------------------------------------------------------------------
function AnnouncementsTab() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ title: '', body: '' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (file) payload.append('attachment', file);

    setSubmitting(true);
    setStatus(null);
    try {
      await axiosClient.post('/admin/announcements', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ type: 'success', message: t('admin.announcementForm.successMessage') });
      setForm({ title: '', body: '' });
      setFile(null);
      e.target.reset();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl mx-auto sm:mx-0 space-y-4 p-4 sm:p-6">
      <h3 className="font-bold text-brand-green text-base border-b pb-2">📢 {t('admin.announcementForm.title')}</h3>
      {status && (
        <div className={`text-xs sm:text-sm rounded-lg p-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {status.message}
        </div>
      )}
      <div>
        <label className="label-field">{t('admin.announcementForm.title')}</label>
        <input name="title" required value={form.title} onChange={handleChange} className="input-field" />
      </div>
      <div>
        <label className="label-field">{t('admin.announcementForm.body')}</label>
        <textarea name="body" required rows={4} value={form.body} onChange={handleChange} className="input-field" />
      </div>
      <div>
        <label className="label-field">{t('admin.announcementForm.attachment')}</label>
        <input
          type="file" accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files[0] || null)}
          className="block w-full text-xs sm:text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-blue file:text-white file:font-semibold cursor-pointer"
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
        {t('admin.announcementForm.publish')}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------
// ------------------------------------------------------------------
// Edit Gallery Item Modal
// ------------------------------------------------------------------
function EditGalleryModal({ item, onClose, onSaveSuccess }) {
  const { t } = useTranslation();
  const [caption, setCaption] = useState(item.caption || '');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = new FormData();
    payload.append('caption', caption);
    if (file) {
      payload.append('image', file);
    }

    try {
      await axiosClient.put(`/admin/gallery/${item.id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update image.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto animate-fadeIn my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close edit modal"
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors z-20 focus:outline-none"
        >
          ✕
        </button>

        <h3 className="font-extrabold text-brand-green text-base sm:text-lg mb-4 flex items-center gap-2 border-b pb-2">
          <span>✏️</span> {t('admin.galleryForm.editTitle')}
        </h3>

        {error && (
          <div className="mb-4 text-xs sm:text-sm bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">{t('admin.galleryForm.editCaption')}</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="input-field"
              placeholder="Photo caption"
            />
          </div>

          <div>
            <label className="label-field">{t('admin.galleryForm.replaceImage')}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="block w-full text-xs sm:text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-blue file:text-white file:font-semibold cursor-pointer"
            />
            {item.image_path && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1 font-semibold">Current Image Preview:</p>
                <img
                  src={fileUrl(item.image_path)}
                  alt="Current Preview"
                  className="h-32 w-full object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('admin.galleryForm.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs sm:text-sm py-2 px-4"
            >
              {submitting ? t('admin.galleryForm.saving') : t('admin.galleryForm.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Gallery Tab
// ------------------------------------------------------------------
function GalleryTab() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/gallery');
      setItems(res.data.images || []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const payload = new FormData();
    payload.append('caption', caption);
    payload.append('image', file);

    setSubmitting(true);
    setStatus(null);
    try {
      await axiosClient.post('/admin/gallery', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ type: 'success', message: t('admin.galleryForm.successMessage') });
      setCaption('');
      setFile(null);
      e.target.reset();
      fetchGallery();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmMsg = t('admin.galleryForm.deleteConfirm', 'Are you sure you want to delete this photo from the gallery?');
    if (!window.confirm(confirmMsg)) return;

    try {
      await axiosClient.delete(`/admin/gallery/${id}`);
      fetchGallery();
    } catch (err) {
      alert(err.message || 'Failed to delete photo.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Form Card */}
      <form onSubmit={handleSubmit} className="card max-w-xl space-y-4 p-4 sm:p-6">
        <h3 className="font-bold text-brand-green text-base border-b pb-2 flex items-center gap-2">
          <span>🖼️</span> {t('admin.galleryForm.upload')}
        </h3>
        {status && (
          <div className={`text-xs sm:text-sm rounded-lg p-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {status.message}
          </div>
        )}
        <div>
          <label className="label-field">{t('admin.galleryForm.caption')}</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="input-field"
            placeholder="Photo caption"
          />
        </div>
        <div>
          <label className="label-field">{t('admin.galleryForm.image')}</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="block w-full text-xs sm:text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-blue file:text-white file:font-semibold cursor-pointer"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
          {t('admin.galleryForm.upload')}
        </button>
      </form>

      {/* Gallery Collection Grid */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-brand-blue text-lg sm:text-xl flex items-center gap-2">
            <span>📸</span> {t('admin.galleryForm.collectionTitle')}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-green/10 text-brand-green font-bold">
              {items.length}
            </span>
          </h3>
        </div>

        {loading ? (
          <p className="text-xs sm:text-sm text-gray-500 italic py-4">{t('common.loading')}</p>
        ) : items.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
            <p className="text-sm font-semibold text-gray-500">{t('admin.galleryForm.noImages')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="card overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
                <div>
                  <div className="h-44 w-full overflow-hidden bg-black/5 relative">
                    <img
                      src={fileUrl(item.image_path)}
                      alt={item.caption || 'Gallery Image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-brand-blue-dark text-xs sm:text-sm line-clamp-2">
                      {item.caption || <span className="italic text-gray-400">No caption</span>}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="p-3 pt-0 flex items-center justify-end gap-2 border-t border-gray-100 mt-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-brand-blue hover:bg-brand-blue hover:text-white font-bold text-xs border border-brand-blue px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    <span>✏️</span> {t('admin.galleryForm.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs border border-red-600 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    <span>🗑️</span> {t('admin.galleryForm.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditGalleryModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaveSuccess={fetchGallery}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Fee Config Tab
// ------------------------------------------------------------------
function FeeConfigTab() {
  const { t } = useTranslation();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingGrade, setUpdatingGrade] = useState(null);

  const loadFees = () => {
    setLoading(true);
    setError('');
    axiosClient.get('/admin/grade-fees')
      .then((res) => setFees(res.data.fees))
      .catch((err) => setError(err.message || t('admin.feeConfig.errorDefault')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFees(); }, []);

  const handleInputChange = (grade, field, value) => {
    setFees(prev => prev.map(f => f.grade === grade ? { ...f, [field]: value } : f));
  };

  const handleSave = async (feeConfig) => {
    setUpdatingGrade(feeConfig.grade);
    setError('');
    setSuccess('');
    try {
      await axiosClient.put(`/admin/grade-fees/${feeConfig.grade}`, {
        monthly_amount: Number(feeConfig.monthly_amount),
        due_day: Number(feeConfig.due_day),
        sibling_discount_percent: Number(feeConfig.sibling_discount_percent),
        daily_penalty_amount: Number(feeConfig.daily_penalty_amount)
      });
      setSuccess(t('admin.feeConfig.successMessage', { grade: feeConfig.grade }));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || t('admin.feeConfig.errorUpdate', { grade: feeConfig.grade }));
    } finally {
      setUpdatingGrade(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-brand-blue/70 text-sm">{t('admin.feeConfig.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
        <h3 className="text-brand-blue-dark font-bold text-base mb-1">{t('admin.feeConfig.rulesTitle')}</h3>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          {t('admin.feeConfig.rulesDescription')}
        </p>
      </div>

      {success && (
        <div className="bg-green-50 text-green-800 border border-green-200 p-3 rounded-lg text-xs sm:text-sm font-semibold">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-xs sm:text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Responsive Horizontal Table Wrapper */}
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-xs">
        <table className="w-full min-w-[650px] text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-brand-blue">
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.feeConfig.colGrade')}</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.feeConfig.colMonthlyFee')}</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.feeConfig.colDueDay')}</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.feeConfig.colSiblingDiscount')}</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">{t('admin.feeConfig.colDailyPenalty')}</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-right">{t('admin.feeConfig.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr key={fee.grade} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-brand-blue-dark">{fee.grade}</td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min="0"
                    value={fee.monthly_amount}
                    onChange={(e) => handleInputChange(fee.grade, 'monthly_amount', e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-1 focus:ring-brand-green"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={fee.due_day}
                    onChange={(e) => handleInputChange(fee.grade, 'due_day', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-1 focus:ring-brand-green"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={fee.sibling_discount_percent}
                    onChange={(e) => handleInputChange(fee.grade, 'sibling_discount_percent', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-1 focus:ring-brand-green"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min="0"
                    value={fee.daily_penalty_amount}
                    onChange={(e) => handleInputChange(fee.grade, 'daily_penalty_amount', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-1 focus:ring-brand-green"
                  />
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleSave(fee)}
                    disabled={updatingGrade === fee.grade}
                    className="bg-brand-green text-white font-bold text-xs hover:bg-brand-green-dark px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    {updatingGrade === fee.grade ? t('admin.feeConfig.savingBtn') : t('admin.feeConfig.updateBtn')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
