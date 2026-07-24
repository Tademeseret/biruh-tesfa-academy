// components/AnnouncementBoard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient, { fileUrl } from '../api/axiosClient';

function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function AnnouncementBoard() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sectionRef = useScrollReveal();

  useEffect(() => {
    let isMounted = true;
    axiosClient
      .get('/announcements')
      .then((res) => { if (isMounted) setAnnouncements(res.data.announcements); })
      .catch((err) => { if (isMounted) setError(err.message); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="bg-white py-16 px-4">
      <div ref={sectionRef} className="reveal max-w-6xl mx-auto">
        {/* Same badge style as About */}
        <span className="section-badge">{t('home.announcementsTitle')}</span>

        {/* Same card style as About */}
        <div className="bg-white border border-gray-200 rounded-none shadow-md p-8 border-l-4 border-l-brand-green">
          <h2 className="text-2xl font-extrabold text-brand-green mb-6">{t('home.announcementsTitle')}</h2>

          {loading && <p className="text-brand-blue/70">{t('common.loading')}</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && announcements.length === 0 && (
            <p className="text-brand-blue/60 font-medium">{t('home.noAnnouncements')}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 border-l-4 border-l-brand-green bg-gray-50 p-5 hover:shadow-sm transition-shadow"
              >
                <h3 className="font-bold text-brand-green text-base mb-2">{item.title}</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{item.body}</p>
                {item.attachment_path && (
                  <a
                    href={fileUrl(item.attachment_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-sm font-semibold text-brand-blue underline"
                  >
                    {t('portal.download')}
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
