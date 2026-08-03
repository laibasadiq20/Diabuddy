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
import { useI18n } from "../../../i18n/I18nContext";

const blogsData = [
  {
    id: 1,
    postKey: "hba1c",
    categoryKey: "clinicalEducation",
    readTimeMinutes: 6,
    date: "2026-06-24",
    icon: Leaf,
    url: "https://diabetes.org/about-diabetes/a1c",
  },
  {
    id: 2,
    postKey: "recipes",
    categoryKey: "dietNutrition",
    readTimeMinutes: 4,
    date: "2026-06-20",
    icon: Utensils,
    url: "https://diabetesfoodhub.org/recipes",
  },
  {
    id: 3,
    postKey: "walking",
    categoryKey: "exerciseFitness",
    readTimeMinutes: 5,
    date: "2026-06-15",
    icon: Bike,
    url: "https://health.clevelandclinic.org/walking-after-eating",
  },
  {
    id: 4,
    postKey: "cgm",
    categoryKey: "diabetesTechnology",
    readTimeMinutes: 5,
    date: "2026-06-10",
    icon: Cpu,
    url: "https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring",
  },
  {
    id: 5,
    postKey: "type1vs2",
    categoryKey: "clinicalEducation",
    readTimeMinutes: 7,
    date: "2026-06-05",
    icon: BookOpen,
    url: "https://health.clevelandclinic.org/type-1-vs-type-2-diabetes",
  },
  {
    id: 6,
    postKey: "stress",
    categoryKey: "mentalHealthLifestyle",
    readTimeMinutes: 4,
    date: "2026-05-30",
    icon: Heart,
    url: "https://diatribe.org/lifestyle/stress-and-diabetes-how-manage",
  },
];

const BlogArtwork = ({ categoryKey }) => {
  if (categoryKey === "clinicalEducation") {
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

  if (categoryKey === "dietNutrition") {
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

  if (categoryKey === "exerciseFitness") {
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

  if (categoryKey === "diabetesTechnology") {
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

  if (categoryKey === "mentalHealthLifestyle") {
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

function formatBlogDate(isoDate, lang) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(lang === 'ur' ? 'ur-PK-u-nu-latn' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const DiabetesBlog = ({ showHeader = true }) => {
  const { t: tr, lang } = useI18n();

  return (
    <section
      id="blog"
      className={`px-6 ${
        showHeader ? "py-20 sm:py-24" : "pt-8 pb-20"
      } relative`}
      style={{ background: 'var(--cream-soft)' }}
    >
      <div className="container relative z-10">
        {showHeader && (
          <header className="mb-14 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
              {tr('landing.learn.blog.kicker')}
            </p>
            <h2 className="mt-3 font-display text-4xl font-light leading-[1.1] text-[var(--brown)] sm:text-5xl">
              {tr('landing.learn.blog.headingStart')}{' '}
              <span className="italic text-[var(--sage-deep)]">{tr('landing.learn.blog.headingEmphasis')}</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--brown-soft)]">
              {tr('landing.learn.blog.lead')}
            </p>
          </header>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogsData.map((blog) => {
            const category = tr(`landing.learn.blog.categories.${blog.categoryKey}`);
            const title = tr(`landing.learn.blog.posts.${blog.postKey}.title`);
            const desc = tr(`landing.learn.blog.posts.${blog.postKey}.desc`);
            const readTime = tr('landing.learn.blog.readTimeTemplate').replace('{n}', blog.readTimeMinutes);
            return (
              <article
                key={blog.id}
                className="group flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--brown)]/20 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[var(--sage-deep)]/40 hover:shadow-[0_18px_40px_-24px_rgba(58,46,36,0.35)]"
              >
                <div className="relative h-44 overflow-hidden">
                  <span className="absolute left-4 top-4 z-10 rounded-full border border-[var(--line)] bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--brown)]">
                    {category}
                  </span>
                  <div className="h-full w-full">
                    <BlogArtwork categoryKey={blog.categoryKey} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-soft)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} />
                      {formatBlogDate(blog.date, lang)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={13} />
                      {readTime}
                    </span>
                  </div>

                  <h3 className="mb-2 font-display text-lg font-semibold leading-snug text-[var(--brown)] transition-colors group-hover:text-[var(--sage-deep)]">
                    {title}
                  </h3>

                  <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--ink-soft)]">
                    {desc}
                  </p>

                  <a
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--sage-deep)] transition-all group-hover:gap-3"
                  >
                    {tr('landing.learn.blog.readArticle')}
                    <ArrowRight size={15} />
                  </a>
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