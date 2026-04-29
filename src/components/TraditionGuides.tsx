import React, { useState, useEffect } from 'react';
import { BookOpen, Video, Eye, ChevronRight, X, ChevronDown, Sparkles, Calendar, Gift, Heart, Users, Info } from 'lucide-react';
import { supabase, TraditionGuide } from '../lib/supabase';

interface TraditionData {
  name: string;
  color: string;
  icon: string;
  description: string;
  keyHolidays: { name: string; season: string; description: string }[];
  symbolism: { item: string; meaning: string }[];
  giftingEtiquette: string[];
  culturalInsights: string[];
}

export default function TraditionGuides() {
  const [guides, setGuides] = useState<TraditionGuide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<TraditionGuide | null>(null);
  const [selectedTradition, setSelectedTradition] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const traditions: TraditionData[] = [
    {
      name: 'Christian',
      color: 'bg-blue-600',
      icon: '✝',
      description: 'Explore Christian traditions centered on the life and teachings of Jesus Christ, celebrating faith through sacraments, prayer, and community.',
      keyHolidays: [
        { name: 'Christmas', season: 'Winter (December 25)', description: 'Celebration of the birth of Jesus Christ, marked by gift-giving, family gatherings, and acts of charity.' },
        { name: 'Easter', season: 'Spring (Variable)', description: 'Commemorates the resurrection of Jesus, symbolizing hope, renewal, and salvation.' },
        { name: 'Lent', season: 'Spring (40 days before Easter)', description: 'Period of fasting, prayer, and penance in preparation for Easter.' },
        { name: 'Pentecost', season: 'Spring (50 days after Easter)', description: 'Celebrates the descent of the Holy Spirit upon the apostles.' }
      ],
      symbolism: [
        { item: 'Cross/Crucifix', meaning: 'Symbol of Jesus\'s sacrifice and redemption, central to Christian faith.' },
        { item: 'Fish (Ichthys)', meaning: 'Ancient symbol representing Jesus Christ and Christian identity.' },
        { item: 'Dove', meaning: 'Represents the Holy Spirit, peace, and divine presence.' },
        { item: 'Rosary Beads', meaning: 'Used in prayer and meditation, particularly in Catholic traditions.' }
      ],
      giftingEtiquette: [
        'Christmas and Easter are primary gift-giving occasions',
        'Religious items like crosses, prayer books, and rosaries make meaningful gifts',
        'Baptism and confirmation gifts often include religious jewelry or keepsakes',
        'Consider charitable donations in someone\'s name as a faith-honoring gift'
      ],
      culturalInsights: [
        'Christianity encompasses diverse denominations with varying practices (Catholic, Protestant, Orthodox)',
        'Sunday is traditionally the day of worship and rest',
        'Many Christians observe fasting periods, especially during Lent',
        'Hospitality and community service are core values in Christian culture'
      ]
    },
    {
      name: 'Jewish',
      color: 'bg-indigo-600',
      icon: '✡',
      description: 'Discover Jewish traditions rooted in thousands of years of history, emphasizing Torah study, family, and the covenant between God and the Jewish people.',
      keyHolidays: [
        { name: 'Hanukkah', season: 'Winter (8 days in Kislev)', description: 'Festival of Lights celebrating the rededication of the Temple and the miracle of oil lasting eight days.' },
        { name: 'Passover (Pesach)', season: 'Spring (8 days in Nisan)', description: 'Commemorates the liberation of Israelites from Egyptian slavery with the Seder meal.' },
        { name: 'Rosh Hashanah', season: 'Fall (1-2 days in Tishrei)', description: 'Jewish New Year, a time of reflection, prayer, and renewal.' },
        { name: 'Yom Kippur', season: 'Fall (10th of Tishrei)', description: 'Day of Atonement, the holiest day marked by fasting and repentance.' }
      ],
      symbolism: [
        { item: 'Menorah', meaning: 'Seven or nine-branched candelabrum symbolizing divine presence and the Hanukkah miracle.' },
        { item: 'Star of David', meaning: 'Six-pointed star representing Jewish identity and faith.' },
        { item: 'Mezuzah', meaning: 'Doorpost scroll containing scripture, marking a Jewish home.' },
        { item: 'Tallit (Prayer Shawl)', meaning: 'Worn during prayer, symbolizes being wrapped in God\'s commandments.' }
      ],
      giftingEtiquette: [
        'Hanukkah involves eight nights of gift-giving, often one gift per night',
        'Bar/Bat Mitzvah gifts commonly include money in multiples of 18 (chai, meaning "life")',
        'Avoid gifts containing pork, shellfish, or non-kosher items',
        'Books of Jewish wisdom, Judaica art, and religious items are thoughtful choices'
      ],
      culturalInsights: [
        'Sabbath (Shabbat) begins Friday evening and ends Saturday evening, a day of rest',
        'Kosher dietary laws prohibit certain foods and mixing meat with dairy',
        'Jewish identity is matrilineal, passed through the mother\'s line',
        'Education and learning, particularly Torah study, are highly valued'
      ]
    },
    {
      name: 'Islamic',
      color: 'bg-emerald-600',
      icon: '☪',
      description: 'Learn about Islamic traditions following the teachings of Prophet Muhammad (PBUH), centered on the Five Pillars and devotion to Allah.',
      keyHolidays: [
        { name: 'Ramadan', season: 'Variable (9th month Islamic calendar)', description: 'Holy month of fasting from dawn to sunset, focused on prayer, reflection, and charity.' },
        { name: 'Eid al-Fitr', season: 'After Ramadan (Shawwal 1)', description: 'Festival of Breaking Fast celebrating the end of Ramadan with prayers, feasts, and gifts.' },
        { name: 'Eid al-Adha', season: 'Variable (Dhul Hijjah 10)', description: 'Festival of Sacrifice honoring Abraham\'s willingness to sacrifice his son, marked by animal sacrifice and charity.' },
        { name: 'Mawlid al-Nabi', season: 'Variable (Rabi\' al-Awwal 12)', description: 'Celebrates the birth of Prophet Muhammad (PBUH) with gatherings and prayers.' }
      ],
      symbolism: [
        { item: 'Crescent Moon & Star', meaning: 'Widely recognized symbol of Islam, representing the Islamic calendar and faith.' },
        { item: 'Prayer Rug (Sajjadah)', meaning: 'Used during the five daily prayers, symbolizing clean space for worship.' },
        { item: 'Tasbih (Prayer Beads)', meaning: '99 beads for reciting Allah\'s names and glorifying God.' },
        { item: 'Calligraphy of Allah/Quranic Verses', meaning: 'Sacred art expressing devotion and beautifying Islamic teachings.' }
      ],
      giftingEtiquette: [
        'Eid celebrations are prime occasions for gift-giving, especially to children',
        'Gifts should be halal (permissible) - avoid alcohol, pork products, or inappropriate imagery',
        'Islamic art, prayer items, and books about Islam are appreciated',
        'Charity (Zakat) is a fundamental practice, making donations in someone\'s name meaningful'
      ],
      culturalInsights: [
        'Muslims pray five times daily facing Mecca (Salah)',
        'Halal dietary laws prohibit pork, alcohol, and improperly slaughtered meat',
        'Modesty in dress and behavior is valued, varying by cultural interpretation',
        'Friday (Jumu\'ah) is the holy day for congregational prayer',
        'Hospitality and generosity are core Islamic values'
      ]
    },
    {
      name: 'Interfaith',
      color: 'bg-purple-600',
      icon: '🌐',
      description: 'Embrace unity in diversity through interfaith understanding, celebrating shared values of compassion, peace, and respect across all traditions.',
      keyHolidays: [
        { name: 'World Interfaith Harmony Week', season: 'Winter (First week of February)', description: 'UN-recognized week promoting harmony between all religions and faiths through dialogue and understanding.' },
        { name: 'International Day of Peace', season: 'Fall (September 21)', description: 'Global observance of peace, bringing together people of all faiths for harmony.' },
        { name: 'Shared Values Days', season: 'Year-round', description: 'Various local and global initiatives celebrating common values across religions.' }
      ],
      symbolism: [
        { item: 'Interfaith Symbol (Multiple Icons)', meaning: 'Combines symbols from various religions representing unity and mutual respect.' },
        { item: 'Peace Dove', meaning: 'Universal symbol of peace transcending all faith traditions.' },
        { item: 'Rainbow', meaning: 'Represents diversity and the spectrum of spiritual paths leading to truth.' },
        { item: 'Joined Hands', meaning: 'Symbolizes cooperation, understanding, and common humanity.' }
      ],
      giftingEtiquette: [
        'Choose universal themes like peace, hope, and compassion',
        'Books on interfaith dialogue and understanding make excellent gifts',
        'Art celebrating multiple traditions or universal spirituality is appropriate',
        'Avoid items specific to one tradition unless you know the recipient\'s background',
        'Consider charitable donations to interfaith organizations'
      ],
      culturalInsights: [
        'Interfaith dialogue seeks common ground while respecting differences',
        'Golden Rule (treat others as you wish to be treated) appears in all major religions',
        'Shared values include compassion, justice, honesty, and care for creation',
        'Cultural competence involves learning about and respecting diverse practices',
        'Building bridges between communities strengthens social cohesion and peace'
      ]
    }
  ];

  useEffect(() => {
    loadGuides();
  }, [selectedTradition]);

  async function loadGuides() {
    setLoading(true);

    let query = supabase
      .from('tradition_guides')
      .select('*')
      .eq('published', true)
      .order('view_count', { ascending: false });

    if (selectedTradition !== 'all') {
      query = query.eq('tradition', selectedTradition);
    }

    const { data } = await query;

    if (data) setGuides(data);
    setLoading(false);
  }

  async function openGuide(guide: TraditionGuide) {
    setSelectedGuide(guide);

    await supabase
      .from('tradition_guides')
      .update({ view_count: guide.view_count + 1 })
      .eq('id', guide.id);

    setGuides(guides.map(g =>
      g.id === guide.id ? { ...g, view_count: g.view_count + 1 } : g
    ));
  }

  const toggleSection = (traditionName: string, section: string) => {
    const key = `${traditionName}-${section}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isSectionExpanded = (traditionName: string, section: string) => {
    return expandedSections[`${traditionName}-${section}`] || false;
  };

  return (
    <div>
      <section className="relative bg-page overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                Cultural Intelligence
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
                Explore Sacred
                <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent"> Traditions</span>
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                Your comprehensive guide to understanding religious and cultural traditions with depth, respect, and modern clarity. Discover holidays, symbolism, gifting etiquette, and cultural insights.
              </p>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">12+</div>
                  <div className="text-sm text-secondary">Traditions Covered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-secondary">Sacred Holidays</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-secondary">Respectful Content</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-surface rounded-2xl p-8 shadow-theme-2xl border-2 border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">Tradition Guides</h3>
                    <p className="text-sm text-secondary">Learn with respect and clarity</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-secondary">Holiday Insights</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Gift className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-secondary">Gifting Etiquette</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Heart className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-secondary">Cultural Symbolism</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-12">
          {/* Empty div for spacing */}
        </div>

        {/* Tradition Filter */}
      <div className="mb-10 flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedTradition('all')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            selectedTradition === 'all'
              ? 'gradient-purple-soul text-white shadow-theme-lg transform scale-105'
              : 'bg-surface text-secondary hover:bg-surface-deep border-2 border-default'
          }`}
        >
          <Users className="w-5 h-5" />
          All Traditions
        </button>
        {traditions.map((tradition) => (
          <button
            key={tradition.name}
            onClick={() => setSelectedTradition(tradition.name)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              selectedTradition === tradition.name
                ? 'gradient-purple-soul text-white shadow-theme-lg transform scale-105'
                : 'bg-surface text-secondary hover:bg-surface-deep border-2 border-default'
            }`}
          >
            <span className="text-xl">{tradition.icon}</span>
            {tradition.name}
          </button>
        ))}
      </div>

      {/* Intelligent Tradition Cards */}
      <div className="space-y-6 mb-12">
        {(selectedTradition === 'all' ? traditions : traditions.filter(t => t.name === selectedTradition)).map((tradition) => (
          <div key={tradition.name} className="bg-surface rounded-2xl shadow-theme-xl overflow-hidden border-2 border-gray-100 hover:shadow-theme-2xl transition-all">
            {/* Header */}
            <div className="gradient-purple-soul text-white p-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-5xl">{tradition.icon}</span>
                <div>
                  <h2 className="text-3xl font-bold">{tradition.name} Traditions</h2>
                  <p className="text-white/90 text-sm mt-1">Comprehensive Cultural Intelligence</p>
                </div>
              </div>
              <p className="text-white/95 text-base leading-relaxed">{tradition.description}</p>
            </div>

            {/* Expandable Sections */}
            <div className="divide-y divide-default">
              {/* Key Holidays */}
              <div className="bg-surface-elevated">
                <button
                  onClick={() => toggleSection(tradition.name, 'holidays')}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-purple-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <span className="font-bold text-lg text-primary">Key Holidays & Celebrations</span>
                    <span className="gradient-purple-soul text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {tradition.keyHolidays.length}
                    </span>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-secondary transition-transform ${isSectionExpanded(tradition.name, 'holidays') ? 'rotate-180' : ''}`} />
                </button>
                {isSectionExpanded(tradition.name, 'holidays') && (
                  <div className="px-6 pb-6 space-y-4">
                    {tradition.keyHolidays.map((holiday, idx) => (
                      <div key={idx} className="bg-surface p-5 rounded-xl shadow-theme-md border-l-4 border-purple-500">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-xl text-primary">{holiday.name}</h4>
                          <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                            {holiday.season}
                          </span>
                        </div>
                        <p className="text-secondary leading-relaxed">{holiday.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Symbolism */}
              <div className="bg-surface-elevated">
                <button
                  onClick={() => toggleSection(tradition.name, 'symbolism')}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-pink-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <span className="font-bold text-lg text-primary">Sacred Symbolism & Meanings</span>
                    <span className="gradient-purple-vibrant text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {tradition.symbolism.length}
                    </span>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-secondary transition-transform ${isSectionExpanded(tradition.name, 'symbolism') ? 'rotate-180' : ''}`} />
                </button>
                {isSectionExpanded(tradition.name, 'symbolism') && (
                  <div className="px-6 pb-6 grid md:grid-cols-2 gap-4">
                    {tradition.symbolism.map((symbol, idx) => (
                      <div key={idx} className="bg-surface p-5 rounded-xl shadow-theme-md border-l-4 border-purple-500">
                        <h4 className="font-bold text-lg text-primary mb-2">{symbol.item}</h4>
                        <p className="text-secondary text-sm leading-relaxed">{symbol.meaning}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gifting Etiquette */}
              <div className="bg-surface-elevated">
                <button
                  onClick={() => toggleSection(tradition.name, 'gifting')}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-purple-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-6 h-6 text-purple-600" />
                    <span className="font-bold text-lg text-primary">Gifting Etiquette & Traditions</span>
                    <span className="gradient-purple-deep text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {tradition.giftingEtiquette.length} tips
                    </span>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-secondary transition-transform ${isSectionExpanded(tradition.name, 'gifting') ? 'rotate-180' : ''}`} />
                </button>
                {isSectionExpanded(tradition.name, 'gifting') && (
                  <div className="px-6 pb-6">
                    <div className="bg-surface p-6 rounded-xl shadow-theme-md space-y-3">
                      {tradition.giftingEtiquette.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-1 bg-purple-100 p-1.5 rounded-full">
                            <Gift className="w-4 h-4 text-purple-600" />
                          </div>
                          <p className="text-primary leading-relaxed flex-1">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cultural Insights */}
              <div className="bg-surface-elevated">
                <button
                  onClick={() => toggleSection(tradition.name, 'insights')}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-pink-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-purple-600" />
                    <span className="font-bold text-lg text-primary">Cultural Insights & Context</span>
                    <span className="gradient-purple-soul text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {tradition.culturalInsights.length} insights
                    </span>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-secondary transition-transform ${isSectionExpanded(tradition.name, 'insights') ? 'rotate-180' : ''}`} />
                </button>
                {isSectionExpanded(tradition.name, 'insights') && (
                  <div className="px-6 pb-6">
                    <div className="bg-surface p-6 rounded-xl shadow-theme-md space-y-3">
                      {tradition.culturalInsights.map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-1 bg-purple-100 p-1.5 rounded-full">
                            <Heart className="w-4 h-4 text-purple-600" />
                          </div>
                          <p className="text-primary leading-relaxed flex-1">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Community Guides Section Header */}
      <div className="mb-8 pt-8 border-t-2 border-default">
        <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-600" />
          Community-Contributed Guides
        </h2>
        <p className="text-secondary">
          In-depth articles and guides created by our community of artisans and cultural experts
        </p>
      </div>

      {/* Community Guides Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-surface-deep rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      ) : guides.length === 0 ? (
        <div className="text-center py-16 bg-surface-elevated rounded-2xl border-2 border-dashed border-default">
          <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-secondary text-lg">No community guides available yet for this tradition</p>
          <p className="text-muted text-sm mt-2">Check back soon for expert-contributed content</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => {
            const traditionData = traditions.find(t => t.name === guide.tradition);
            return (
              <div
                key={guide.id}
                onClick={() => openGuide(guide)}
                className="bg-surface rounded-xl shadow-theme-lg overflow-hidden cursor-pointer hover:shadow-theme-2xl transition-all transform hover:-translate-y-2 border-2 border-gray-100"
              >
                <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200">
                  {guide.image_url ? (
                    <img
                      src={guide.image_url}
                      alt={guide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-muted" />
                    </div>
                  )}
                  {guide.video_url && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 shadow-theme-lg font-semibold">
                      <Video className="w-4 h-4" />
                      Video Guide
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="gradient-purple-soul text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-theme-lg flex items-center gap-2">
                      <span className="text-base">{traditionData?.icon || '📖'}</span>
                      {guide.tradition}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-3 line-clamp-2 leading-tight">
                    {guide.title}
                  </h3>

                  <p className="text-secondary text-sm line-clamp-3 mb-4 leading-relaxed">
                    {guide.content.substring(0, 150)}...
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-secondary text-sm">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">{guide.view_count.toLocaleString()}</span>
                    </div>

                    <button className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-bold text-sm group">
                      Read Guide
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-surface rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-theme-2xl">
            <div className="sticky top-0 gradient-purple-soul text-white p-6 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {traditions.find(t => t.name === selectedGuide.tradition) && (
                    <span className="text-3xl">
                      {traditions.find(t => t.name === selectedGuide.tradition)?.icon}
                    </span>
                  )}
                  <span className="inline-block bg-surface/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    {selectedGuide.tradition} Tradition
                  </span>
                </div>
                <h2 className="text-3xl font-bold">{selectedGuide.title}</h2>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="text-white hover:bg-surface/20 p-3 rounded-full transition-colors ml-4"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {selectedGuide.image_url && (
                <img
                  src={selectedGuide.image_url}
                  alt={selectedGuide.title}
                  className="w-full h-96 object-cover rounded-xl mb-8 shadow-theme-lg"
                />
              )}

              {selectedGuide.video_url && (
                <div className="mb-8">
                  <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-gray-900 shadow-theme-lg">
                    <iframe
                      src={selectedGuide.video_url}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                <div className="text-primary leading-relaxed whitespace-pre-line text-base">
                  {selectedGuide.content}
                </div>
              </div>

              <div className="mt-10 pt-6 border-t-2 border-default bg-surface-elevated -mx-8 px-8 py-6 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-secondary">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{selectedGuide.view_count.toLocaleString()} views</p>
                      <p className="text-sm text-secondary">Community members found this helpful</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-secondary">Expert-Verified Content</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
