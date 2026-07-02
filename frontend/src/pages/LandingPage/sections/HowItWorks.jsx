import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Track your day',
    description:
      'Log glucose readings, meals, medication, sleep, and activity in just a few taps.',
  },
  {
    number: '02',
    title: 'Understand patterns',
    description:
      'DiaBuddy helps you notice trends and understand what influences your numbers.',
  },
  {
    number: '03',
    title: 'Learn with confidence',
    description:
      'Explore reliable articles, practical guides, and evidence-based advice written in plain language.',
  },
  {
    number: '04',
    title: 'Find your community',
    description:
      'Connect with people who understand the journey and share experiences without judgment.',
  },
];

const HowItWorks = () => {
  return (
    <section  id="about" className="relative overflow-hidden bg-[#1E2A24] px-6 py-20">

      {/* Background glows */}
      <div className="absolute top-0 left-0 h-80 w-80 rounded-full bg-[var(--sage)]/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[var(--sand)]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">

        {/* Heading */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--sage)]">
            — How it works
          </p>

          <h2 className="font-serif text-4xl leading-[1.05] text-white md:text-6xl">
            Diabetes care,
            <br />
            made a little
            <span className="italic text-[var(--sand)]"> gentler.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/65">
            No overwhelming dashboards. No complicated setup. Just a simple rhythm that fits naturally into everyday life.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">

          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-white/10 lg:block" />

          {/* reduced spacing here */}
          <div className="space-y-8">

            {steps.map((step, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={step.number}
                  className={`grid items-center gap-6 lg:grid-cols-2 ${
                    !isLeft ? 'lg:text-right' : ''
                  }`}
                >

                  <div className={`${isLeft ? '' : 'lg:order-2'}`}>

                    <div className="relative">

                      <span className="font-serif text-[4rem] leading-none text-white/8 md:text-[4.5rem]">
                        {step.number}
                      </span>

                      <div className="-mt-5">

                        <h3 className="font-serif text-3xl text-white md:text-4xl leading-tight">
                          {step.title}
                        </h3>

                        <p className="mt-2 max-w-md text-base leading-relaxed text-white/65">
                          {step.description}
                        </p>

                      </div>
                    </div>
                  </div>

                  <div className={`${isLeft ? 'lg:order-2' : ''}`} />
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;