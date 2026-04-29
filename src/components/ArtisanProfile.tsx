import React, { useState, useEffect } from 'react';
import { Star, MapPin, Award, Video, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { supabase, Artisan, ArtisanMedia } from '../lib/supabase';

interface ArtisanProfileProps {
  artisanId: string;
  onClose: () => void;
}

export default function ArtisanProfile({ artisanId, onClose }: ArtisanProfileProps) {
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [media, setMedia] = useState<ArtisanMedia[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtisanData();
  }, [artisanId]);

  async function loadArtisanData() {
    setLoading(true);

    const [artisanResult, mediaResult] = await Promise.all([
      supabase.from('artisans').select('*').eq('id', artisanId).maybeSingle(),
      supabase.from('artisan_media').select('*').eq('artisan_id', artisanId).order('display_order')
    ]);

    if (artisanResult.data) setArtisan(artisanResult.data);
    if (mediaResult.data) setMedia(mediaResult.data);

    setLoading(false);
  }

  async function sendMessage() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Please sign in to send messages');
      return;
    }

    const { error } = await supabase.from('artisan_messages').insert({
      artisan_id: artisanId,
      user_id: user.id,
      message: message,
      sender_type: 'customer'
    });

    if (!error) {
      setMessage('');
      setShowMessageForm(false);
      alert('Message sent successfully!');
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-surface rounded-lg p-8">
          <div className="animate-spin h-12 w-12 border-4 border-amber-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!artisan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-surface rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-amber-600 to-amber-800">
          {artisan.cover_image && (
            <img src={artisan.cover_image} alt="Cover" className="w-full h-full object-cover" />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-surface text-secondary px-4 py-2 rounded-lg hover:bg-surface-deep"
          >
            Close
          </button>
        </div>

        {/* Profile Header */}
        <div className="px-8 pb-8">
          <div className="flex items-end -mt-16 mb-6">
            <img
              src={artisan.profile_image || 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg'}
              alt={artisan.display_name}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            <div className="ml-6 mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-primary">{artisan.display_name}</h2>
                {artisan.verified && (
                  <Award className="w-6 h-6 text-purple-600" fill="currentColor" />
                )}
              </div>
              <p className="text-secondary">{artisan.business_name}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8 bg-surface-deep p-6 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{artisan.years_experience}</div>
              <div className="text-sm text-secondary">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{artisan.total_sales}</div>
              <div className="text-sm text-secondary">Items Sold</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
                <span className="text-2xl font-bold text-primary">{artisan.rating.toFixed(1)}</span>
              </div>
              <div className="text-sm text-secondary">Rating</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <MapPin className="w-5 h-5 text-secondary" />
                <span className="text-lg font-semibold text-primary">{artisan.location}</span>
              </div>
              <div className="text-sm text-secondary">Location</div>
            </div>
          </div>

          {/* Traditions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {artisan.traditions.map((tradition, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                >
                  {tradition}
                </span>
              ))}
            </div>
          </div>

          {/* Heritage Story */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Heritage Story</h3>
            <p className="text-secondary leading-relaxed whitespace-pre-line">{artisan.heritage_story}</p>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">About</h3>
            <p className="text-secondary leading-relaxed whitespace-pre-line">{artisan.bio}</p>
          </div>

          {/* Video */}
          {artisan.video_url && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Workshop Tour
              </h3>
              <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-900">
                <iframe
                  src={artisan.video_url}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* Gallery */}
          {media.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">Gallery</h3>
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden bg-surface-deep">
                  {media[currentMediaIndex].media_type === 'image' ? (
                    <img
                      src={media[currentMediaIndex].media_url}
                      alt={media[currentMediaIndex].caption}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={media[currentMediaIndex].media_url}
                      controls
                      className="w-full h-full"
                    />
                  )}
                </div>

                {media[currentMediaIndex].caption && (
                  <p className="mt-2 text-secondary text-sm">{media[currentMediaIndex].caption}</p>
                )}

                {media.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentMediaIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-surface bg-opacity-80 p-2 rounded-full hover:bg-opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentMediaIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface bg-opacity-80 p-2 rounded-full hover:bg-opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                <div className="flex justify-center gap-2 mt-4">
                  {media.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentMediaIndex ? 'bg-amber-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Artisan */}
          <div className="border-t pt-8">
            {!showMessageForm ? (
              <button
                onClick={() => setShowMessageForm(true)}
                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Ask the Artisan
              </button>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-3">Send a Message</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about custom orders, techniques, or traditions..."
                  className="w-full p-4 border rounded-lg mb-3 min-h-32"
                />
                <div className="flex gap-3">
                  <button
                    onClick={sendMessage}
                    className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium"
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => setShowMessageForm(false)}
                    className="px-6 py-3 border border-default rounded-lg hover:bg-surface-deep"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
