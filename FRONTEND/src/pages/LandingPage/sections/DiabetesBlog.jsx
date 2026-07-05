import React from "react";
import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Leaf,
  Utensils,
  Bike,
  Cpu,
  Heart,
  Sparkles,
} from "lucide-react";

const blogsData = [
  {
    id: 1,
    category: "Clinical Education",
    title: "Understanding HbA1c: The Standard of Glucose Control",
    desc: "Learn what the HbA1c test actually measures, how it differs from daily finger-pricks, and why it is essential for checking long-term glycemic progress.",
    readTime: "6 min read",
    date: "June 24, 2026",
    icon: Leaf,
    url: "https://diabetes.org/about-diabetes/a1c",
  },
  {
    id: 2,
    category: "Diet & Nutrition",
    title: "10 Diabetic-Friendly Recipes to Avoid Sugar Spikes",
    desc: "Discover quick, high-fiber, and low-glycemic index breakfast and dinner options designed to keep your blood glucose curve perfectly flat and stable.",
    readTime: "4 min read",
    date: "June 20, 2026",
    icon: Utensils,
    url: "https://diabetesfoodhub.org/recipes",
  },
  {
    id: 3,
    category: "Exercise & Fitness",
    title: "The Magic of Post-Meal Walking on Insulin Sensitivity",
    desc: "Understand the biological science of how a simple 15-minute walk after lunch directly helps muscles absorb sugar from the blood without extra insulin.",
    readTime: "5 min read",
    date: "June 15, 2026",
    icon: Bike,
    url: "https://health.clevelandclinic.org/walking-after-eating",
  },
  {
    id: 4,
    category: "Diabetes Technology",
    title: "Continuous Glucose Monitors: How CGMs Actually Work",
    desc: "A plain-language walkthrough of the sensor, transmitter, and app that make up a CGM system, and how real-time data helps you catch highs and lows earlier.",
    readTime: "5 min read",
    date: "June 10, 2026",
    icon: Cpu,
    url: "https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring",
  },
  {
    id: 5,
    category: "Clinical Education",
    title: "Type 1 vs. Type 2 Diabetes: What Actually Sets Them Apart",
    desc: "From autoimmune origins to insulin resistance, a clear breakdown of how these two conditions differ in cause, onset, and day-to-day management.",
    readTime: "7 min read",
    date: "June 5, 2026",
    icon: BookOpen,
    url: "https://health.clevelandclinic.org/type-1-vs-type-2-diabetes",
  },
  {
    id: 6,
    category: "Mental Health & Lifestyle",
    title: "Why Stress Quietly Raises Your Blood Sugar",
    desc: "Cortisol and adrenaline don't just affect your mood — they push glucose straight into your bloodstream. Learn practical stress-management techniques to keep your levels stable.",
    readTime: "4 min read",
    date: "May 30, 2026",
    icon: Heart,
    url: "https://diatribe.org/lifestyle/stress-and-diabetes-how-manage",
  },
];

const BlogArtwork = ({ category }) => {
  if (category === "Clinical Education") {
    return (
      <div className="w-full h-full bg-[var(--sage-tint)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <path
              d="M0 100 L70 100 L100 60 L130 140 L160 40 L190 100 L400 100"
              stroke="var(--sage-deep)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="70" cy="100" r="8" fill="var(--sage-deep)" />
            <circle cx="190" cy="100" r="8" fill="var(--sage-deep)" />
          </svg>
        </div>
        <div className="relative z-10">
          <Leaf className="w-20 h-20 text-[var(--sage-deep)] opacity-90" />
        </div>
      </div>
    );
  }

  if (category === "Diet & Nutrition") {
    return (
      <div className="w-full h-full bg-[var(--cream-soft)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="200" cy="100" r="70" fill="var(--butter)" opacity="0.5" />
            <circle cx="200" cy="100" r="45" fill="var(--butter)" opacity="0.3" />
            <circle cx="200" cy="100" r="20" fill="var(--butter)" opacity="0.2" />
          </svg>
        </div>
        <div className="relative z-10">
          <Utensils className="w-20 h-20 text-[var(--olive)] opacity-90" />
        </div>
      </div>
    );
  }

  if (category === "Exercise & Fitness") {
    return (
      <div className="w-full h-full bg-[var(--sage-soft)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <path
              d="M0 170 L80 110 L150 160 L250 70 L400 170"
              fill="none"
              stroke="var(--sage)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M50 170 L130 110 L200 160 L300 70 L400 170"
              fill="none"
              stroke="var(--sage-light)"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="relative z-10">
          <Bike className="w-20 h-20 text-[var(--sage-deep)] opacity-90" />
        </div>
      </div>
    );
  }

  if (category === "Diabetes Technology") {
    return (
      <div className="w-full h-full bg-[var(--cream)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <circle cx="100" cy="100" r="30" fill="var(--brown-soft)" opacity="0.3" />
            <circle cx="200" cy="100" r="30" fill="var(--brown-soft)" opacity="0.3" />
            <circle cx="300" cy="100" r="30" fill="var(--brown-soft)" opacity="0.3" />
            <line x1="130" y1="100" x2="170" y2="100" stroke="var(--brown-soft)" strokeWidth="4" />
            <line x1="230" y1="100" x2="270" y2="100" stroke="var(--brown-soft)" strokeWidth="4" />
            <rect x="90" y="90" width="20" height="20" fill="var(--brown-soft)" opacity="0.2" rx="2" />
            <rect x="190" y="90" width="20" height="20" fill="var(--brown-soft)" opacity="0.2" rx="2" />
            <rect x="290" y="90" width="20" height="20" fill="var(--brown-soft)" opacity="0.2" rx="2" />
          </svg>
        </div>
        <div className="relative z-10">
          <Cpu className="w-20 h-20 text-[var(--brown-soft)] opacity-90" />
        </div>
      </div>
    );
  }

  if (category === "Mental Health & Lifestyle") {
    return (
      <div className="w-full h-full bg-[var(--sage-tint)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <path
              d="M0 120 C80 80 140 160 220 120 C300 80 340 140 400 100"
              stroke="var(--pink)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M0 150 C100 110 180 190 260 150 C320 120 360 160 400 130"
              stroke="var(--pink)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="100" cy="130" r="4" fill="var(--pink)" />
            <circle cx="300" cy="115" r="4" fill="var(--pink)" />
          </svg>
        </div>
        <div className="relative z-10">
          <Heart className="w-20 h-20 text-[var(--rust)] opacity-90" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[var(--sage-tint)] flex items-center justify-center">
      <Sparkles className="w-20 h-20 text-[var(--sage-deep)] opacity-90" />
    </div>
  );
};

const DiabetesBlog = ({ showHeader = true }) => {
  return (
    <section
      id="blog"
      className={`px-6 ${
        showHeader ? "py-20 sm:py-24" : "pt-8 pb-20"
      } relative`}
      style={{
        background: 'linear-gradient(135deg, #E8E0D6 0%, #D5CCC0 30%, #C5BAAE 60%, #B8ADA0 100%)',
      }}
    >
      {/* Darker background overlay for depth */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      
      <div className="container relative z-10">
        {showHeader && (
          <header className="mx-auto mb-16 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-[var(--sage-deep)] border border-black/10">
              <BookOpen className="w-4 h-4" />
              Education Portal
            </div>
            <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-[var(--brown)] font-display">
              Latest Diabetes Resource Blog
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--brown-soft)] max-w-2xl mx-auto">
              Stay informed with research-backed guides, nutritional recipes,
              and lifestyle counseling prepared by certified health coaches.
            </p>
          </header>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogsData.map((blog, index) => {
            const IconComponent = blog.icon;
            return (
              <article
                key={blog.id}
                className="group flex flex-col overflow-hidden rounded-2xl border-2 border-black/20 bg-white/95 backdrop-blur-sm shadow-xl transition-all duration-400 hover:-translate-y-3 hover:shadow-2xl"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="relative h-56 overflow-hidden">
                  <span
                    className={`absolute left-4 top-4 z-10 rounded-full bg-white/95 backdrop-blur-sm px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--brown)] shadow-md border border-black/10`}
                  >
                    {blog.category}
                  </span>
                  <div className="h-full w-full transition-transform duration-500 group-hover:scale-110">
                    <BlogArtwork category={blog.category} />
                  </div>
                  {/* Darker overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-[var(--ink-soft)]">
                    <span className="flex items-center gap-1.5 bg-[var(--sage-tint)]/80 px-3 py-1 rounded-full border border-black/10">
                      <Calendar size={14} />
                      {blog.date}
                    </span>
                    <span className="flex items-center gap-1.5 bg-[var(--sage-tint)]/80 px-3 py-1 rounded-full border border-black/10">
                      <Clock size={14} />
                      {blog.readTime}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-[var(--brown)] transition-colors group-hover:text-[var(--sage-deep)] font-display leading-tight">
                    {blog.title}
                  </h3>

                  <p className="mb-6 flex-1 text-[var(--ink-soft)] leading-relaxed">
                    {blog.desc}
                  </p>

                  <div className="border-t-2 border-black/15 pt-5">
                    <a
                      href={blog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-semibold text-[var(--brown)] transition-all hover:text-[var(--sage-deep)] group/link"
                    >
                      <span>Read Article</span>
                      <ArrowRight 
                        size={16} 
                        className="transition-transform duration-300 group-hover/link:translate-x-1" 
                      />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DiabetesBlog;