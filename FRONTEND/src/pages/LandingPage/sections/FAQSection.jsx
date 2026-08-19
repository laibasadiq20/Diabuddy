import React, { useState } from 'react';
import {
  ChevronRight,
  Plus,
  X,
  Mail,
  Users,
  HelpCircle,
  ShieldCheck,
  Utensils,
  FileText,
} from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

export default function FAQSection() {
  const { t: tr } = useI18n();
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIndex, setOpenIndex] = useState(0);

  const categories = [
    {
      id: 'general',
      name: 'General & Pricing',
      icon: HelpCircle,
      faqs: [
        {
          q: 'Is DiaBuddy free to use?',
          a: 'DiaBuddy is currently free to use during its early access period. Core features — daily logging, health reports, medication reminders, and community discussions — are available to all users at no cost.',
        },
        {
          q: 'Do I still need to keep handwritten paper diaries?',
          a: 'No. DiaBuddy replaces paper logbooks completely. Your blood sugar readings, meals, insulin doses, and reminders are saved digitally so you can access them anywhere on your phone.',
        },
        {
          q: 'How do I get started with DiaBuddy?',
          a: 'Getting started takes less than 30 seconds. Just sign up with your email, set your preferred glucose units (mg/dL or mmol/L), and you can immediately start logging your first reading.',
        },
        {
          q: 'Can family members or caregivers help manage a patient’s logs?',
          a: 'Yes! Many members log readings for their parents or relatives. You can easily record doses, track meals, and download PDF summaries to share with doctors during visits.',
        },
      ],
    },
    {
      id: 'food-logging',
      name: 'Food & Daily Logging',
      icon: Utensils,
      faqs: [
        {
          q: 'Does DiaBuddy support Pakistani and Desi home-cooked meals?',
          a: 'Yes. The app is built specifically with Pakistani households in mind. You can log everyday staples like wholewheat roti, daal chana, biryani, nihari, and chai, and get practical carb estimates without complicated math.',
        },
        {
          q: 'Can I track both fasting and after-meal blood sugar?',
          a: 'Yes. You can easily record fasting readings, before-meal checks, and post-meal glucose logs with clear indicators showing if you are in your target range.',
        },
        {
          q: 'How does DiaBuddy estimate carbs in desi recipes?',
          a: 'Our built-in food database has pre-calculated carb and nutrition breakdowns for common Pakistani dishes, helping you log standard portion sizes (e.g. 1 roti, 1 bowl of daal) in seconds.',
        },
        {
          q: 'Can I log insulin doses alongside my meals?',
          a: 'Yes. You can track basal (long-acting) and bolus (mealtime) insulin units right when you log your meals to keep a complete record for your doctor.',
        },
      ],
    },
    {
      id: 'reports',
      name: 'Doctor Reports & PDF',
      icon: FileText,
      faqs: [
        {
          q: 'Can I download and share my reports with my doctor?',
          a: 'Yes. You can generate a clean, printable PDF summary of your blood sugar averages, time-in-range percentage, and meal history — ready to bring to your next clinic visit with a single tap.',
        },
        {
          q: 'What information is included in the doctor report?',
          a: 'The PDF summary includes your 7-day or 30-day glucose curve, average readings, time in target range percentage, and logged meals in a clean layout designed for quick doctor review.',
        },
        {
          q: 'Can I share my report directly via WhatsApp or Email?',
          a: 'Yes. Once downloaded, the PDF report is formatted for mobile sharing. You can easily send it to your doctor, diabetes educator, or family via WhatsApp or email.',
        },
        {
          q: 'How far back can I generate health reports for?',
          a: 'You can generate reports for the last 7 days, 14 days, 30 days, or custom date ranges to match your routine clinic checkup schedule.',
        },
      ],
    },
    {
      id: 'privacy',
      name: 'Privacy & Community',
      icon: ShieldCheck,
      faqs: [
        {
          q: 'Is my health data private, and who can see my logs?',
          a: 'Only you can see your personal health logs, glucose readings, and medications. Your data is private by design and stored securely. We never sell your health information to advertisers or third parties, and your personal logs are never visible to other community members.',
        },
        {
          q: 'Can I ask questions in the community anonymously?',
          a: 'Yes. Whenever you post a question or share a health experience in the community, you can choose to post with your name or completely anonymously. Your privacy is always in your hands.',
        },
        {
          q: 'Who moderates the community discussions?',
          a: 'Community topic spaces are moderated to ensure conversations remain respectful, supportive, and focused on peer encouragement. Unsolicited medical claims or spam are promptly removed.',
        },
        {
          q: 'Can I connect with other people with similar diabetes types?',
          a: 'Yes. We have dedicated topic channels for Type 1, Type 2, Pakistani pantry recipes, and daily wellness habits so you can easily find relevant conversations.',
        },
      ],
    },
  ];

  const handleCategoryChange = (idx) => {
    setActiveCategory(idx);
    setOpenIndex(0); // Open first question of newly selected category
  };

  const toggleQuestion = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  const currentFaqs = categories[activeCategory]?.faqs || [];

  return (
    <section
      id="faq"
      className="w-full px-4 sm:px-6 lg:px-10 py-16 sm:py-24"
      style={{
        background: 'linear-gradient(180deg, var(--cream-soft) 0%, rgba(216, 226, 220, 0.38) 50%, var(--cream-soft) 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-[var(--sage-deep)]">
            HELP &amp; ANSWERS
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-[2.65rem] text-[var(--brown)] tracking-tight leading-tight">
            Got questions?{' '}
            <span className="italic text-[var(--sage-deep)] font-medium">
              We got answers.
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-[15px] text-[var(--brown-soft)] font-medium leading-relaxed">
            Everything you need to know about logging, doctor reports, privacy, and getting started.
          </p>
        </div>

        {/* 2-Column FAQ Layout (Category Tabs on Left + Accordion on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* LEFT: Category Selector Tabs (4 cols) */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const isActive = activeCategory === idx;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(idx)}
                  className={`w-full text-left rounded-2xl p-4 sm:p-4.5 transition-all duration-200 border flex items-center justify-between gap-3 cursor-pointer shrink-0 sm:shrink ${
                    isActive
                      ? 'bg-white border-[var(--sage-deep)]/50 shadow-sm translate-x-0 lg:translate-x-1'
                      : 'bg-white/70 hover:bg-white border-[var(--line)] text-[var(--brown-soft)] hover:text-[var(--brown)] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                        isActive
                          ? 'bg-[#182C1E] text-white'
                          : 'bg-[var(--cream-soft)] text-[var(--brown-soft)]'
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <div>
                      <span className={`text-sm font-bold block leading-tight ${isActive ? 'text-[var(--brown)]' : 'text-[var(--brown-soft)]'}`}>
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-[var(--brown-soft)] font-normal">
                        {cat.faqs.length} questions
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className={`shrink-0 transition-transform ${
                      isActive ? 'text-[var(--sage-deep)] translate-x-0.5' : 'text-transparent lg:text-[var(--line)]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* RIGHT: Questions & Answers Accordion (8 cols) */}
          <div className="lg:col-span-8 space-y-3.5">
            {currentFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-[var(--sage-deep)]/40 shadow-sm'
                      : 'bg-white/85 hover:bg-white border-[var(--line)] shadow-2xs'
                  }`}
                >
                  {/* Question Header */}
                  <button
                    type="button"
                    onClick={() => toggleQuestion(index)}
                    className="w-full text-left p-5 sm:p-5.5 flex items-center justify-between gap-4 cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif text-base sm:text-lg font-bold text-[var(--brown)] flex-1 leading-snug">
                      {faq.q}
                    </span>

                    {/* Plus / Close Icon */}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                        isOpen
                          ? 'bg-[#182C1E] text-white rotate-90'
                          : 'bg-[var(--cream-soft)] text-[var(--brown-soft)] hover:bg-[#EAE5D8]'
                      }`}
                    >
                      {isOpen ? <X size={15} /> : <Plus size={16} />}
                    </span>
                  </button>

                  {/* Answer Content */}
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-sm sm:text-[14.5px] leading-relaxed text-[var(--brown-soft)] font-medium animate-in fade-in duration-200">
                      <div className="border-t border-[var(--line)]/60 pt-4">
                        {faq.a}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom Support Card */}
        <div className="mt-12 sm:mt-14 rounded-3xl border border-[var(--line)] bg-white/90 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xs">
          <div className="text-left">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--brown)]">
              Still have a question?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--brown-soft)] mt-1 font-medium">
              Can't find what you're looking for? Email our team or join our community discussions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="mailto:hello@diabuddy.com?subject=Question%20about%20DiaBuddy"
              className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-white/80 border border-[var(--line)] text-[var(--brown)] px-4 py-2.5 text-xs sm:text-sm font-bold shadow-2xs transition-colors"
            >
              <Mail size={15} className="text-[var(--sage-deep)]" />
              <span>Email Support</span>
            </a>

            <a
              href="/community"
              className="inline-flex items-center gap-2 rounded-xl bg-[#182C1E] hover:bg-[#0E1B12] text-white px-4.5 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <Users size={15} />
              <span>Ask Community</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
