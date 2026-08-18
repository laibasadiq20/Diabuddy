import React, { useState } from 'react';
import { ChevronDown, Mail, Users, MessageCircle, Sparkles } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

export default function FAQSection() {
  const { t: tr } = useI18n();
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      num: '01',
      tag: '100% Free',
      q: 'Is DiaBuddy completely free to use?',
      a: 'Yes, DiaBuddy is 100% free. You can log your daily sugar, meals, insulin doses, set medication reminders, and participate in community discussions with no hidden fees or subscriptions.',
    },
    {
      num: '02',
      tag: 'Pakistani Food',
      q: 'Does DiaBuddy support Pakistani and Desi home-cooked meals?',
      a: 'Yes! Our database is tailored for Pakistani households, featuring everyday staples like wholewheat roti, daal chana, biryani, nihari, and chai. You can easily estimate carbs and portion sizes without complicated math.',
    },
    {
      num: '03',
      tag: 'Doctor PDF',
      q: 'Can I download and share my reports with my doctor?',
      a: 'Absolutely. With a single click, you can generate a clean, printable PDF report of your 7-day or 30-day blood sugar averages, time-in-range percentage, and meal history to bring to your clinic visits.',
    },
    {
      num: '04',
      tag: 'Privacy',
      q: 'Can I ask questions in the community anonymously?',
      a: 'Yes. Your privacy is protected. Whenever you ask a question or share a health experience in the community, you can choose to post with your name or 100% anonymously.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-8 py-12 sm:py-18">
      <div className="mx-auto max-w-4xl">

        {/* Editorial Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[var(--sage-deep)]">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl lg:text-[2.25rem] text-[var(--brown)] tracking-tight leading-snug">
            Got questions?{' '}
            <span className="italic text-[var(--sage-deep)] font-medium">
              We have answers.
            </span>
          </h2>
          <p className="mt-2 text-xs sm:text-[13px] text-[var(--brown-soft)] font-medium">
            Everything you need to know about tracking, privacy, and getting started with DiaBuddy.
          </p>
        </div>

        {/* Editorial FAQ Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[var(--sage-deep)]/50 shadow-[0_10px_25px_-5px_rgba(20,35,25,0.06)]'
                    : 'bg-white/80 hover:bg-white border-[var(--line)] shadow-2xs'
                }`}
              >
                {/* Question Row */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Number Badge */}
                    <span
                      className={`font-serif text-xs sm:text-sm font-bold shrink-0 transition-colors ${
                        isOpen ? 'text-[var(--sage-deep)]' : 'text-[var(--brown-soft)]'
                      }`}
                    >
                      {faq.num}
                    </span>

                    {/* Question Title */}
                    <span className="font-serif text-base sm:text-[17px] font-bold text-[var(--brown)] truncate sm:whitespace-normal">
                      {faq.q}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Topic Pill Tag */}
                    <span className="hidden sm:inline-block rounded-full bg-[var(--cream-soft)] border border-[var(--line)] px-2.5 py-0.5 text-[9.5px] font-bold text-[var(--brown-soft)]">
                      {faq.tag}
                    </span>

                    {/* Expand/Collapse Toggle Button */}
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
                        isOpen
                          ? 'bg-[#182C1E] text-white rotate-180'
                          : 'bg-[var(--cream-soft)] text-[var(--brown-soft)] hover:bg-[#EAE5D8]'
                      }`}
                    >
                      <ChevronDown size={14} />
                    </span>
                  </div>
                </button>

                {/* Smooth Expanding Answer Body */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-[13px] leading-relaxed text-[var(--brown-soft)] font-medium animate-in fade-in duration-200">
                    <div className="border-t border-[var(--line)]/60 pt-3.5 pl-6 sm:pl-7">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actionable Support Box (Contact Admin & Community) */}
        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--cream)] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="text-left">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--brown)]">
              Still have a question?
            </h3>
            <p className="text-xs text-[var(--brown-soft)] mt-0.5 font-medium">
              Can't find the answer you're looking for? Email our support team or ask in our community.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Email Support / Admin */}
            <a
              href="mailto:hello@diabuddy.com?subject=Question%20about%20DiaBuddy"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-white/80 border border-[var(--line)] text-[var(--brown)] px-3.5 py-2.5 text-xs font-bold shadow-2xs transition-colors"
            >
              <Mail size={14} className="text-[var(--sage-deep)]" />
              <span>Email Support</span>
            </a>

            {/* Ask in Community */}
            <a
              href="/community"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#182C1E] hover:bg-[#0E1B12] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-colors"
            >
              <Users size={14} />
              <span>Ask Community</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
