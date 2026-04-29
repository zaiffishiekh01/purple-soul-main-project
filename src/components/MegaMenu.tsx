import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Star, TrendingUp, Sparkles, Tag, Gift, Zap } from 'lucide-react';
import { mockProducts } from '../data/products';

interface MegaMenuProps {
  onNavigate: (view: string, category?: string) => void;
  darkMode?: boolean;
}

export default function MegaMenu({ onNavigate, darkMode = false }: MegaMenuProps) {
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const categories = [
    {
      id: 'christian',
      name: 'Christian',
      icon: Star,
      subcategories: [
        {
          name: 'Crosses & Crucifixes',
          items: ['Wall Crosses', 'Pendant Crosses', 'Standing Crucifixes', 'Decorative Crosses', 'Gift Sets']
        },
        {
          name: 'Icons & Art',
          items: ['Byzantine Icons', 'Canvas Prints', 'Framed Art', 'Sculptures', 'Mosaics']
        },
        {
          name: 'Prayer Items',
          items: ['Rosaries', 'Prayer Books', 'Candles', 'Holy Water Fonts', 'Prayer Cards']
        },
        {
          name: 'Books & Media',
          items: ['Bibles', 'Study Guides', 'Audio Books', 'DVDs', 'Devotionals']
        },
        {
          name: 'Jewelry',
          items: ['Necklaces', 'Bracelets', 'Rings', 'Earrings', 'Custom Pieces']
        },
        {
          name: 'Home Decor',
          items: ['Wall Art', 'Statues', 'Candles', 'Pillows', 'Throws']
        }
      ],
      featured: mockProducts.filter(p => p.category === 'Christian Crafts').slice(0, 3),
    },
    {
      id: 'jewish',
      name: 'Jewish',
      icon: Star,
      subcategories: [
        {
          name: 'Mezuzahs',
          items: ['Traditional', 'Modern', 'Sterling Silver', 'Hand-Painted', 'Kids']
        },
        {
          name: 'Menorahs',
          items: ['Hanukkah', 'Shabbat', 'Modern', 'Antique Style', 'Travel Size']
        },
        {
          name: 'Tallit & Tefillin',
          items: ['Tallit Sets', 'Tefillin Bags', 'Tallit Clips', 'Custom Embroidery']
        },
        {
          name: 'Shabbat Items',
          items: ['Candlesticks', 'Kiddush Cups', 'Challah Boards', 'Covers', 'Sets']
        },
        {
          name: 'Judaica Art',
          items: ['Wall Art', 'Sculptures', 'Calligraphy', 'Papercuts', 'Mixed Media']
        }
      ],
      featured: mockProducts.filter(p => p.category === 'Jewish Crafts').slice(0, 3),
    },
    {
      id: 'islamic',
      name: 'Islamic',
      icon: Star,
      subcategories: [
        {
          name: 'Prayer Rugs',
          items: ['Traditional', 'Travel', 'Premium Silk', 'Electric', 'Kids']
        },
        {
          name: 'Calligraphy Art',
          items: ['Canvas Prints', 'Metal Art', 'Wood Carvings', 'Custom Pieces', 'Frames']
        },
        {
          name: 'Quran & Books',
          items: ['Qurans', 'Translations', 'Study Guides', 'Hadith Collections', 'Kids Books']
        },
        {
          name: 'Tasbih & Prayer Beads',
          items: ['Wood Beads', 'Stone Beads', 'Digital Counters', 'Premium Sets', 'Custom']
        },
        {
          name: 'Islamic Decor',
          items: ['Wall Art', 'Table Decor', 'Lanterns', 'Sculptures', 'Gift Sets']
        }
      ],
      featured: mockProducts.filter(p => p.category === 'Islamic Crafts').slice(0, 3),
    },
  ];

  const quickLinks = [
    { name: 'New Arrivals', icon: Sparkles, action: () => onNavigate('catalog', 'new') },
    { name: 'Trending', icon: TrendingUp, action: () => onNavigate('catalog', 'trending') },
    { name: 'Sale', icon: Tag, action: () => onNavigate('catalog', 'sale') },
    { name: 'Gift Guide', icon: Gift, action: () => onNavigate('catalog', 'gifts') },
  ];

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setActiveSubcategory(null), 150);
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 mt-2 w-[900px] rounded-2xl shadow-2xl border backdrop-blur-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
      style={{
        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: darkMode ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)'
      }}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3 grid grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <category.icon className="w-3.5 h-3.5" />
                  {category.name}
                </h3>
                <div className="space-y-1">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub.name}
                      className="relative group/sub"
                      onMouseEnter={() => {
                        if (hoverTimeout) clearTimeout(hoverTimeout);
                        setActiveSubcategory(sub.name);
                      }}
                    >
                      <button
                        onClick={() => {
                          onNavigate('catalog', sub.name);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg transition-all duration-150 flex items-center justify-between text-secondary hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-surface-elevated"
                      >
                        <span className="text-sm font-medium">{sub.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                      </button>

                      {activeSubcategory === sub.name && sub.items && (
                        <div
                          className={`absolute left-full top-0 ml-2 w-48 rounded-xl shadow-theme-xl border p-3 z-50 ${
                            darkMode
                              ? 'bg-gray-800 border-gray-700'
                              : 'bg-surface border-default'
                          }`}
                        >
                          <div className="space-y-1">
                            {sub.items.map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  onNavigate('catalog', item);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-150 text-secondary hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-surface-elevated"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={`border-l pl-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Featured
            </h3>
            <div className="space-y-3">
              {mockProducts.slice(0, 3).map((product) => (
                <button
                  key={product.id}
                  onClick={() => onNavigate('product', product.id)}
                  className={`w-full text-left p-2 rounded-lg transition-all duration-150 group/item ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-purple-50'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-primary group-hover/item:text-purple-700 dark:group-hover/item:text-purple-400">
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
          </div>
        </div>

        <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex gap-2">
            {quickLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <button
                  key={link.name}
                  onClick={link.action}
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-150 bg-surface-deep text-secondary hover:bg-purple-100 dark:hover:bg-surface-elevated hover:text-purple-700 dark:hover:text-purple-400"
                >
                  <LinkIcon className="w-4 h-4" />
                  {link.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
