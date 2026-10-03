'use client'

interface TierEmblemProps {
  id: string
  isSelected?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function TierEmblem({ id, isSelected = false, size = 'md' }: TierEmblemProps) {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16',
  }

  const containerSize = sizeMap[size]

  if (id === 'juz10') {
    // Juz 1-10: Junior Huffaz - Rub el Hizb with Open Holy Quran & Emerald Radiance
    return (
      <div
        className={`relative ${containerSize} rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isSelected
            ? 'bg-gradient-to-br from-emerald-500/25 to-emerald-950/60 border border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
            : 'bg-emerald-950/30 border border-emerald-500/20 group-hover:border-emerald-500/40'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 sm:w-8 sm:h-8"
        >
          {/* Subtle Octagonal Islamic Star Halo */}
          <path
            d="M24 3L29 8.5L36.5 8.5L37.5 16L43 20L40 27L43 34L37.5 38L36.5 45.5L29 45.5L24 51L19 45.5L11.5 45.5L10.5 38L5 34L8 27L5 20L10.5 16L11.5 8.5L19 8.5L24 3Z"
            fill="currentColor"
            className="text-emerald-500/10"
          />
          {/* Rub el Hizb geometric outline */}
          <rect
            x="13"
            y="13"
            width="22"
            height="22"
            rx="2"
            transform="rotate(0 24 24)"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.4"
            className="text-emerald-400"
          />
          <rect
            x="13"
            y="13"
            width="22"
            height="22"
            rx="2"
            transform="rotate(45 24 24)"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.4"
            className="text-emerald-400"
          />
          {/* Open Quran Pages */}
          <path
            d="M24 20C21.5 18 17.5 18 14 19.5V33C17.5 31.5 21.5 31.5 24 33.5C26.5 31.5 30.5 31.5 34 33V19.5C30.5 18 26.5 18 24 20Z"
            fill="url(#emeraldGrad)"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Center Spine */}
          <line x1="24" y1="20" x2="24" y2="33.5" stroke="#34d399" strokeWidth="1.5" />
          {/* Page text line accents */}
          <line x1="16.5" y1="23.5" x2="21" y2="23.5" stroke="#a7f3d0" strokeWidth="1" strokeLinecap="round" />
          <line x1="16.5" y1="26.5" x2="21" y2="26.5" stroke="#a7f3d0" strokeWidth="1" strokeLinecap="round" />
          <line x1="16.5" y1="29.5" x2="19.5" y2="29.5" stroke="#a7f3d0" strokeWidth="1" strokeLinecap="round" />

          <line x1="27" y1="23.5" x2="31.5" y2="23.5" stroke="#a7f3d0" strokeWidth="1" strokeLinecap="round" />
          <line x1="27" y1="26.5" x2="31.5" y2="26.5" stroke="#a7f3d0" strokeWidth="1" strokeLinecap="round" />
          <line x1="28.5" y1="29.5" x2="31.5" y2="29.5" stroke="#a7f3d0" strokeWidth="1" strokeLinecap="round" />

          {/* Gradients */}
          <defs>
            <linearGradient id="emeraldGrad" x1="14" y1="18" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#064e3b" stopOpacity="0.9" />
              <stop offset="1" stopColor="#022c22" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    )
  }

  if (id === 'juz20') {
    // Juz 11-20: Intermediate Tier - Islamic Mihrab Arch with Illuminated Scripture & Sapphire Radiance
    return (
      <div
        className={`relative ${containerSize} rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isSelected
            ? 'bg-gradient-to-br from-sky-500/25 to-sky-950/60 border border-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.35)]'
            : 'bg-sky-950/30 border border-sky-500/20 group-hover:border-sky-500/40'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 sm:w-8 sm:h-8"
        >
          {/* Mihrab Arch Silhouette */}
          <path
            d="M13 38V22C13 15.9249 17.9249 11 24 11C30.0751 11 35 15.9249 35 22V38H13Z"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeOpacity="0.4"
            fill="currentColor"
            className="text-sky-500/10"
          />
          {/* Inner Ogee Arch point */}
          <path
            d="M16 38V23C16 19 20 14 24 12C28 14 32 19 32 23V38"
            stroke="#0284c7"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          {/* Central Open Quran */}
          <path
            d="M24 22C21.8 20 18 20 15 21.2V34C18 32.8 21.8 32.8 24 34.5C26.2 32.8 30 32.8 33 34V21.2C30 20 26.2 20 24 22Z"
            fill="url(#skyGrad)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <line x1="24" y1="22" x2="24" y2="34.5" stroke="#7dd3fc" strokeWidth="1.5" />
          {/* Radiant Lantern / Nur Beam */}
          <circle cx="24" cy="15" r="2" fill="#38bdf8" />
          <line x1="24" y1="17" x2="24" y2="20" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />

          {/* Page text lines */}
          <line x1="17.5" y1="25" x2="21.5" y2="25" stroke="#bae6fd" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="17.5" y1="28" x2="21.5" y2="28" stroke="#bae6fd" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="26.5" y1="25" x2="30.5" y2="25" stroke="#bae6fd" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="26.5" y1="28" x2="30.5" y2="28" stroke="#bae6fd" strokeWidth="0.9" strokeLinecap="round" />

          <defs>
            <linearGradient id="skyGrad" x1="15" y1="20" x2="33" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#082f49" stopOpacity="0.95" />
              <stop offset="1" stopColor="#0c4a6e" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    )
  }

  if (id === 'juz29') {
    // Juz 21-29: Advanced Tier - Islamic Shamsah Medallion with Ornate Book & Amethyst Radiance
    return (
      <div
        className={`relative ${containerSize} rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isSelected
            ? 'bg-gradient-to-br from-purple-500/25 to-purple-950/60 border border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
            : 'bg-purple-950/30 border border-purple-500/20 group-hover:border-purple-500/40'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 sm:w-8 sm:h-8"
        >
          {/* Shamsah Medallion 12-point Petal Halo */}
          <circle
            cx="24"
            cy="24"
            r="16"
            stroke="#a855f7"
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeDasharray="3 3"
          />
          {/* Multi-point decorative rosettes */}
          <path
            d="M24 9L26.5 14L32 12L32 17.5L37.5 18L35 23.5L39 27.5L34 30L34 35.5L28.5 35L26 40L21.5 37L17 40L15.5 35L10 35L10.5 29.5L6 26.5L9.5 22.5L7.5 17.5L13 17.5L14 12L19.5 13.5L24 9Z"
            fill="currentColor"
            className="text-purple-500/10"
            stroke="#c084fc"
            strokeWidth="0.8"
            strokeOpacity="0.35"
          />

          {/* Book on Stand / Medallion Core */}
          <path
            d="M24 19C21.8 17 18 17 15 18.2V31C18 29.8 21.8 29.8 24 31.5C26.2 29.8 30 29.8 33 31V18.2C30 17 26.2 17 24 19Z"
            fill="url(#purpleGrad)"
            stroke="#c084fc"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <line x1="24" y1="19" x2="24" y2="31.5" stroke="#e9d5ff" strokeWidth="1.5" />

          {/* Ornate Ribbon Bookmark hanging out */}
          <path
            d="M24 31.5V37L22 35.5L20 37V30.5"
            fill="#a855f7"
            stroke="#c084fc"
            strokeWidth="0.8"
          />

          {/* Subtle Page text lines */}
          <line x1="17.5" y1="22.5" x2="21.5" y2="22.5" stroke="#f3e8ff" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="17.5" y1="25.5" x2="21.5" y2="25.5" stroke="#f3e8ff" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="26.5" y1="22.5" x2="30.5" y2="22.5" stroke="#f3e8ff" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="26.5" y1="25.5" x2="30.5" y2="25.5" stroke="#f3e8ff" strokeWidth="0.9" strokeLinecap="round" />

          <defs>
            <linearGradient id="purpleGrad" x1="15" y1="17" x2="33" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b0764" stopOpacity="0.95" />
              <stop offset="1" stopColor="#581c87" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    )
  }

  // juz30: Full Quran 30 Juz' - Grand Championship
  // Sacred Quran upon Ornate Wooden Rehal Stand crowned with Taj al-Waqar (Golden Crown of Quranic Dignity)
  return (
    <div
      className={`relative ${containerSize} rounded-2xl flex items-center justify-center transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-br from-[#c99335]/35 via-amber-900/50 to-black/80 border border-[#f6cb7d]/80 shadow-[0_0_25px_rgba(201,147,53,0.45)] scale-[1.04]'
          : 'bg-[#c99335]/15 border border-[#c99335]/30 group-hover:border-[#c99335]/60'
      }`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7 sm:w-8 sm:h-8"
      >
        {/* Divine Golden Halo Starburst */}
        <circle cx="24" cy="24" r="17" stroke="url(#goldHalo)" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6" />
        
        {/* Taj al-Waqar (The Crown of Quranic Dignity) Floating Above */}
        <path
          d="M17 14L19.5 9.5L24 12L28.5 9.5L31 14C31 14 28 15 24 15C20 15 17 14 17 14Z"
          fill="url(#goldCrown)"
          stroke="#f6cb7d"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        {/* Crown jewels */}
        <circle cx="19.5" cy="9.5" r="1" fill="#fde68a" />
        <circle cx="24" cy="12" r="1.2" fill="#ffffff" />
        <circle cx="28.5" cy="9.5" r="1" fill="#fde68a" />

        {/* Holy Quran Book on Rehal */}
        <path
          d="M24 19C21.5 17 17.5 17 14 18.5V30.5C17.5 29 21.5 29 24 31C26.5 29 30.5 29 34 30.5V18.5C30.5 17 26.5 17 24 19Z"
          fill="url(#goldBook)"
          stroke="#f6cb7d"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line x1="24" y1="19" x2="24" y2="31" stroke="#fef08a" strokeWidth="1.5" />

        {/* Gold Filigree page texts */}
        <line x1="16.5" y1="22" x2="21" y2="22" stroke="#fde68a" strokeWidth="1" strokeLinecap="round" />
        <line x1="16.5" y1="25" x2="21" y2="25" stroke="#fde68a" strokeWidth="1" strokeLinecap="round" />
        <line x1="16.5" y1="28" x2="19.5" y2="28" stroke="#fde68a" strokeWidth="1" strokeLinecap="round" />

        <line x1="27" y1="22" x2="31.5" y2="22" stroke="#fde68a" strokeWidth="1" strokeLinecap="round" />
        <line x1="27" y1="25" x2="31.5" y2="25" stroke="#fde68a" strokeWidth="1" strokeLinecap="round" />
        <line x1="28.5" y1="28" x2="31.5" y2="28" stroke="#fde68a" strokeWidth="1" strokeLinecap="round" />

        {/* Ornate Rehal (Wooden X-stand) Base */}
        <path
          d="M17 31L13 39M31 31L35 39"
          stroke="#c99335"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M15 35H33"
          stroke="#92400e"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <defs>
          <linearGradient id="goldHalo" x1="7" y1="7" x2="41" y2="41" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f6cb7d" />
            <stop offset="1" stopColor="#c99335" />
          </linearGradient>
          <linearGradient id="goldCrown" x1="17" y1="9.5" x2="31" y2="15" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="0.5" stopColor="#eab308" />
            <stop offset="1" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="goldBook" x1="14" y1="17" x2="34" y2="31" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3d280c" />
            <stop offset="1" stopColor="#1e1305" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
