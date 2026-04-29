import React, { useState, useEffect } from 'react';
import { Gift, ChevronRight, ChevronLeft, Sparkles, Heart, TrendingUp, Calendar, Users, Palette, DollarSign, Lightbulb, Star, ShoppingBag, Zap, Award, Target, Brain, Wand2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockProducts } from '../data/products';
import { Product } from '../App';

interface QuizAnswers {
  occasion: string;
  recipient_relationship: string;
  traditions: string[];
  price_range: string;
  style_preferences: string[];
  recipientAge?: string;
  recipientGender?: string;
  personalityTraits?: string[];
  interests?: string[];
}

interface GiftMatch extends Product {
  matchScore: number;
  matchReasons: string[];
  perfectFor: string[];
}

export default function GiftFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    occasion: '',
    recipient_relationship: '',
    traditions: [],
    price_range: '',
    style_preferences: [],
    recipientAge: '',
    recipientGender: '',
    personalityTraits: [],
    interests: []
  });
  const [recommendations, setRecommendations] = useState<GiftMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [insightMode, setInsightMode] = useState(false);

  const occasions = [
    { name: 'Wedding', icon: '💍', description: 'Celebrate their union', season: 'any' },
    { name: 'Housewarming', icon: '🏠', description: 'Welcome to their new home', season: 'any' },
    { name: 'Religious Milestone', icon: '✨', description: 'Honor spiritual journey', season: 'any' },
    { name: 'Birthday', icon: '🎂', description: 'Make their day special', season: 'any' },
    { name: 'Anniversary', icon: '💝', description: 'Celebrate love & commitment', season: 'any' },
    { name: 'Graduation', icon: '🎓', description: 'Honor their achievement', season: 'spring' },
    { name: 'Holiday Season', icon: '🎄', description: 'Spread seasonal joy', season: 'winter' },
    { name: 'Thank You', icon: '🙏', description: 'Show appreciation', season: 'any' }
  ];

  const relationships = [
    { name: 'Spouse/Partner', closeness: 5, icon: '💑' },
    { name: 'Parent', closeness: 5, icon: '👪' },
    { name: 'Child', closeness: 5, icon: '👶' },
    { name: 'Sibling', closeness: 4, icon: '👫' },
    { name: 'Best Friend', closeness: 4, icon: '🤝' },
    { name: 'Friend', closeness: 3, icon: '👋' },
    { name: 'Extended Family', closeness: 3, icon: '👨‍👩‍👧‍👦' },
    { name: 'Religious Leader', closeness: 2, icon: '⛪' },
    { name: 'Teacher/Mentor', closeness: 2, icon: '📚' },
    { name: 'Colleague', closeness: 2, icon: '💼' }
  ];

  const traditions = [
    { name: 'Christian', color: 'blue', values: ['faith', 'compassion', 'grace'] },
    { name: 'Jewish', color: 'indigo', values: ['tradition', 'learning', 'community'] },
    { name: 'Islamic', color: 'emerald', values: ['devotion', 'charity', 'reflection'] },
    { name: 'Interfaith', color: 'purple', values: ['unity', 'diversity', 'respect'] },
    { name: 'Secular/Universal', color: 'gray', values: ['meaning', 'connection', 'appreciation'] }
  ];

  const priceRanges = [
    { label: 'Thoughtful ($25-$75)', value: 'under_50', min: 0, max: 75, description: 'Meaningful without breaking the bank' },
    { label: 'Generous ($75-$150)', value: '50_100', min: 75, max: 150, description: 'Show you really care' },
    { label: 'Premium ($150-$300)', value: '100_250', min: 150, max: 300, description: 'Make a lasting impression' },
    { label: 'Luxurious ($300-$600)', value: '250_500', min: 300, max: 600, description: 'For those special occasions' },
    { label: 'Extraordinary ($600+)', value: 'over_500', min: 600, max: 10000, description: 'Once-in-a-lifetime gift' }
  ];

  const styles = [
    { name: 'Traditional', desc: 'Timeless & classic', tags: ['classic', 'heritage'] },
    { name: 'Modern', desc: 'Contemporary & sleek', tags: ['contemporary', 'minimalist'] },
    { name: 'Rustic', desc: 'Natural & earthy', tags: ['natural', 'artisan'] },
    { name: 'Elegant', desc: 'Refined & sophisticated', tags: ['sophisticated', 'premium'] },
    { name: 'Handcrafted', desc: 'Artisan-made', tags: ['artisan', 'hand-made'] },
    { name: 'Minimalist', desc: 'Simple & clean', tags: ['simple', 'modern'] },
    { name: 'Ornate', desc: 'Detailed & decorative', tags: ['decorative', 'intricate'] },
    { name: 'Contemporary', desc: 'Current & fresh', tags: ['modern', 'trendy'] }
  ];

  const ageRanges = [
    { label: 'Child (0-12)', value: 'child' },
    { label: 'Teen (13-19)', value: 'teen' },
    { label: 'Young Adult (20-35)', value: 'young_adult' },
    { label: 'Adult (36-55)', value: 'adult' },
    { label: 'Senior (56+)', value: 'senior' }
  ];

  const personalityTraits = [
    { name: 'Spiritual', icon: '🙏' },
    { name: 'Creative', icon: '🎨' },
    { name: 'Traditional', icon: '📜' },
    { name: 'Adventurous', icon: '🌍' },
    { name: 'Intellectual', icon: '📚' },
    { name: 'Minimalist', icon: '✨' },
    { name: 'Collector', icon: '🏺' },
    { name: 'Homebody', icon: '🏡' }
  ];

  const interests = [
    { name: 'Prayer & Meditation', category: 'spiritual' },
    { name: 'Home Decor', category: 'lifestyle' },
    { name: 'Reading', category: 'intellectual' },
    { name: 'Art & Culture', category: 'creative' },
    { name: 'Cooking', category: 'lifestyle' },
    { name: 'Travel', category: 'adventure' },
    { name: 'Music', category: 'creative' },
    { name: 'Gardening', category: 'lifestyle' }
  ];

  function toggleArrayValue(key: 'traditions' | 'style_preferences' | 'personalityTraits' | 'interests', value: string) {
    setAnswers(prev => ({
      ...prev,
      [key]: prev[key]?.includes(value)
        ? prev[key].filter(v => v !== value)
        : [...(prev[key] || []), value]
    }));
  }

  function calculateGiftMatches(): GiftMatch[] {
    const matches: GiftMatch[] = [];

    const selectedPriceRange = priceRanges.find(r => r.value === answers.price_range);

    mockProducts.forEach((product) => {
      let score = 0;
      const reasons: string[] = [];
      const perfectFor: string[] = [];

      if (selectedPriceRange && product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max) {
        score += 25;
        reasons.push('Perfect price match');
      }

      answers.traditions.forEach(tradition => {
        if (product.tags.includes(tradition.toLowerCase())) {
          score += 20;
          reasons.push(`${tradition} significance`);
          perfectFor.push(tradition);
        }
      });

      answers.style_preferences.forEach(style => {
        const styleObj = styles.find(s => s.name === style);
        if (styleObj) {
          styleObj.tags.forEach(tag => {
            if (product.tags.includes(tag) || product.description.toLowerCase().includes(tag)) {
              score += 15;
              if (!reasons.includes(`${style} aesthetic`)) {
                reasons.push(`${style} aesthetic`);
              }
            }
          });
        }
      });

      if (answers.occasion) {
        const occasionKeywords: { [key: string]: string[] } = {
          'Wedding': ['blessing', 'unity', 'love', 'matrimony', 'couple'],
          'Housewarming': ['home', 'blessing', 'wall', 'decor', 'hanging'],
          'Religious Milestone': ['spiritual', 'prayer', 'sacred', 'holy', 'blessed'],
          'Birthday': ['celebration', 'special', 'unique', 'personal'],
          'Anniversary': ['love', 'commitment', 'memorial', 'lasting'],
          'Graduation': ['achievement', 'wisdom', 'journey', 'milestone'],
          'Holiday Season': ['festive', 'celebration', 'tradition', 'gathering'],
          'Thank You': ['appreciation', 'gratitude', 'thoughtful', 'meaningful']
        };

        const keywords = occasionKeywords[answers.occasion] || [];
        keywords.forEach(keyword => {
          if (product.description.toLowerCase().includes(keyword) || product.tags.includes(keyword)) {
            score += 10;
            if (!reasons.includes('Perfect for occasion')) {
              reasons.push('Perfect for occasion');
            }
          }
        });
      }

      if (answers.personalityTraits && answers.personalityTraits.length > 0) {
        const traitMap: { [key: string]: string[] } = {
          'Spiritual': ['prayer', 'meditation', 'sacred', 'spiritual', 'holy'],
          'Creative': ['artistic', 'unique', 'hand-painted', 'artisan'],
          'Traditional': ['heritage', 'classic', 'traditional', 'ancient'],
          'Minimalist': ['simple', 'clean', 'elegant', 'minimal'],
          'Collector': ['rare', 'limited', 'unique', 'special', 'edition'],
          'Homebody': ['home', 'decor', 'comfort', 'cozy']
        };

        answers.personalityTraits.forEach(trait => {
          const keywords = traitMap[trait] || [];
          keywords.forEach(keyword => {
            if (product.description.toLowerCase().includes(keyword) || product.tags.includes(keyword)) {
              score += 8;
              if (!reasons.includes(`Matches personality`)) {
                reasons.push(`Matches personality`);
              }
            }
          });
        });
      }

      if (product.rating >= 4.8) {
        score += 10;
        reasons.push('Highly rated by buyers');
      }

      if (product.trending) {
        score += 5;
        reasons.push('Trending gift');
      }

      if (product.featured) {
        score += 5;
      }

      if (score > 30) {
        matches.push({
          ...product,
          matchScore: Math.min(100, score),
          matchReasons: reasons.slice(0, 4),
          perfectFor: perfectFor
        });
      }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
  }

  async function getRecommendations() {
    setLoading(true);

    const matchedGifts = calculateGiftMatches();
    setRecommendations(matchedGifts);

    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('gift_finder_responses')
      .insert({
        user_id: user?.id || null,
        session_id: user ? null : crypto.randomUUID(),
        ...answers,
        recommended_products: matchedGifts.map(g => g.id)
      });

    setLoading(false);
    setStep(questions.length);
  }

  const questions = [
    {
      title: "What's the occasion?",
      subtitle: 'Understanding the context helps us find the most meaningful gift',
      icon: Calendar,
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          {occasions.map((occasion) => (
            <button
              key={occasion.name}
              onClick={() => setAnswers({ ...answers, occasion: occasion.name })}
              className={`group p-6 rounded-xl border-2 text-left transition-all transform hover:scale-105 ${
                answers.occasion === occasion.name
                  ? 'border-purple-500 gradient-purple-soul shadow-theme-lg'
                  : 'border-default hover:border-purple-300 hover:shadow-theme-md bg-surface'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{occasion.icon}</div>
                <div className="flex-1">
                  <div className={`font-bold text-lg mb-1 ${
                    answers.occasion === occasion.name ? 'text-white' : 'text-primary'
                  }`}>{occasion.name}</div>
                  <div className={`text-sm ${
                    answers.occasion === occasion.name ? 'text-white/90' : 'text-secondary'
                  }`}>{occasion.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Who's receiving this gift?",
      subtitle: 'Your relationship helps us gauge the right level of intimacy and formality',
      icon: Users,
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          {relationships.map((relationship) => (
            <button
              key={relationship.name}
              onClick={() => setAnswers({ ...answers, recipient_relationship: relationship.name })}
              className={`group p-5 rounded-xl border-2 text-left transition-all transform hover:scale-105 ${
                answers.recipient_relationship === relationship.name
                  ? 'border-purple-500 gradient-purple-soul shadow-theme-lg'
                  : 'border-default hover:border-purple-300 hover:shadow-theme-md bg-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{relationship.icon}</div>
                <div className="flex-1">
                  <div className={`font-bold ${
                    answers.recipient_relationship === relationship.name ? 'text-white' : 'text-primary'
                  }`}>{relationship.name}</div>
                  <div className="flex gap-1 mt-1">
                    {[...Array(relationship.closeness)].map((_, i) => (
                      <Heart key={i} className={`w-3 h-3 ${
                        answers.recipient_relationship === relationship.name
                          ? 'fill-white text-white'
                          : 'fill-rose-400 text-rose-400'
                      }`} />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Select traditions that resonate',
      subtitle: 'Choose all that apply - this ensures cultural and spiritual appropriateness',
      icon: Sparkles,
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          {traditions.map((tradition) => (
            <button
              key={tradition.name}
              onClick={() => toggleArrayValue('traditions', tradition.name)}
              className={`group p-6 rounded-xl border-2 text-left transition-all transform hover:scale-105 ${
                answers.traditions.includes(tradition.name)
                  ? 'border-purple-500 gradient-purple-soul shadow-theme-lg'
                  : 'border-default hover:border-purple-300 hover:shadow-theme-md bg-surface'
              }`}
            >
              <div className={`font-bold text-lg mb-2 ${
                answers.traditions.includes(tradition.name) ? 'text-white' : 'text-primary'
              }`}>{tradition.name}</div>
              <div className="flex flex-wrap gap-2">
                {tradition.values.map(value => (
                  <span key={value} className={`text-xs px-2 py-1 rounded-full ${
                    answers.traditions.includes(tradition.name)
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-deep text-secondary'
                  }`}>
                    {value}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "What's your budget?",
      subtitle: 'We have beautiful, meaningful options at every price point',
      icon: DollarSign,
      content: (
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {priceRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setAnswers({ ...answers, price_range: range.value })}
              className={`group p-6 rounded-xl border-2 text-left transition-all transform hover:scale-105 ${
                answers.price_range === range.value
                  ? 'border-purple-500 gradient-purple-soul shadow-theme-lg'
                  : 'border-default hover:border-purple-300 hover:shadow-theme-md bg-surface'
              }`}
            >
              <div className={`text-2xl font-bold mb-2 ${
                answers.price_range === range.value ? 'text-white' : 'text-primary'
              }`}>{range.label}</div>
              <div className={`text-sm ${
                answers.price_range === range.value ? 'text-white/90' : 'text-secondary'
              }`}>{range.description}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'What style speaks to you?',
      subtitle: 'Select all aesthetics that appeal to you or the recipient',
      icon: Palette,
      content: (
        <div className="grid md:grid-cols-4 gap-4">
          {styles.map((style) => (
            <button
              key={style.name}
              onClick={() => toggleArrayValue('style_preferences', style.name)}
              className={`group p-5 rounded-xl border-2 text-center transition-all transform hover:scale-105 ${
                answers.style_preferences.includes(style.name)
                  ? 'border-purple-500 gradient-purple-soul shadow-theme-lg'
                  : 'border-default hover:border-purple-300 hover:shadow-theme-md bg-surface'
              }`}
            >
              <div className={`font-bold mb-1 ${
                answers.style_preferences.includes(style.name) ? 'text-white' : 'text-primary'
              }`}>{style.name}</div>
              <div className={`text-xs ${
                answers.style_preferences.includes(style.name) ? 'text-white/90' : 'text-secondary'
              }`}>{style.desc}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Tell us about their personality',
      subtitle: 'Optional: This helps us fine-tune our recommendations',
      icon: Brain,
      content: (
        <div className="grid md:grid-cols-4 gap-4">
          {personalityTraits.map((trait) => (
            <button
              key={trait.name}
              onClick={() => toggleArrayValue('personalityTraits', trait.name)}
              className={`group p-5 rounded-xl border-2 text-center transition-all transform hover:scale-105 ${
                answers.personalityTraits?.includes(trait.name)
                  ? 'border-purple-500 gradient-purple-soul shadow-theme-lg'
                  : 'border-default hover:border-purple-300 hover:shadow-theme-md bg-surface'
              }`}
            >
              <div className="text-3xl mb-2">{trait.icon}</div>
              <div className={`font-semibold text-sm ${
                answers.personalityTraits?.includes(trait.name) ? 'text-white' : 'text-primary'
              }`}>{trait.name}</div>
            </button>
          ))}
        </div>
      )
    }
  ];

  const canProceed = () => {
    switch (step) {
      case 0:
        return answers.occasion !== '';
      case 1:
        return answers.recipient_relationship !== '';
      case 2:
        return answers.traditions.length > 0;
      case 3:
        return answers.price_range !== '';
      case 4:
        return answers.style_preferences.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  if (step === questions.length) {
    const selectedPriceRange = priceRanges.find(r => r.value === answers.price_range);

    return (
      <div className="min-h-screen bg-page">
        <div className="max-w-7xl mx-auto p-6 py-12">
          <div className="text-center mb-12">
            <div className="inline-block p-4 gradient-purple-soul rounded-2xl mb-6 shadow-xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-primary mb-3">Your Perfect Gift Matches</h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Based on your unique preferences, we've curated {recommendations.length} exceptional gifts with intelligent matching
            </p>
          </div>

          <div className="bg-surface border border-purple-200 rounded-2xl p-8 mb-10 shadow-theme-lg">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-xl text-primary">Your Gift Profile</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="gradient-purple-soul p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold text-white">Occasion</span>
                </div>
                <div className="text-white font-medium">{answers.occasion}</div>
              </div>
              <div className="gradient-purple-vibrant p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold text-white">For</span>
                </div>
                <div className="text-white font-medium">{answers.recipient_relationship}</div>
              </div>
              <div className="gradient-purple-deep p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold text-white">Budget</span>
                </div>
                <div className="text-white font-medium">{selectedPriceRange?.label}</div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-default">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-secondary">Traditions:</span>
                {answers.traditions.map(tradition => (
                  <span key={tradition} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {tradition}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-sm text-secondary">Styles:</span>
                {answers.style_preferences.map(style => (
                  <span key={style} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {recommendations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.map((gift, index) => (
                <div
                  key={gift.id}
                  className="group bg-surface rounded-2xl shadow-theme-lg hover:shadow-theme-2xl transition-all duration-300 overflow-hidden border border-default hover:border-purple-300"
                >
                  <div className="relative">
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 gradient-purple-soul text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      {gift.matchScore}% Match
                    </div>
                    {index === 0 && (
                      <div className="absolute top-4 right-4 gradient-purple-vibrant text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Best Match
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-primary mb-2 line-clamp-2">{gift.name}</h3>
                    <p className="text-sm text-secondary mb-4 line-clamp-2">{gift.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(gift.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-secondary">({gift.reviews})</span>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-purple-600" />
                        Why this matches:
                      </div>
                      <div className="space-y-1">
                        {gift.matchReasons.slice(0, 3).map((reason, i) => (
                          <div key={i} className="text-xs text-secondary flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-default">
                      <div>
                        <div className="text-2xl font-bold text-primary">${gift.price}</div>
                        {gift.originalPrice && (
                          <div className="text-sm text-muted line-through">${gift.originalPrice}</div>
                        )}
                      </div>
                      <button className="gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-theme-md hover:shadow-theme-lg flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface rounded-2xl shadow-theme-lg">
              <Gift className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-secondary mb-6">
                No perfect matches found. Try adjusting your preferences.
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => {
                setStep(0);
                setAnswers({
                  occasion: '',
                  recipient_relationship: '',
                  traditions: [],
                  price_range: '',
                  style_preferences: [],
                  recipientAge: '',
                  recipientGender: '',
                  personalityTraits: [],
                  interests: []
                });
                setRecommendations([]);
              }}
              className="gradient-purple-deep text-white px-8 py-4 rounded-xl hover:opacity-90 font-semibold shadow-theme-lg hover:shadow-theme-xl transition-all inline-flex items-center gap-2"
            >
              <Wand2 className="w-5 h-5" />
              Start New Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[step];

  return (
    <div className="min-h-screen">
      <section className="relative bg-page overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                AI-Powered Recommendations
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
                Find The
                <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent"> Perfect Gift</span>
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                Answer a few smart questions and let our intelligent gift finder discover meaningful presents tailored to your recipient's faith, interests, and occasion.
              </p>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">95%</div>
                  <div className="text-sm text-secondary">Match Accuracy</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-secondary">Gifts Found</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">4.9</div>
                  <div className="flex items-center gap-1 text-sm text-secondary">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    Rating
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-surface rounded-2xl p-8 shadow-theme-2xl border-2 border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">Gift Intelligence</h3>
                    <p className="text-sm text-secondary">Smart recommendations just for you</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-secondary">AI-Powered Matching</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-secondary">Personalized Results</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-secondary">Faith-Sensitive Options</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto p-6 py-12 bg-page">

        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-secondary">
                Step {step + 1} of {questions.length}
              </span>
              {step >= 5 && (
                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  Optional
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-purple-600">
              {Math.round(((step + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="relative w-full bg-surface-deep rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full gradient-purple-soul rounded-full transition-all duration-700 ease-out shadow-theme-lg"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-theme-2xl p-10 mb-8 border border-default">
          <div className="flex items-center gap-4 mb-8">
            {React.createElement(currentQuestion.icon, { className: "w-10 h-10 text-purple-600" })}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-primary mb-2">{currentQuestion.title}</h2>
              <p className="text-secondary text-lg">{currentQuestion.subtitle}</p>
            </div>
          </div>

          {currentQuestion.content}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-8 py-4 border-2 border-default rounded-xl hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-secondary transition-all shadow-theme-md hover:shadow-theme-lg disabled:hover:shadow-theme-md"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {step < questions.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 gradient-purple-soul text-white px-8 py-4 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed font-semibold shadow-theme-lg hover:shadow-theme-xl transition-all disabled:hover:shadow-theme-lg"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={getRecommendations}
              disabled={!canProceed() || loading}
              className="flex items-center gap-3 gradient-purple-soul text-white px-8 py-4 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed font-semibold shadow-theme-lg hover:shadow-theme-xl transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                  Analyzing Preferences...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Find Perfect Gifts
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
