import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  Bookmark,
  Share2,
  Clock,
  Check,
  Lightbulb,
  X,
} from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import leavesIllustration from '../../../assets/leaves.png';
import LearnFooter from './Learn/LearnFooter';

const ALL_POSTS = [
  /* --- MINDFUL LIVING (3 Articles) --- */
  {
    id: 'featured-stress-diabetes',
    category: 'Mindful Living',
    title: 'How Stress Affects Blood Sugar & Diabetes',
    description:
      'Learn how chronic stress and cortisol trigger glucose surges, with practical daily habits to calm your nervous system and restore metabolic harmony.',
    author: 'Healthline Medical',
    date: 'August 15, 2023',
    readTime: '6 min',
    image: leavesIllustration,
    isFeatured: true,
    url: 'https://www.healthline.com/health/diabetes-and-stress',
  },
  {
    id: 'grid-mindfulness-meditation',
    category: 'Mindful Living',
    title: 'Meditation for Stress & Glucose Balance',
    description:
      'Discover 12 science-backed ways daily mindfulness and quiet meditation lower inflammatory biomarkers and cortisol in diabetes.',
    author: 'Healthline Research',
    date: 'November 04, 2023',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.healthline.com/nutrition/12-benefits-of-meditation',
  },
  {
    id: 'grid-breathing-stress',
    category: 'Mindful Living',
    title: 'Box Breathing to Calm Cortisol Surges',
    description:
      'A simple 4-second breathwork technique you can use before meals or stressful moments to steady your heart rate and glucose.',
    author: 'Healthline Wellness',
    date: 'October 19, 2023',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.healthline.com/health/box-breathing',
  },

  /* --- DESI NUTRITION (3 Articles) --- */
  {
    id: 'grid-pakistani-diet',
    category: 'Desi Nutrition',
    title: 'Pakistani Diet Plan for Diabetes',
    description:
      'A practical guide to enjoying everyday desi favorites—wholewheat roti, daal, and mixed sabzi—with smart portioning and glycemic control.',
    author: 'Nayab Labs Guide',
    date: 'February 26, 2026',
    readTime: '5 min',
    image: 'https://nayablabs.com/wp-content/uploads/2026/02/Healthy-Pakistani-Food-for-Diabetics-1-e1772102372803-840x562.webp',
    url: 'https://nayablabs.com/best-pakistani-diet-plan-for-diabetic-patients/',
  },
  {
    id: 'grid-karela-herbs',
    category: 'Desi Nutrition',
    title: 'Karela & Bitter Melon: Natural Glucose Support',
    description:
      'The clinical evidence behind traditional Karela (bitter gourd), and how its natural polypeptide-p compounds support healthy blood glucose.',
    author: 'Dr. Vaid Ji Botanical',
    date: 'July 14, 2023',
    readTime: '5 min',
    image: 'https://drvaidji.com/cdn/shop/articles/Bitter_Melon_1024x1024_37ab9838-93f6-4c88-83b4-508443174b78.jpg?v=1699514225',
    url: 'https://drvaidji.com/blogs/knowledge-base/karela-bitter-gourd',
  },
  {
    id: 'grid-methi-fenugreek',
    category: 'Desi Nutrition',
    title: 'Methi Dana (Fenugreek) for Sugar Balance',
    description:
      'How soaking fenugreek seeds in water slows down carbohydrate digestion and supports everyday metabolic health in Pakistani kitchens.',
    author: 'Healthline Botanical',
    date: 'January 12, 2024',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.healthline.com/nutrition/fenugreek',
  },

  /* --- DESI LIFESTYLE (3 Articles) --- */
  {
    id: 'grid-ramadan-fasting',
    category: 'Desi Lifestyle',
    title: 'Ramadan Fasting & Roza with Diabetes',
    description:
      'Essential guidelines for safe Suhoor and Iftar meals, preventing hypoglycemia, and staying hydrated during fasting hours in Pakistani households.',
    author: 'Diabetes UK Clinical',
    date: 'March 10, 2024',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.diabetes.org.uk/guide-to-diabetes/managing-your-diabetes/ramadan',
  },
  {
    id: 'grid-sirka-acv',
    category: 'Desi Lifestyle',
    title: 'Apple Cider Vinegar (Sirka) & Glucose',
    description:
      'How taking 1-2 teaspoons of diluted raw vinegar with high-carb desi meals improves insulin sensitivity and prevents rapid spikes.',
    author: 'Fitterfly Clinical',
    date: 'August 28, 2023',
    readTime: '5 min',
    image: 'https://www.fitterfly.com/blog/wp-content/uploads/2025/05/fresh-apple-juice-close-up-shot-scaled.jpg',
    url: 'https://www.fitterfly.com/blog/apple-cider-vinegar-for-weight-loss-all-you-need-to-know/',
  },
  {
    id: 'grid-green-tea-kahwa',
    category: 'Desi Lifestyle',
    title: 'Desi Kahwa & Green Tea for Metabolism',
    description:
      'Replacing high-sugar doodh patti with antioxidant-rich green tea and Peshawari kahwa for metabolic activation and cellular health.',
    author: 'Healthline Wellness',
    date: 'April 09, 2023',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.healthline.com/nutrition/top-10-evidence-based-health-benefits-of-green-tea',
  },

  /* --- WELLNESS (3 Articles) --- */
  {
    id: 'top-herbal-teas',
    category: 'Wellness',
    title: 'Top 10 Herbal Teas for Blood Sugar',
    description:
      'Discover antioxidant-rich herbal infusions that support natural glucose stability and hydration without insulin spikes.',
    author: 'Healthline Nutrition',
    date: 'August 11, 2023',
    readTime: '4 min',
    image: 'https://brodandtaylor.com/cdn/shop/articles/dehydrated-tea-thumb_grande.jpg?v=1639765759',
    url: 'https://www.healthline.com/nutrition/tea-for-diabetics',
  },
  {
    id: 'grid-cinnamon-benefits',
    category: 'Wellness',
    title: 'Cinnamon (Daar Cheeni) for Insulin Sensitivity',
    description:
      'How adding Ceylon cinnamon to daily tea or wholewheat breakfast helps improve cellular insulin response and lower fasting numbers.',
    author: 'Healthwire Pakistan',
    date: 'May 18, 2023',
    readTime: '4 min',
    image: 'https://healthwire.pk/wp-content/uploads/2022/02/pexels-mareefe-1008747-scaled.jpg',
    url: 'https://healthwire.pk/healthcare/cinnamon-benefits-and-its-side-effects/',
  },
  {
    id: 'grid-ginger-adrak',
    category: 'Wellness',
    title: 'Ginger (Adrak) for Anti-Inflammatory Health',
    description:
      '11 proven benefits of fresh ginger root, including lowering fasting blood sugar and promoting calm digestive function.',
    author: 'Healthline Botanical',
    date: 'June 01, 2023',
    readTime: '5 min',
    image: 'https://www.vitaeinternational.com/wp-content/uploads/2015/12/benefits-of-ginger.jpg',
    url: 'https://www.healthline.com/nutrition/11-proven-benefits-of-ginger',
  },

  /* --- MOVEMENT (3 Articles) --- */
  {
    id: 'grid-yoga',
    category: 'Movement',
    title: 'Yoga for Beginners & Diabetes',
    description:
      'Gentle 15-minute morning yoga flows that stimulate muscle glucose uptake and relieve peripheral nerve tension.',
    author: 'Healthline Fitness',
    date: 'June 23, 2022',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.healthline.com/health/diabetes/yoga-for-diabetes',
  },
  {
    id: 'grid-post-meal-walk',
    category: 'Movement',
    title: 'Walking After Desi Meals (Tahlna)',
    description:
      'Why a relaxing 15-minute walk after lunch or dinner activates muscle GLUT4 receptors and flattens post-meal glucose curves.',
    author: 'Healthline Fitness',
    date: 'September 05, 2023',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.healthline.com/nutrition/walking-after-eating',
  },
  {
    id: 'grid-exercise-muscles',
    category: 'Movement',
    title: 'Daily Exercise & Muscle Glucose Uptake',
    description:
      'Top 10 evidence-based benefits of regular physical exercise for insulin sensitivity, cardiovascular strength, and brain health.',
    author: 'Healthline Fitness',
    date: 'December 10, 2023',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.healthline.com/nutrition/10-benefits-of-exercise',
  },

  /* --- RECOVERY (3 Articles) --- */
  {
    id: 'grid-sleep',
    category: 'Recovery',
    title: 'How to Sleep Through the Night: 26 Tips',
    description:
      'Practical, doctor-approved strategies to eliminate nighttime waking, optimize sleep temperature, and wake up refreshed.',
    author: 'Casper Sleep Clinical',
    date: 'February 12, 2025',
    readTime: '6 min',
    image: 'https://casper.com/cdn/shop/articles/how-to-sleep-through-the-night_thumb_c7c42494-a207-47e7-b731-edf7d1dc4762.png?v=1766761506&width=2048',
    url: 'https://casper.com/blogs/article/how-to-sleep-through-the-night',
  },
  {
    id: 'grid-sleep-hygiene',
    category: 'Recovery',
    title: '17 Science-Backed Tips for Restorative Sleep',
    description:
      'Evidence-based bedtime routines, light exposure optimization, and circadian rhythm habits to wake up with steady blood sugar.',
    author: 'Healthline Evidence',
    date: 'February 28, 2024',
    readTime: '7 min',
    image: 'https://media.post.rvohealth.io/wp-content/uploads/2020/02/sleep-sleeping-bed-732x549-thumbnail.jpg',
    url: 'https://www.healthline.com/nutrition/17-tips-to-sleep-better',
  },
  {
    id: 'grid-fall-asleep',
    category: 'Recovery',
    title: 'How to Sleep Better & Fix Sleep Cycles',
    description:
      'A GP guide on understanding the 4 sleep stages, establishing a soothing bedtime routine, and preventing chronic insomnia.',
    author: 'Livi UK Healthcare',
    date: 'March 14, 2022',
    readTime: '5 min',
    image: 'https://images.ctfassets.net/h8qzhh7m9m8u/9kmbTKUDyFtJkk3zzkAAw/3cc310fb342318e10d9b1ff46789ac26/Sleepcycle_2100x1200.png',
    url: 'https://www.livi.co.uk/your-health/how-to-sleep-better/',
  },
];

const CATEGORIES = [
  'All',
  'Desi Nutrition',
  'Desi Lifestyle',
  'Mindful Living',
  'Wellness',
  'Movement',
  'Recovery',
];

const DiabetesBlog = ({ showHeader = true }) => {
  const { t: tr } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('diabuddy_saved_articles') || '[]');
    } catch {
      return [];
    }
  });
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('diabuddy_saved_articles', JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  const toggleSave = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleShare = (e, post) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(post.url);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2200);
    }
  };

  // Filter posts based on category and search query
  const filteredPosts = ALL_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All' || post.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.category.toLowerCase().includes(q) ||
      post.author.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const isDefaultView = selectedCategory === 'All' && !searchQuery.trim();
  const featuredArticle = ALL_POSTS[0];
  const topSecondaryArticle = ALL_POSTS[1];
  const defaultGridArticles = ALL_POSTS.slice(2);

  return (
    <section
      id="blog"
      className={`px-4 sm:px-6 lg:px-10 ${
        showHeader ? 'py-10 sm:py-14 lg:py-16' : 'pt-4 pb-16'
      } relative`}
      style={{ background: 'var(--cream-soft)' }}
    >
      <div className="mx-auto w-full max-w-[1360px]">
        {/* Back Link & Header */}
        {showHeader && (
          <div className="mb-8 sm:mb-10">
            <Link
              to="/#learn"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#3D5A45] hover:text-[#1E2A24] transition-colors mb-4 group"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span>{tr('landing.learn.symptoms.backLabel') || 'Back to Learning Hub'}</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-[#3D5A45]" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#3D5A45]">
                    Wellness &amp; Health Blog
                  </span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-normal leading-[1.14] tracking-tight text-[#1E2A24]">
                  Calm guides for <br className="hidden sm:inline" />
                  <span className="italic font-medium text-[#3D5A45]">
                    daily balance &amp; well-being.
                  </span>
                </h1>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A746A]"
                />
                <input
                  type="text"
                  placeholder="Search articles, recipes, tips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-full bg-white border border-[#E7DFCE] text-xs sm:text-sm text-[#1E2A24] placeholder-[#8A847A] focus:outline-none focus:border-[#3D5A45] shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A746A] hover:text-[#1E2A24] cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-5 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2E6B3E] text-white shadow-xs'
                        : 'bg-white/80 hover:bg-[#E3EBDD] text-[#4A4339] border border-[#E7DFCE]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Weekly Desi Diabetes Spotlight Banner */}
        <div className="mb-8 rounded-[22px] sm:rounded-[26px] bg-[#FAF5E8] border border-[#E6DBC6] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#E8DCBF] text-[#7A5B18]">
              <Lightbulb size={18} />
            </span>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#7A5B18] block">
                Weekly Desi Plate Rule
              </span>
              <p className="text-xs sm:text-[13.5px] text-[#4A3D25] font-medium leading-snug">
                Eating fiber (fresh salad or sabzi) and protein (daal/chicken) 10 minutes before your roti or rice blunts post-meal glucose spikes by up to 35%.
              </p>
            </div>
          </div>

          <a
            href="https://nayablabs.com/best-pakistani-diet-plan-for-diabetic-patients/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#7A5B18] hover:text-[#4A3D25] underline underline-offset-4"
          >
            Read Diet Plan <ArrowUpRight size={13} />
          </a>
        </div>

        {/* DEFAULT HERO LAYOUT (when no active filter or search) */}
        {isDefaultView ? (
          <>
            {/* TOP ROW: Featured Card (Left) + Secondary Top Card (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Top Left: Large Featured Article Card with Botanical Leaves Artwork */}
              <a
                href={featuredArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="lg:col-span-8 rounded-[30px] sm:rounded-[38px] bg-[#F6F3EB] border-2 border-[#5B7E67]/35 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-[0_8px_30px_rgba(30,42,36,0.04)] group hover:shadow-[0_16px_40px_rgba(46,107,62,0.1)] hover:border-[#3D5A45] hover:-translate-y-1 transition-all duration-300 relative"
              >
                {/* Left Sage Artwork Container */}
                <div className="w-full md:w-[280px] lg:w-[310px] h-[220px] md:h-[250px] shrink-0 rounded-[20px] overflow-hidden">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Right Content */}
                <div className="flex flex-col justify-between flex-1 min-w-0 h-full py-1">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#2E6B3E] bg-[#E3EBDD]">
                          {featuredArticle.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7A746A]">
                          <Clock size={12} /> {featuredArticle.readTime}
                        </span>
                      </div>

                      {/* Quick Action Icons */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => toggleSave(e, featuredArticle.id)}
                          className="p-1.5 rounded-full hover:bg-black/5 text-[#7A746A] hover:text-[#2E6B3E] transition-colors"
                          title={savedIds.includes(featuredArticle.id) ? 'Saved' : 'Save article'}
                        >
                          <Bookmark
                            size={16}
                            className={savedIds.includes(featuredArticle.id) ? 'fill-[#2E6B3E] text-[#2E6B3E]' : ''}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleShare(e, featuredArticle)}
                          className="p-1.5 rounded-full hover:bg-black/5 text-[#7A746A] hover:text-[#2E6B3E] transition-colors"
                          title="Copy article link"
                        >
                          {copiedId === featuredArticle.id ? <Check size={16} className="text-[#2E6B3E]" /> : <Share2 size={16} />}
                        </button>
                      </div>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-[2.2rem] font-bold text-[#1E2A24] leading-tight mb-3 group-hover:text-[#2E6B3E] transition-colors">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-xs sm:text-sm lg:text-[14.5px] text-[#554E44] leading-relaxed line-clamp-3 mb-4">
                      {featuredArticle.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1E2A24]/10 pt-3.5 text-xs text-[#7A746A] font-medium">
                    <span>By {featuredArticle.author}</span>
                    <span className="inline-flex items-center gap-1 text-[#2E6B3E] font-bold">
                      Read article <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </a>

              {/* Top Right: Secondary Top Card */}
              <a
                href={topSecondaryArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="lg:col-span-4 rounded-[30px] sm:rounded-[38px] bg-white border-2 border-[#5B7E67]/35 p-5 sm:p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(30,42,36,0.04)] group hover:shadow-[0_16px_40px_rgba(46,107,62,0.1)] hover:border-[#3D5A45] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Top Photo */}
                <div className="w-full h-[200px] sm:h-[220px] rounded-[20px] overflow-hidden bg-[#F0EBE1]">
                  <img
                    src={topSecondaryArticle.image}
                    alt={topSecondaryArticle.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Bottom Content */}
                <div className="pt-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider text-[#2E6B3E] bg-[#E3EBDD]">
                        {topSecondaryArticle.category}
                      </span>
                      <span className="text-[11px] text-[#7A746A] font-medium inline-flex items-center gap-1">
                        <Clock size={11} /> {topSecondaryArticle.readTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1E2A24] group-hover:text-[#2E6B3E] transition-colors leading-snug">
                        {topSecondaryArticle.title}
                      </h3>
                      <ArrowUpRight size={16} className="text-[#7A746A] group-hover:text-[#2E6B3E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1E2A24]/10 pt-3 mt-4 text-xs text-[#7A746A] font-medium">
                    <span>By {topSecondaryArticle.author}</span>
                    <span>{topSecondaryArticle.date}</span>
                  </div>
                </div>
              </a>

            </div>

            {/* BOTTOM ROW: 4 Article Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {defaultGridArticles.map((post) => (
                <a
                  key={post.id}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[26px] sm:rounded-[30px] bg-white border-2 border-[#5B7E67]/35 p-4.5 shadow-[0_4px_24px_rgba(30,42,36,0.04)] group hover:shadow-[0_16px_36px_rgba(46,107,62,0.1)] hover:-translate-y-1.5 hover:border-[#3D5A45] transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo */}
                  <div className="w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-[#F0EBE1] relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/40 backdrop-blur-xs rounded-full p-1 text-white">
                      <button
                        type="button"
                        onClick={(e) => toggleSave(e, post.id)}
                        className="p-1 hover:text-[#A3D9A5] transition-colors"
                        title={savedIds.includes(post.id) ? 'Saved' : 'Save'}
                      >
                        <Bookmark
                          size={13}
                          className={savedIds.includes(post.id) ? 'fill-white text-white' : ''}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Text info */}
                  <div className="pt-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E6B3E]">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-[#7A746A] font-medium inline-flex items-center gap-1">
                          <Clock size={10} /> {post.readTime}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="font-serif text-base sm:text-[1.08rem] font-bold text-[#1E2A24] group-hover:text-[#2E6B3E] transition-colors leading-snug line-clamp-2 min-h-[44px]">
                          {post.title}
                        </h3>
                        <ArrowUpRight size={15} className="text-[#7A746A] group-hover:text-[#2E6B3E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                      </div>
                    </div>

                    <div className="mt-3.5 border-t border-[#1E2A24]/10 pt-2.5 flex items-center justify-between text-xs text-[#7A746A] font-medium">
                      <span>By {post.author}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        ) : (
          /* FILTERED OR SEARCHED GRID VIEW */
          <div>
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <a
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[28px] sm:rounded-[32px] bg-white border-2 border-[#5B7E67]/35 p-5 shadow-[0_4px_24px_rgba(30,42,36,0.04)] group hover:shadow-[0_16px_36px_rgba(46,107,62,0.1)] hover:-translate-y-1.5 hover:border-[#3D5A45] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="w-full aspect-[16/10] rounded-[22px] overflow-hidden bg-[#F0EBE1] relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs rounded-full p-1 text-white">
                        <button
                          type="button"
                          onClick={(e) => toggleSave(e, post.id)}
                          className="p-1 hover:text-[#A3D9A5] transition-colors"
                          title="Save article"
                        >
                          <Bookmark
                            size={14}
                            className={savedIds.includes(post.id) ? 'fill-white text-white' : ''}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleShare(e, post)}
                          className="p-1 hover:text-[#A3D9A5] transition-colors"
                          title="Share link"
                        >
                          {copiedId === post.id ? <Check size={14} className="text-[#A3D9A5]" /> : <Share2 size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#2E6B3E]">
                            {post.category}
                          </span>
                          <span className="text-xs text-[#7A746A] font-medium inline-flex items-center gap-1">
                            <Clock size={12} /> {post.readTime}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1E2A24] group-hover:text-[#2E6B3E] transition-colors leading-snug mb-2">
                          {post.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#5F5446] leading-relaxed line-clamp-2 mb-3">
                          {post.description}
                        </p>
                      </div>

                      <div className="border-t border-[#1E2A24]/10 pt-3 flex items-center justify-between text-xs text-[#7A746A] font-medium">
                        <span>By {post.author}</span>
                        <span className="inline-flex items-center gap-1 text-[#2E6B3E] font-bold">
                          Read article <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              /* Empty Search State */
              <div className="py-16 text-center rounded-[28px] bg-white border border-[#E7DFCE] p-8">
                <p className="text-base font-serif font-bold text-[#1E2A24] mb-2">
                  No articles found matching "{searchQuery}"
                </p>
                <p className="text-xs sm:text-sm text-[#7A746A] mb-5">
                  Try searching for a different keyword like "roti", "tea", "sleep", or select a category above.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#2E6B3E] text-white text-xs font-bold hover:bg-[#1E2A24] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Small In-Section Footer */}
        <LearnFooter className="mt-12 sm:mt-14" />

      </div>
    </section>
  );
};

export default DiabetesBlog;