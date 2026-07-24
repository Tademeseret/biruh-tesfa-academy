// components/Gallery.jsx
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

export default function Gallery() {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const sectionRef = useScrollReveal();

  useEffect(() => {
    let isMounted = true;
    axiosClient
      .get('/gallery')
      .then((res) => { if (isMounted) setImages(res.data.images); })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="bg-gray-50 py-10 sm:py-16 px-4 sm:px-6">
      <div ref={sectionRef} className="reveal max-w-6xl mx-auto">
        <span className="section-badge">{t('home.galleryTitle')}</span>

        <div className="bg-white border border-gray-200 shadow-md p-5 sm:p-8 border-l-4 border-l-brand-green rounded-lg">
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-green mb-6">{t('home.galleryTitle')}</h2>

          {loading && <p className="text-brand-blue/70 text-sm">{t('common.loading')}</p>}
          {!loading && images.length === 0 && (
            <p className="text-brand-blue/60 font-medium text-sm">{t('home.noGalleryImages')}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((img) => (
              <figure
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="overflow-hidden border border-gray-200 group hover:border-brand-green hover:shadow-md transition-all duration-300 rounded-lg cursor-pointer bg-white"
              >
                <div className="overflow-hidden">
                  <img
                    src={fileUrl(img.image_path)}
                    alt={img.caption || 'School photo'}
                    className="w-full h-48 sm:h-40 md:h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                {img.caption && (
                  <figcaption className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 border-t border-gray-100 truncate">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-xs">
          <div className="relative max-w-3xl w-full bg-white rounded-xl overflow-hidden shadow-2xl animate-fadeIn my-auto max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black transition-colors z-20 font-bold text-lg focus:outline-none"
            >
              ✕
            </button>
            <div className="flex-1 overflow-hidden bg-black flex items-center justify-center min-h-0">
              <img
                src={fileUrl(selectedImage.image_path)}
                alt={selectedImage.caption || 'Full view'}
                className="w-full max-h-[75vh] object-contain"
              />
            </div>
            {selectedImage.caption && (
              <div className="p-3 sm:p-4 bg-white text-center border-t">
                <p className="text-xs sm:text-sm font-semibold text-brand-blue">{selectedImage.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
