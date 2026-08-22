import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { ArrowRight, ArrowLeft, Info, Activity, Leaf, ChevronDown, ShieldCheck } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import LearnFooter from './Learn/LearnFooter';
import symptomsIllustration from '../../../assets/symptoms.png';
import nextStepIllustration from '../../../assets/next step.png';

const SYMPTOM_IDS = ['thirst', 'urination', 'fatigue', 'vision', 'weightLoss', 'healing'];

const symptomMeta = [
  { id: 'thirst', accent: 'text-[var(--sage-deep)]', stat: '01' },
  { id: 'urination', accent: 'text-[var(--rust)]', stat: '02' },
  { id: 'fatigue', accent: 'text-[var(--olive)]', stat: '03' },
  { id: 'vision', accent: 'text-[var(--sage-deep)]', stat: '04' },
  { id: 'weightLoss', accent: 'text-[var(--butter)]', stat: '05' },
  { id: 'healing', accent: 'text-[var(--rust)]', stat: '06' },
];

const warningLevelMeta = [
  { id: 'urgent', accent: 'text-[var(--rust)]', itemKeys: ['item1', 'item2', 'item3', 'item4'] },
  { id: 'watch', accent: 'text-[var(--sage)]', itemKeys: ['item1', 'item2', 'item3'] },
];

const Symptoms = ({
  showHeader = true,
  eyebrow,
  showNavbar = true,
  backTo = '/',
  backLabel,
}) => {
  const { t: tr } = useI18n();
  const [activeLevel, setActiveLevel] = useState(0);
  const [mobileActiveLevel, setMobileActiveLevel] = useState(null);
  const [expandedSymptom, setExpandedSymptom] = useState(null);
  const activeMeta = warningLevelMeta[activeLevel];
  const activeLevelData = tr(`landing.learn.symptoms.levels.${activeMeta.id}`);

  const toggleSymptom = (id) => {
    setExpandedSymptom((prev) => (prev === id ? null : id));
  };

  const resolvedEyebrow = eyebrow ?? tr('landing.learn.symptoms.eyebrow');
  const resolvedBackLabel = backLabel ?? tr('landing.learn.symptoms.backLabel');

  return (
    <>
      {showNavbar && <Navbar />}

      <section
        className="dbx-symptoms min-h-screen bg-[#F6F3EE] relative overflow-hidden pb-0 font-sans text-[var(--brown)]"
      >
        <div
          className="relative mx-auto w-full max-w-[1360px] pt-20 sm:pt-24 lg:pt-28 px-4 sm:px-6 lg:px-8"
        >
          {showHeader && (
            <header className="dbx-fade-item mb-8 sm:mb-12">
              {/* MOBILE VIEW (< sm): Clean, high-contrast, fully readable hero card */}
              <div className="block sm:hidden relative overflow-hidden rounded-[22px] border border-[#C5D5BF] bg-gradient-to-br from-[#EBF1E6] via-[#E4EDE0] to-[#DFE9DA] p-5 shadow-xs">
                <div
                  className="pointer-events-none absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#2E6B3E]/10 blur-xl"
                  aria-hidden="true"
                />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-0.5 w-5 bg-[#2E6B3E]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2E6B3E]">
                      Early Awareness
                    </span>
                  </div>

                  <h1 className="font-serif text-[26px] font-bold text-[#1E2A24] leading-tight tracking-tight">
                    Warning Signs
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#2E6B3E] italic">
                    Recognize the early signs. Act early, stay healthy.
                  </p>

                  <p className="mt-2.5 text-[13.5px] font-semibold text-[#4A4135] leading-relaxed">
                    Awareness is the first step to prevention. Look out for these common warning signs and take care of yourself.
                  </p>

                  {/* Medical Attention Alert Pill */}
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#FAF8F3]/95 border border-[#CCD8C4] p-3 text-[12px] font-bold text-[#24422E] leading-snug shadow-2xs">
                    <ShieldCheck size={16} className="text-[#2E6B3E] shrink-0 mt-0.5" />
                    <span>
                      If you experience any severe symptoms, seek medical attention immediately.
                    </span>
                  </div>
                </div>
              </div>

              {/* TABLET & DESKTOP VIEW (sm+): Wide Banner Graphic */}
              <div className="hidden sm:block relative w-full overflow-hidden rounded-[32px] lg:rounded-[36px] shadow-xs border border-[#C9BDA8]/40">
                <img
                  src={symptomsIllustration}
                  alt="Warning Signs & Symptoms Banner"
                  className="w-full h-auto object-cover object-center block rounded-[32px] lg:rounded-[36px]"
                />
              </div>
            </header>
          )}

          {/* SYMPTOM LIST */}
          <div className="mb-28">
            {/* Centered Title with Leaf Divider */}
            <div className="mb-10 sm:mb-12 flex flex-col items-center justify-center text-center">
              <h2 className="m-0 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2E6B3E]">
                {tr('landing.learn.symptoms.signalsHeading') || 'Common Signals'}
              </h2>
              
              {/* Leaf Divider Icon */}
              <div className="mt-2.5 flex items-center gap-3 text-[#2E6B3E]/60">
                <span className="h-[1.5px] w-12 sm:w-16 bg-[#2E6B3E]/35" />
                <Leaf size={15} className="text-[#2E6B3E]" />
                <span className="h-[1.5px] w-12 sm:w-16 bg-[#2E6B3E]/35" />
              </div>
            </div>

            <ul className="grid gap-0 border-t border-[var(--line)] md:border-t-0">
              {symptomMeta.map((s, idx) => {
                const isExpanded = expandedSymptom === s.id;
                const tag = tr(`landing.learn.symptoms.items.${s.id}.tag`);
                const title = tr(`landing.learn.symptoms.items.${s.id}.title`);
                const description = tr(`landing.learn.symptoms.items.${s.id}.description`);

                return (
                  <li
                    key={s.id}
                    className={`dbx-symptom-row dbx-fade-item border-b border-[var(--line)] transition-colors duration-200 ${
                      isExpanded ? 'bg-[#F2ECE0]/60 rounded-xl md:rounded-none md:bg-transparent' : ''
                    }`}
                    style={{ animationDelay: `${100 + idx * 80}ms` }}
                  >
                    {/* MOBILE VIEW (< md): Compact count + name that expands subtitle on click */}
                    <div className="block md:hidden">
                      <button
                        type="button"
                        onClick={() => toggleSymptom(s.id)}
                        className="flex w-full cursor-pointer items-center justify-between py-3.5 px-2 text-left bg-transparent border-0 outline-none select-none transition-colors"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <span
                            className={`font-serif text-[18px] font-semibold italic shrink-0 w-6 ${s.accent}`}
                          >
                            {s.stat}
                          </span>
                          <span className="font-serif text-[17px] font-bold text-[var(--brown)] truncate">
                            {title}
                          </span>
                        </div>
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                            isExpanded
                              ? 'rotate-180 bg-[#2E6B3E]/15 text-[#2E6B3E]'
                              : 'bg-black/[0.04] text-[var(--ink-faint)]'
                          }`}
                        >
                          <ChevronDown size={16} />
                        </div>
                      </button>

                      {/* Expandable Subtitle & Details */}
                      {isExpanded && (
                        <div className="px-2 pb-4 pt-1 pl-9 [animation:fadeSlide_200ms_ease_both]">
                          {tag && (
                            <span className="inline-block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2E6B3E] bg-[#E7EFE5] px-2 py-0.5 rounded-sm mb-1.5">
                              {tag}
                            </span>
                          )}
                          <p className="m-0 text-[14px] font-medium leading-relaxed text-[var(--brown-soft)]">
                            {description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* DESKTOP VIEW (md+): Full 3-column layout */}
                    <div className="hidden md:grid md:grid-cols-12 md:items-start md:gap-6 md:py-8">
                      <div className="md:col-span-1">
                        <span
                          className={`font-serif text-[20px] font-semibold italic md:text-[22px] ${s.accent}`}
                        >
                          {s.stat}
                        </span>
                      </div>

                      <div className="md:col-span-5">
                        <div className="mb-1.5 font-sans text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                          {tag}
                        </div>
                        <h3 className="m-0 font-serif text-[22px] font-bold tracking-[-0.02em] text-[var(--brown)] md:text-[26px]">
                          {title}
                        </h3>
                      </div>

                      <div className="md:col-span-6">
                        <p className="m-0 max-w-[52ch] font-sans text-base font-semibold leading-relaxed text-[var(--brown-soft)]">
                          {description}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RESPONSE GUIDE */}
          <div className="mb-28">
            {/* MOBILE VIEW (< md): Compact interactive accordion */}
            <div className="block md:hidden">
              <div className="mb-6">
                <div className="mb-3 inline-flex items-center gap-2 font-sans text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--sage-deep)]">
                  <Info size={14} strokeWidth={2.5} />
                  {tr('landing.learn.symptoms.guideKicker')}
                </div>
                <h2 className="m-0 mb-3 font-serif text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.02em] text-[var(--brown)]">
                  {tr('landing.learn.symptoms.guideHeading')}
                </h2>
                <p className="m-0 font-sans text-sm font-semibold leading-relaxed text-[var(--brown-soft)]">
                  {tr('landing.learn.symptoms.guideLead')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {warningLevelMeta.map((lvl, i) => {
                  const isExpanded = mobileActiveLevel === i;
                  const levelData = tr(`landing.learn.symptoms.levels.${lvl.id}`);

                  return (
                    <div
                      key={lvl.id}
                      className={`rounded-2xl border border-[var(--line)] transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? 'bg-[#F2ECE0]/70 shadow-xs'
                          : 'bg-[var(--cream-soft,#F6F3EE)]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setMobileActiveLevel((prev) => (prev === i ? null : i))
                        }
                        className="flex w-full cursor-pointer items-center justify-between p-4 text-left bg-transparent border-0 outline-none select-none"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <span
                            className={`font-serif text-[18px] font-semibold italic shrink-0 w-6 ${lvl.accent}`}
                          >
                            0{i + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="font-serif text-[17px] font-bold text-[var(--brown)] block truncate">
                              {levelData.level}
                            </span>
                            <span className="font-sans text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                              {levelData.short}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                            isExpanded
                              ? 'rotate-180 bg-[#2E6B3E]/15 text-[#2E6B3E]'
                              : 'bg-black/[0.04] text-[var(--ink-faint)]'
                          }`}
                        >
                          <ChevronDown size={16} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-5 pt-1 border-t border-[var(--line)]/60 [animation:fadeSlide_200ms_ease_both]">
                          <p className="mt-2 mb-3 font-sans text-[14px] font-semibold leading-relaxed text-[var(--brown-soft)]">
                            {levelData.description}
                          </p>

                          <ul className="grid gap-2 mb-4">
                            {lvl.itemKeys.map((itemKey) => (
                              <li
                                key={itemKey}
                                className="flex items-start gap-2.5 font-sans text-[13.5px] font-medium text-[var(--brown)]"
                              >
                                <span className={`font-extrabold shrink-0 ${lvl.accent}`}>
                                  —
                                </span>
                                <span>{levelData.items[itemKey]}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="pt-3 border-t border-[var(--line)]/60 flex flex-col gap-2">
                            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                              {tr('landing.learn.symptoms.disclaimer')}
                            </span>
                            <Link
                              to="/learn/risk-assessment"
                              className={`inline-flex items-center gap-1.5 font-sans text-xs font-bold no-underline ${lvl.accent}`}
                            >
                              {tr('landing.learn.symptoms.takeAssessment')}
                              <ArrowRight size={14} strokeWidth={2.5} />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DESKTOP VIEW (md+): Side-by-side 2-column layout */}
            <div className="hidden md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5">
                <div className="mb-5 inline-flex items-center gap-2 font-sans text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--sage-deep)]">
                  <Info size={14} strokeWidth={2.5} />
                  {tr('landing.learn.symptoms.guideKicker')}
                </div>
                <h2 className="m-0 mb-[18px] font-serif text-[clamp(34px,4.4vw,52px)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--brown)]">
                  {tr('landing.learn.symptoms.guideHeading')}
                </h2>
                <p className="mb-8 max-w-[42ch] font-sans text-base font-semibold leading-relaxed text-[var(--brown-soft)]">
                  {tr('landing.learn.symptoms.guideLead')}
                </p>

                <ul className="mt-2">
                  {warningLevelMeta.map((lvl, i) => {
                    const isActive = activeLevel === i;
                    const levelData = tr(`landing.learn.symptoms.levels.${lvl.id}`);
                    return (
                      <li key={lvl.id}>
                        <button
                          onClick={() => setActiveLevel(i)}
                          className={`dbx-level-btn group flex w-full cursor-pointer items-center justify-between border-b border-[var(--line)] bg-transparent py-4 text-left font-serif text-[22px] font-bold tracking-[-0.015em] transition-transform duration-200 ease-out hover:translate-x-1 ${
                            isActive ? lvl.accent : 'text-[var(--brown)]'
                          }`}
                        >
                          <span className="inline-flex items-center gap-4">
                            <span
                              className={`font-sans text-xs font-extrabold tracking-[0.2em] ${
                                isActive ? lvl.accent : 'text-[var(--ink-faint)]'
                              }`}
                            >
                              0{i + 1}
                            </span>
                            <span>{levelData.level}</span>
                          </span>
                          <ArrowRight
                            size={18}
                            strokeWidth={2.5}
                            className={`transition-all duration-200 ease-out ${
                              isActive
                                ? 'translate-x-1 opacity-100'
                                : 'translate-x-0 opacity-40'
                            }`}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="md:col-span-7">
                <div
                  key={activeLevel}
                  className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--cream-soft)] p-8 [animation:fadeSlide_320ms_ease_both] md:p-10"
                >
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-1.5 font-sans text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                        {tr('landing.learn.symptoms.levelLabelTemplate').replace('{n}', activeLevel + 1)} {activeLevelData.short}
                      </div>
                      <h3 className="m-0 font-serif text-[26px] font-bold tracking-[-0.02em] text-[var(--brown)] md:text-[30px]">
                        {activeLevelData.level}
                      </h3>
                      <p className="m-0 mt-2 max-w-[46ch] font-sans text-[15px] font-semibold leading-snug text-[var(--brown-soft)]">
                        {activeLevelData.description}
                      </p>
                    </div>
                    <span
                      className={`font-serif text-[36px] font-semibold italic leading-none md:text-[44px] ${activeMeta.accent}`}
                    >
                      0{activeLevel + 1}
                    </span>
                  </div>

                  <ul className="grid gap-3">
                    {activeMeta.itemKeys.map((itemKey, i) => (
                      <li
                        key={itemKey}
                        className="dbx-fade-item flex items-start gap-3 border-t border-[var(--line)] py-2 font-sans text-base font-semibold text-[var(--brown)]"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <span className={`font-extrabold ${activeMeta.accent}`}>
                          —
                        </span>
                        {activeLevelData.items[itemKey]}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
                    <span className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                      {tr('landing.learn.symptoms.disclaimer')}
                    </span>
                    <Link
                      to="/learn/risk-assessment"
                      className={`dbx-text-link inline-flex items-center gap-2 font-sans text-sm font-bold no-underline transition-transform duration-200 ease-out hover:translate-x-1 ${activeMeta.accent}`}
                    >
                      {tr('landing.learn.symptoms.takeAssessment')}
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NEXT STEP Banner */}
          <div className="dbx-fade-item my-8 sm:my-12 relative w-full max-w-[1360px] mx-auto overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[36px]">
            <Link
              to="/learn/risk-assessment"
              className="group block relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[36px] cursor-pointer"
            >
              <img
                src={nextStepIllustration}
                alt="Next Step — Risk Assessment Banner"
                className="w-full h-auto block rounded-[24px] sm:rounded-[32px] lg:rounded-[36px] transition-transform duration-300 group-hover:scale-[1.008]"
              />
              
              {/* Compact CTA Button positioned cleanly in the bottom-right corner */}
              <div className="absolute right-[3%] bottom-[5%] sm:right-[4%] sm:bottom-[6%] lg:right-[5%] lg:bottom-[7%] z-10">
                <span
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#182C1E] group-hover:bg-[#27392E] text-white px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 text-[11px] sm:text-xs lg:text-sm font-bold shadow-md group-hover:shadow-lg transition-all duration-200"
                >
                  <span>{tr('landing.learn.symptoms.ctaButton') || 'Take Assessment'}</span>
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>

        <LearnFooter className="mt-14" />

        <style>{`
          /* Darker, deeper palette scoped to this page only */
          .dbx-symptoms {
            --sage: #5C7A4E;
            --sage-deep: #2F4527;
            --sage-tint: #DCE7CC;
            --sage-soft: #CBDCB3;
            --olive: #4C5A26;
            --butter: #B98F3A;
            --rust: #8C4324;
            --pink: #A85C6B;
            --brown: #2A2117;
            --brown-soft: #46392A;
            --cream: #F3EEE2;
            --cream-soft: #E9E2D2;
            --ink: #2A2117;
            --ink-soft: #52493A;
            --ink-faint: #8A806E;
            --line: rgba(42, 33, 23, 0.18);
          }

          @keyframes fadeSlide {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          @keyframes iconPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.12); }
          }

          .dbx-fade-item {
            animation: fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .dbx-symptom-row {
            transition: transform 260ms ease, background 260ms ease;
          }
          @media (hover: hover) and (pointer: fine) {
            .dbx-symptom-row:hover {
              transform: translateX(8px);
              background: var(--sage-tint);
            }
          }

          .dbx-cta-grain {
            background-image:
              radial-gradient(rgba(243, 238, 226, 0.55) 0.6px, transparent 0.6px);
            background-size: 3px 3px;
          }
        `}</style>
      </section>
    </>
  );
};

export default Symptoms;
