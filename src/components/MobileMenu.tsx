import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, X, Home, ShoppingBag, Star, TrendingUp, Sparkles, Tag, Gift, Zap, Search } from 'lucide-react';
import { mockProducts } from '../data/products';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, category?: string) => void;
  darkMode?: boolean;
  searchQuery: string;
  onSearch: (query: string) => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  onNavigate,
  darkMode = false,
  searchQuery,
  onSearch,
}: MobileMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const categories = [
    {
      id: 'christian',
      name: 'Christian',
      icon: Star,
      subcategories: ['Crosses & Crucifixes', 'Icons & Art', 'Prayer Items', 'Books & Media', 'Jewelry', 'Home Decor'],
      featured: mockProducts.filter(p => p.category === 'Christian Crafts').slice(0, 2),
    },
    {
      id: 'jewish',
      name: 'Jewish',
      icon: Star,
      subcategories: ['Mezuzahs', 'Menorahs', 'Tallit & Tefillin', 'Shabbat Items', 'Judaica Art', 'Books & Scrolls'],
      featured: mockProducts.filter(p => p.category === 'Jewish Crafts').slice(0, 2),
    },
    {
      id: 'islamic',
      name: 'Islamic',
      icon: Star,
      subcategories: ['Prayer Rugs', 'Calligraphy Art', 'Quran & Books', 'Tasbih & Prayer Beads', 'Islamic Decor', 'Clothing'],
      featured: mockProducts.filter(p => p.category === 'Islamic Crafts').slice(0, 2),
    },
    {
      id: 'digital',
      name: 'Digital Resources',
      icon: Zap,
      subcategories: ['E-Books', 'Audio Lectures', 'Apps & Software', 'Online Courses', 'Digital Art', 'Subscriptions'],
      featured: mockProducts.filter(p => p.tags.includes('digital')).slice(0, 2),
    },
    {
      id: 'electronics',
      name: 'Sacred Electronics',
      icon: Sparkles,
      subcategories: ['Prayer Time Devices', 'Digital Qurans', 'Audio Players', 'Smart Devices', 'Lighting', 'Accessories'],
      featured: mockProducts.filter(p => p.tags.includes('electronics')).slice(0, 2),
    },
  ];

  const quickLinks = [
    { name: 'Home', icon: Home, action: () => handleNavigate('home') },
    { name: 'Shop All', icon: ShoppingBag, action: () => handleNavigate('catalog') },
    { name: 'Gift Finder', icon: Gift, action: () => handleNavigate('gifts') },
    { name: 'Traditions', icon: Star, action: () => handleNavigate('traditions') },
  ];

  const discoverLinks = [
    { name: 'Christian', action: () => handleNavigate('discover-christian') },
    { name: 'Jewish', action: () => handleNavigate('discover-jewish') },
    { name: 'Islamic', action: () => handleNavigate('discover-islamic') },
    { name: 'Interfaith & Universal', action: () => handleNavigate('discover-interfaith') },
    { name: 'Shop Pilgrimage Essentials', action: () => handleNavigate('pilgrimage') },
    { name: 'Shop Wedding Essentials', action: () => handleNavigate('wedding-products') },
    { name: 'Shop New Birth Essentials', action: () => handleNavigate('welcome-products') },
    { name: 'Shop Celebrations Essentials', action: () => handleNavigate('seasonal-products') },
    { name: 'Shop Reflections Essentials', action: () => handleNavigate('remembrance-products') },
    { name: 'Shop Home Blessing Essentials', action: () => handleNavigate('home-blessing-products') },
  ];

  const handleNavigate = (view: string, category?: string) => {
    onNavigate(view, category);
    onClose();
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRightSwipe) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setExpandedCategory(null);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm shadow-theme-2xl z-50 animate-in slide-in-from-right duration-300 ${
          darkMode ? 'bg-gray-900' : 'bg-surface'
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="h-full flex flex-col">
          <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-800' : 'border-default'}`}>
            <h2 className={`text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent`}>
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-surface-deep dark:hover:bg-surface-elevated text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-default'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500'
                    : 'bg-surface-deep border-default text-primary placeholder-muted focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Quick Access
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.name}
                        onClick={link.action}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 text-secondary hover:bg-purple-50 dark:hover:bg-surface-elevated hover:text-purple-700 dark:hover:text-purple-400"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{link.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Discover
                </h3>
                <div className="space-y-1 mb-6">
                  {discoverLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={link.action}
                      className="w-full text-left flex items-center gap-2 p-3 rounded-xl transition-all duration-150 text-secondary hover:bg-purple-50 dark:hover:bg-surface-elevated hover:text-purple-700 dark:hover:text-purple-400"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-sm font-medium">{link.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Categories
                </h3>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isExpanded = expandedCategory === category.id;

                    return (
                      <div key={category.id}>
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-150 ${
                            isExpanded
                              ? 'bg-purple-50 dark:bg-surface-elevated text-purple-700 dark:text-purple-400'
                              : 'text-secondary hover:bg-surface-deep dark:hover:bg-surface-elevated'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className={`mt-1 ml-4 pl-4 border-l space-y-1 animate-in slide-in-from-top-2 duration-200 ${
                            darkMode ? 'border-gray-800' : 'border-default'
                          }`}>
                            {category.subcategories.map((sub) => (
                              <button
                                key={sub}
                                onClick={() => handleNavigate('catalog', sub)}
                                className={`w-full text-left flex items-center gap-2 p-2.5 rounded-lg transition-all duration-150 ${
                                  darkMode
                                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                    : 'hover:bg-purple-50 text-secondary hover:text-purple-700'
                                }`}
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                                <span className="text-sm">{sub}</span>
                              </button>
                            ))}

                            {category.featured.length > 0 && (
                              <div className={`mt-3 pt-3 border-t space-y-2 ${darkMode ? 'border-gray-800' : 'border-default'}`}>
                                <p className={`text-xs font-semibold uppercase tracking-wider px-2 ${darkMode ? 'text-gray-500' : 'text-muted'}`}>
                                  Featured
                                </p>
                                {category.featured.map((product) => (
                                  <button
                                    key={product.id}
                                    onClick={() => handleNavigate('product', product.id)}
                                    className={`w-full text-left p-2 rounded-lg transition-all duration-150 ${
                                      darkMode ? 'hover:bg-gray-800' : 'hover:bg-purple-50'
                                    }`}
                                  >
                                    <div className="flex gap-3">
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded-lg"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-primary">
                                          {product.name}
                                        </p>
                                        <p className="text-sm font-semibold text-purple-600">
                                          ${product.price}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 border-t ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-default bg-surface-deep'}`}>
            <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-muted'}`}>
              Swipe right to close
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
