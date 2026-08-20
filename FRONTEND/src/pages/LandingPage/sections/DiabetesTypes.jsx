import React from 'react';
import { Link } from 'react-router-dom';
import {
  Droplet,
  Activity,
  HeartPulse,
  AlertCircle,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Heart,
  Sprout,
} from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import learnIllustration from '../../../assets/learn.png';
import type2Illustration from '../../../assets/type2.png';

const getArcValue = (stat) => {
  if (stat === '1 in 3') return 33;
  if (stat === '5–10%') return 8;
  if (stat === '90–95%') return 92;
  if (stat === '2–10%') return 6;
  return 50;
};

const STAT_LABEL_KEYS = {
  '1 in 3': 'landing.learn.diabetesTypes.statOneInThree',
};

const ITEMS = [
  {
    id: 'type1',
    num: '01',
    badge: '• AUTOIMMUNE',
    name: 'Type 1',
    tag: 'The body stops making insulin.',
    desc: 'An immune response halts insulin production. Lifelong insulin support is essential.',
    stat: '5–10%',
    Icon: Droplet,
    color: '#2F6A4F',
    badgeBg: '#E9EFE6',
    badgeColor: '#3D6346',
    link: 'https://en.wikipedia.org/wiki/Type_1_diabetes',
  },
  {
    id: 'type2',
    num: '02',
    badge: '• MOST COMMON',
    name: 'Type 2',
    tag: 'Insulin works — just not well enough.',
    desc: 'The body resists insulin. Often managed through lifestyle, food, and medication.',
    stat: '90–95%',
    Icon: Activity,
    color: '#4E6B3E',
    badgeBg: '#EFF3E8',
    badgeColor: '#4E6B3E',
    link: 'https://en.wikipedia.org/wiki/Type_2_diabetes',
  },
  {
    id: 'gestational',
    num: '03',
    badge: '• PREGNANCY',
    name: 'Gestational',
    tag: 'Glucose shifts during pregnancy.',
    desc: 'Appears during pregnancy and usually resolves after birth, but worth watching.',
    stat: '2–10%',
    Icon: HeartPulse,
    color: '#2F6A4F',
    badgeBg: '#E9EFE6',
    badgeColor: '#3D6346',
    link: 'https://en.wikipedia.org/wiki/Gestational_diabetes',
  },
  {
    id: 'prediabetes',
    num: '04',
    badge: '• EARLY SIGNAL',
    name: 'Prediabetes',
    tag: 'Higher than normal — not yet diabetes.',
    desc: 'A reversible window. Small daily shifts can quietly turn the trend around.',
    stat: '1 in 3',
    Icon: AlertCircle,
    color: '#556B2F',
    badgeBg: '#EFF3E8',
    badgeColor: '#556B2F',
    link: 'https://en.wikipedia.org/wiki/Prediabetes',
  },
];

const WHY_IT_MATTERS = [
  {
    id: 'awareness',
    Icon: ShieldCheck,
    title: 'Early Awareness',
    desc: 'Spot changes sooner and take charge of your health.',
    iconColor: '#2F6A4F',
    iconBg: '#E8F0E4',
  },
  {
    id: 'care',
    Icon: Heart,
    title: 'Better Daily Care',
    desc: 'Follow the right steps for the right type.',
    iconColor: '#4E6B3E',
    iconBg: '#EFF3E8',
  },
  {
    id: 'future',
    Icon: Sprout,
    title: 'Healthier Future',
    desc: 'Make choices today for a stronger tomorrow.',
    iconColor: '#2F6A4F',
    iconBg: '#E8F0E4',
  },
];

const DiabetesTypes = ({ showHeader = true }) => {
  const { t: tr } = useI18n();

  return (
    <section
      id="types"
      className={`font-sans px-4 sm:px-6 lg:px-10 ${
        showHeader ? 'pt-8 sm:pt-12 pb-20 sm:pb-28' : 'pt-6 pb-20'
      } relative overflow-hidden`}
      style={{ background: 'var(--cream-soft, #F6F3EE)' }}
    >
      <div className="mx-auto w-full max-w-[1360px]">

        {/* =========================================================================
            SECTION 1: HERO HEADER
            FIX: grid is always 2 cols (even on mobile) so img stays beside text
        ========================================================================== */}
        {showHeader && (
          <header className="mb-12 sm:mb-16 grid grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-12 items-center">
            {/* Left: Text */}
            <div className="col-span-1 lg:col-span-7">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="h-0.5 w-5 sm:w-6 bg-[#3D5A45]" />
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#3D5A45]">
                  {tr('landing.learn.diabetesTypes.eyebrow') || 'KNOW THE TYPES'}
                </span>
              </div>

              <h1 className="font-serif text-xl sm:text-4xl lg:text-[3.25rem] font-bold text-[#1E2A24] leading-[1.12] tracking-tight">
                {tr('landing.learn.diabetesTypes.headingStart') || 'Four types of diabetes,'}{' '}
                <br className="hidden sm:inline" />
                <em className="italic font-medium text-[#2F6A4F]">
                  {tr('landing.learn.diabetesTypes.headingEmphasis') || 'gently explained.'}
                </em>
              </h1>

              <p className="mt-3 sm:mt-5 text-xs sm:text-base text-[#554D43] leading-relaxed font-normal hidden sm:block">
                {tr('landing.learn.diabetesTypes.subtitle') ||
                  "Each type begins differently and asks for different care. Here's a calm, side-by-side look — no jargon, no alarm."}
              </p>
            </div>

            {/* Right: type2.png — always beside text */}
            <div className="col-span-1 lg:col-span-5 flex justify-center lg:justify-end">
              <img
                src={type2Illustration}
                alt="Diabetes types visual representation"
                className="w-full max-w-[160px] sm:max-w-[320px] lg:max-w-[420px] h-auto object-contain select-none pointer-events-none"
              />
            </div>

            {/* Subtitle shown below on mobile only */}
            <p className="col-span-2 sm:hidden text-xs text-[#554D43] leading-relaxed font-normal -mt-4">
              {tr('landing.learn.diabetesTypes.subtitle') ||
                "Each type begins differently and asks for different care. Here's a calm, side-by-side look — no jargon, no alarm."}
            </p>
          </header>
        )}

        {/* =========================================================================
            SECTION 2: 4 DIABETES TYPES CARDS GRID
        ========================================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 sm:gap-6">
          {ITEMS.map((it) => {
            const arcValue = getArcValue(it.stat);
            const chip = tr(`landing.learn.diabetesTypes.items.${it.id}.chip`) || it.badge;
            const name = tr(`landing.learn.diabetesTypes.items.${it.id}.name`) || it.name;
            const tag = tr(`landing.learn.diabetesTypes.items.${it.id}.tag`) || it.tag;
            const desc = tr(`landing.learn.diabetesTypes.items.${it.id}.desc`) || it.desc;

            return (
              <article
                key={it.id}
                className="group rounded-[20px] sm:rounded-[32px] border border-[#2F6A4F]/40 bg-white p-4 sm:p-7 shadow-[0_4px_24px_rgba(30,42,36,0.03)] hover:shadow-[0_16px_36px_rgba(46,107,62,0.08)] hover:border-[#2F6A4F] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-serif text-xs sm:text-sm font-semibold text-[#6B6458]">
                      {it.num}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] sm:text-[10.5px] font-bold uppercase tracking-[0.1em]"
                      style={{ background: it.badgeBg, color: it.badgeColor }}
                    >
                      <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full shrink-0" style={{ background: it.badgeColor }} />
                      {chip}
                    </span>
                  </div>

                  <div
                    className="mt-4 sm:mt-6 mb-3 sm:mb-5 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl transition-transform duration-300 group-hover:scale-105"
                    style={{ background: `${it.color}15`, color: it.color }}
                  >
                    <it.Icon size={18} strokeWidth={2} className="sm:hidden" />
                    <it.Icon size={22} strokeWidth={2} className="hidden sm:block" />
                  </div>

                  <h2 className="font-serif text-base sm:text-[1.65rem] font-bold text-[#1E2A24] leading-tight">
                    {name}
                  </h2>
                  <p className="mt-1 text-[10px] sm:text-[13px] font-semibold text-[#3D6346] leading-snug">
                    {tag}
                  </p>
                  <p className="mt-2 sm:mt-3 text-[10px] sm:text-[13.5px] text-[#554D43] leading-relaxed font-normal">
                    {desc}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 border-t border-dashed border-[#DDD5C5] pt-3 sm:pt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2.5">
                    <svg className="h-7 w-7 sm:h-[34px] sm:w-[34px] -rotate-90 shrink-0" viewBox="0 0 32 32" aria-hidden="true">
                      <circle cx="16" cy="16" r="13" fill="none" stroke="#EAE4D6" strokeWidth="2.8" />
                      <circle
                        cx="16" cy="16" r="13"
                        fill="none"
                        stroke={it.color}
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeDasharray="81.68"
                        strokeDashoffset={81.68 - (81.68 * arcValue) / 100}
                        className="transition-[stroke-dashoffset] duration-1000"
                      />
                    </svg>
                    <div>
                      <span className="block font-serif text-xs sm:text-sm font-bold text-[#1E2A24] leading-none">
                        {STAT_LABEL_KEYS[it.stat] ? tr(STAT_LABEL_KEYS[it.stat], it.stat) : it.stat}
                      </span>
                      <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-[#7A746B]">
                        {tr('landing.learn.diabetesTypes.prevalenceLabel') || 'Prevalence'}
                      </span>
                    </div>
                  </div>

                  <a
                    href={it.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-bold transition-all duration-200"
                    style={{ color: it.color }}
                  >
                    <span className="hidden sm:inline">{tr('landing.learn.diabetesTypes.learnLink') || 'Learn more'}</span>
                    <span className="sm:hidden">More</span>
                    <ArrowUpRight size={12} className="sm:hidden transition-transform" />
                    <ArrowUpRight size={14} className="hidden sm:block transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* =========================================================================
            SECTION 3: BANNER — learn.png as full background, text on right
        ========================================================================== */}
        <div
          className="my-8 sm:my-14 rounded-[20px] sm:rounded-[32px] overflow-hidden shadow-sm relative"
          style={{
            backgroundImage: `url(${learnIllustration})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '260px',
          }}
        >
          {/* subtle right-side overlay so text is readable */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, transparent 30%, rgba(240,237,228,0.85) 55%, rgba(240,237,228,0.95) 100%)',
            }}
            aria-hidden="true"
          />

          {/* Text floats on the right open space */}
          <div className="relative z-10 flex items-center justify-end h-full min-h-[260px] px-8 sm:px-14 lg:px-20 py-10">
            <div className="max-w-[52%] sm:max-w-[46%]">
              <h2 className="font-serif text-xl sm:text-2xl lg:text-[2.1rem] font-bold text-[#1E2A24] leading-[1.2] tracking-tight">
                Understanding the type
                <br />
                <em className="italic font-semibold text-[#2F6A4F]">
                  helps you care better.
                </em>
              </h2>

              <p className="mt-3 text-xs sm:text-[13.5px] text-[#554D43] leading-relaxed font-normal">
                Knowing the type of diabetes is the first step towards smarter choices and healthier tomorrows.
              </p>

              <div className="mt-4 sm:mt-5">
                <Link
                  to="/learn/risk-assessment"
                  className="inline-flex items-center gap-2 rounded-full bg-[#182C1E] hover:bg-[#27392E] text-white px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  <span>Explore Diabetes Basics</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: WHY IT MATTERS
        ========================================================================== */}
        <section className="mt-6 sm:mt-10">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <span className="h-px w-6 sm:w-8 bg-[#8B9D8B]" />
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.24em] text-[#3D5A45]">
                WHY IT MATTERS
              </span>
              <span className="h-px w-6 sm:w-8 bg-[#8B9D8B]" />
            </div>

            <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#1E2A24] tracking-tight text-center">
              Small knowledge.{' '}
              <span className="italic font-medium text-[#2F6A4F]">
                Big difference.
              </span>
            </h2>

            <p className="mt-2 sm:mt-3 text-[10px] sm:text-sm text-[#554D43] leading-relaxed text-center">
              Understanding diabetes types helps you and your loved ones make informed, confident decisions.
            </p>
          </div>

          {/* Always 3 cols */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {WHY_IT_MATTERS.map((card) => (
              <div
                key={card.id}
                className="rounded-[16px] sm:rounded-[30px] border border-[#E6DFD2] bg-white p-4 sm:p-8 text-center flex flex-col items-center shadow-[0_4px_20px_rgba(30,42,36,0.02)] hover:shadow-[0_12px_30px_rgba(46,107,62,0.06)] hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full mb-3 sm:mb-4"
                  style={{ background: card.iconBg, color: card.iconColor }}
                >
                  <card.Icon size={18} strokeWidth={2} className="sm:hidden" />
                  <card.Icon size={24} strokeWidth={2} className="hidden sm:block" />
                </div>

                <h3 className="font-serif text-xs sm:text-xl font-bold text-[#1E2A24] leading-snug">
                  {card.title}
                </h3>

                <p className="mt-1 sm:mt-2 text-[9px] sm:text-[13.5px] text-[#554D43] leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </section>
  );
};

export default DiabetesTypes;

