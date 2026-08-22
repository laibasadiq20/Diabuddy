import React, { useRef, useState } from 'react';
import { Bell, Menu, Droplets, Utensils, Activity } from 'lucide-react';

export default function PhoneMockup({ userName = 'Laiba' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rx: 0, ry: 0, glareX: 50, glareY: 50 });
  const phoneRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    const ry = normX * 9.5;
    const rx = -normY * 9.5;

    const glareX = Math.round((x / rect.width) * 100);
    const glareY = Math.round((y / rect.height) * 100);

    setMousePos({ x: normX, y: normY, rx, ry, glareX, glareY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0, rx: 0, ry: 0, glareX: 50, glareY: 50 });
  };

  return (
    <div className="relative hidden items-center justify-center lg:flex">
      {/* 3D Perspective Wrapper */}
      <div
        ref={phoneRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="
          relative
          z-20
          flex
          items-center
          justify-center
          pointer-events-auto
          cursor-pointer
          -translate-x-5
          lg:-translate-x-8
          xl:-translate-x-12
          lg:-mt-16
          lg:-mb-12
          xl:-mt-20
          xl:-mb-14
        "
        style={{ perspective: '1200px' }}
      >
        {/* Ambient Dynamic Backlight Glow */}
        <div
          className="
            pointer-events-none
            absolute
            -inset-10
            -z-10
            rounded-full
            bg-gradient-to-tr
            from-[#3D5A45]/35
            via-[#BDCAA1]/20
            to-[#EBDCC7]/30
            blur-[36px]
            transition-all
            duration-500
          "
          style={
            isHovered
              ? {
                  transform: `translate3d(${mousePos.x * 16}px, ${mousePos.y * 16}px, 0) scale(1.15)`,
                  opacity: 0.95,
                }
              : { opacity: 0.6 }
          }
        />

        {/* Phone Body with 3D Tilt */}
        <div
          className={`
            relative
            w-[215px]
            sm:w-[230px]
            lg:w-[245px]
            transition-transform
            ${
              isHovered
                ? 'duration-150 ease-out'
                : 'duration-700 ease-out animate-phone-float-slender'
            }
          `}
          style={
            isHovered
              ? {
                  transform: `rotateX(${mousePos.rx}deg) rotateY(${mousePos.ry}deg) rotateZ(5.5deg) scale3d(1.04, 1.04, 1.04) translateY(-8px)`,
                  transformStyle: 'preserve-3d',
                }
              : { transformStyle: 'preserve-3d' }
          }
        >
          {/* Champagne gold outer frame */}
          <div
            className="
              rounded-[38px]
              bg-gradient-to-b
              from-[#EBDCC7]
              via-[#D5C0A3]
              to-[#B39371]
              p-[3px]
              shadow-[0_28px_60px_-10px_rgba(15,28,20,0.48)]
            "
          >
            {/* Black OLED bezel */}
            <div className="relative rounded-[35px] bg-[#121214] p-[5px] overflow-hidden">
              {/* Dynamic Specular Glass Glare Overlay */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  z-30
                  overflow-hidden
                  rounded-[30px]
                "
                style={{
                  background: isHovered
                    ? `radial-gradient(circle at ${mousePos.glareX}% ${mousePos.glareY}%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.12) 35%, rgba(255,255,255,0) 68%)`
                    : 'none',
                  mixBlendMode: 'overlay',
                  transition: 'background 0.1s ease-out',
                }}
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    -inset-full
                    h-[260%]
                    w-[260%]
                    bg-gradient-to-b
                    from-transparent
                    via-white/20
                    to-transparent
                    animate-glass-sweep
                  "
                />
              </div>

              {/* Screen Content */}
              <div
                className="
                  relative
                  flex
                  min-h-[420px]
                  w-full
                  flex-col
                  overflow-hidden
                  rounded-[30px]
                  bg-[#FAF7F2]
                  p-3.5
                  text-[#2E2923]
                  shadow-inner
                "
              >
                {/* Status Bar */}
                <div className="mb-2 flex items-center justify-between px-1 text-[10px] font-semibold text-[#665E54]">
                  <span>9:41</span>
                  <div className="mx-auto h-3 w-16 rounded-full bg-[#1C1C1E]" />
                  <span>100%</span>
                </div>

                {/* Header */}
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-[#7D7569]">Welcome back,</p>
                    <h4 className="font-serif text-sm font-bold text-[#1E2A24]">{userName}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F0E6] text-[#3D5A45]">
                      <Bell size={12} />
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F0E6] text-[#3D5A45]">
                      <Menu size={12} />
                    </span>
                  </div>
                </div>

                {/* Target Pill */}
                <div className="mb-2.5 rounded-xl border border-[#BDCAA1] bg-[#E8F0E6] p-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#3D5A45]">TODAY'S TARGET</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#2E6B3E]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2E6B3E] animate-pulse" />
                      In Range
                    </span>
                  </div>
                  <p className="mt-1 font-serif text-lg font-bold text-[#1E2A24]">
                    114 <span className="text-[10px] font-normal text-[#5E564A]">mg/dL</span>
                  </p>
                </div>

                {/* Quick Log Cards */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="rounded-lg border border-[#E3DACE] bg-white p-2 text-left">
                    <div className="flex items-center gap-1 text-[#3D5A45]">
                      <Droplets size={11} />
                      <span className="text-[9px] font-bold">Glucose</span>
                    </div>
                    <p className="mt-1 text-[11px] font-bold text-[#1E2A24]">108 mg/dL</p>
                    <p className="text-[8px] text-[#7D7569]">Fasting · 8:00 AM</p>
                  </div>

                  <div className="rounded-lg border border-[#E3DACE] bg-white p-2 text-left">
                    <div className="flex items-center gap-1 text-[#D97706]">
                      <Utensils size={11} />
                      <span className="text-[9px] font-bold">Breakfast</span>
                    </div>
                    <p className="mt-1 text-[11px] font-bold text-[#1E2A24]">35g Carbs</p>
                    <p className="text-[8px] text-[#7D7569]">Oats & Berries</p>
                  </div>
                </div>

                {/* Peer Post Snippet */}
                <div className="mt-2 rounded-xl border border-[#DEC4BF] bg-[#F9F0EE] p-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#9E453A]">COMMUNITY FEED</span>
                    <span className="text-[8px] text-[#8C534B]">2m ago</span>
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-[#1E2A24]">
                    "Any tips for managing post-dinner spikes?"
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[8px] font-medium text-[#7D7569]">
                    <Activity size={9} />
                    <span>14 helpful replies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
