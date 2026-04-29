import React, { useState, useEffect } from 'react';
import { Camera, Heart, MapPin, X } from 'lucide-react';
import { supabase, CustomerGallery as GalleryItem } from '../lib/supabase';

interface CustomerGalleryProps {
  productId?: string;
}

export default function CustomerGallery({ productId }: CustomerGalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, [productId]);

  async function loadGallery() {
    setLoading(true);

    let query = supabase
      .from('customer_gallery')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data } = await query.limit(12);

    if (data) setGalleryItems(data);
    setLoading(false);
  }

  async function likePost(id: string) {
    const item = galleryItems.find(i => i.id === id);
    if (!item) return;

    const { error } = await supabase
      .from('customer_gallery')
      .update({ likes_count: item.likes_count + 1 })
      .eq('id', id);

    if (!error) {
      setGalleryItems(galleryItems.map(i =>
        i.id === id ? { ...i, likes_count: i.likes_count + 1 } : i
      ));
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="aspect-square bg-surface-deep rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2 flex items-center gap-2">
          <Camera className="w-7 h-7 text-amber-600" />
          Customer Gallery
        </h2>
        <p className="text-secondary">See how customers are enjoying their purchases</p>
      </div>

      {galleryItems.length === 0 ? (
        <div className="text-center py-16 bg-surface-deep rounded-lg">
          <Camera className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-secondary">No customer photos yet</p>
          <p className="text-sm text-muted">Be the first to share your purchase!</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-surface-deep"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.image_url}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    {item.caption && (
                      <p className="text-sm font-medium line-clamp-2 mb-2">{item.caption}</p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-current" />
                        {item.likes_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-purple-200 z-10"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-6">
                <div className="flex items-center justify-center">
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.caption}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  />
                </div>

                <div className="bg-surface rounded-lg p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-4">
                      {selectedImage.caption || 'Customer Photo'}
                    </h3>

                    {selectedImage.location && (
                      <div className="flex items-center gap-2 text-secondary mb-4">
                        <MapPin className="w-5 h-5" />
                        <span>{selectedImage.location}</span>
                      </div>
                    )}

                    <p className="text-sm text-muted mb-6">
                      Posted {new Date(selectedImage.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => likePost(selectedImage.id)}
                    className="flex items-center justify-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 font-medium"
                  >
                    <Heart className="w-5 h-5" />
                    Like ({selectedImage.likes_count})
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
