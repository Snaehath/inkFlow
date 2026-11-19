import React from 'react';

export type ArtTheme = 
  | 'coastal-lighthouse' 
  | 'forest-cabin' 
  | 'hilltop-observatory' 
  | 'windmills-meadow' 
  | 'city-street-cafe' 
  | 'cozy-desk-lamp' 
  | 'dark-castle'
  | 'books-quill'
  | 'auto';

interface ProceduralArtProps {
  theme?: ArtTheme;
  seedText?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'wide';
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const ProceduralArt: React.FC<ProceduralArtProps> = ({
  theme = 'auto',
  seedText = 'inkflow',
  className = 'w-full h-full',
}) => {
  // Determine theme from title / seed text if set to auto
  let resolvedTheme = theme;
  if (resolvedTheme === 'auto') {
    const text = seedText.toLowerCase();
    if (text.includes('glass') || text.includes('orchard') || text.includes('coast') || text.includes('sea')) {
      resolvedTheme = 'coastal-lighthouse';
    } else if (text.includes('city') || text.includes('letters') || text.includes('prague')) {
      resolvedTheme = 'forest-cabin';
    } else if (text.includes('rain') || text.includes('quiet') || text.includes('night') || text.includes('sky')) {
      resolvedTheme = 'hilltop-observatory';
    } else if (text.includes('wandering') || text.includes('songs') || text.includes('valley') || text.includes('wind')) {
      resolvedTheme = 'windmills-meadow';
    } else if (text.includes('notes') || text.includes('craft') || text.includes('blog')) {
      resolvedTheme = 'city-street-cafe';
    } else if (text.includes('email') || text.includes('draft') || text.includes('letter')) {
      resolvedTheme = 'cozy-desk-lamp';
    } else if (text.includes('castle') || text.includes('shadow') || text.includes('black') || text.includes('dark')) {
      resolvedTheme = 'dark-castle';
    } else {
      const themes: ArtTheme[] = [
        'coastal-lighthouse', 
        'forest-cabin', 
        'hilltop-observatory', 
        'windmills-meadow', 
        'city-street-cafe', 
        'cozy-desk-lamp'
      ];
      resolvedTheme = themes[hashString(seedText) % themes.length];
    }
  }

  // 1. Coastal Lighthouse (The Glass Orchard)
  if (resolvedTheme === 'coastal-lighthouse') {
    return (
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky-lh" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4B89F" />
            <stop offset="40%" stopColor="#D9CEB8" />
            <stop offset="70%" stopColor="#8DA3A6" />
            <stop offset="100%" stopColor="#4A6572" />
          </linearGradient>
          <linearGradient id="sea-lh" x1="0" y1="140" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3E5866" />
            <stop offset="100%" stopColor="#25353D" />
          </linearGradient>
          <linearGradient id="cliff-lh" x1="180" y1="120" x2="400" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#556B4E" />
            <stop offset="45%" stopColor="#3A4D35" />
            <stop offset="100%" stopColor="#1E281C" />
          </linearGradient>
        </defs>
        {/* Sky */}
        <rect width="400" height="240" fill="url(#sky-lh)" />
        {/* Distant soft sun / fog glow */}
        <circle cx="160" cy="90" r="45" fill="#FFF2DB" opacity="0.45" />
        {/* Ocean */}
        <path d="M0 135 Q 120 132 250 142 T 400 148 L 400 240 L 0 240 Z" fill="url(#sea-lh)" />
        <path d="M0 150 Q 80 147 180 152 T 320 158" stroke="#A9C0C4" strokeWidth="1" opacity="0.4" fill="none" />
        <path d="M0 168 Q 110 164 210 170 T 360 174" stroke="#A9C0C4" strokeWidth="1" opacity="0.3" fill="none" />
        {/* Cliff Island */}
        <path d="M190 240 C 205 180 230 140 270 120 C 310 100 350 115 400 130 L 400 240 Z" fill="url(#cliff-lh)" />
        {/* Secondary cliff ledge */}
        <path d="M225 240 C 240 195 260 170 300 155 C 330 145 365 155 400 165 L 400 240 Z" fill="#2E3C2B" opacity="0.75" />
        {/* Lighthouse */}
        <path d="M280 122 L 284 65 L 292 65 L 296 122 Z" fill="#E8E2D5" />
        <rect x="282" y="60" width="12" height="6" rx="1" fill="#C77B5B" />
        {/* Lantern glass */}
        <rect x="284" y="52" width="8" height="8" rx="1" fill="#FFF9E6" />
        <path d="M281 52 L 288 44 L 295 52 Z" fill="#4A4740" />
        {/* Lighthouse beacon beam */}
        <polygon points="288,56 0,80 0,105" fill="#FFEAA7" opacity="0.18" />
        {/* Small Cottage beside lighthouse */}
        <rect x="302" y="112" width="22" height="13" fill="#D5CDBC" />
        <polygon points="300,112 313,103 326,112" fill="#8C5843" />
        {/* Birds */}
        <path d="M120 70 Q 125 65 130 70 Q 135 65 140 70" stroke="#4F4B43" strokeWidth="1.2" fill="none" />
        <path d="M150 82 Q 154 78 158 82 Q 162 78 166 82" stroke="#4F4B43" strokeWidth="1.2" fill="none" />
      </svg>
    );
  }

  // 2. Forest Cabin (City Letters / Wilderness)
  if (resolvedTheme === 'forest-cabin') {
    return (
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky-fc" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A614A" />
            <stop offset="50%" stopColor="#7E9671" />
            <stop offset="100%" stopColor="#D5DFC9" />
          </linearGradient>
          <linearGradient id="ground-fc" x1="0" y1="140" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4B5E3C" />
            <stop offset="100%" stopColor="#25331E" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#sky-fc)" />
        {/* Forest background trees */}
        <path d="M20 180 L 40 80 L 60 180 Z" fill="#3D5235" opacity="0.8" />
        <path d="M50 180 L 75 70 L 100 180 Z" fill="#2E4028" opacity="0.85" />
        <path d="M300 180 L 325 65 L 350 180 Z" fill="#2E4028" opacity="0.85" />
        <path d="M335 180 L 360 85 L 385 180 Z" fill="#3D5235" opacity="0.8" />
        {/* Ground */}
        <path d="M0 160 Q 200 145 400 160 L 400 240 L 0 240 Z" fill="url(#ground-fc)" />
        {/* Cottage */}
        <rect x="150" y="125" width="95" height="55" fill="#69513F" rx="2" />
        {/* Roof */}
        <polygon points="135,128 197,85 260,128" fill="#3E2E23" />
        {/* Chimney with soft smoke */}
        <rect x="225" y="80" width="12" height="25" fill="#544336" />
        <path d="M231 75 Q 235 60 228 50 T 235 30" stroke="#FFF" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" fill="none" />
        {/* Glowing window */}
        <rect x="165" y="140" width="22" height="20" rx="2" fill="#FFE599" />
        <line x1="176" y1="140" x2="176" y2="160" stroke="#3E2E23" strokeWidth="1.5" />
        <line x1="165" y1="150" x2="187" y2="150" stroke="#3E2E23" strokeWidth="1.5" />
        {/* Door */}
        <rect x="202" y="145" width="18" height="35" rx="1" fill="#3B2C21" />
      </svg>
    );
  }

  // 3. Hilltop Observatory (A Quiet Rain / Night Sky)
  if (resolvedTheme === 'hilltop-observatory') {
    return (
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky-obs" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E2235" />
            <stop offset="45%" stopColor="#41395E" />
            <stop offset="80%" stopColor="#A85751" />
            <stop offset="100%" stopColor="#E09267" />
          </linearGradient>
          <linearGradient id="hill-obs" x1="0" y1="150" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#252A20" />
            <stop offset="100%" stopColor="#141712" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#sky-obs)" />
        {/* Sunset glow line */}
        <circle cx="200" cy="200" r="140" fill="#FFAA70" opacity="0.3" />
        {/* Stars */}
        <circle cx="60" cy="40" r="1.5" fill="#FFF" opacity="0.8" />
        <circle cx="110" cy="25" r="1" fill="#FFF" opacity="0.6" />
        <circle cx="280" cy="35" r="1.5" fill="#FFF" opacity="0.8" />
        <circle cx="340" cy="55" r="1" fill="#FFF" opacity="0.7" />
        <circle cx="190" cy="50" r="1.2" fill="#FFF" opacity="0.5" />
        {/* Hills */}
        <path d="M0 170 Q 180 140 400 175 L 400 240 L 0 240 Z" fill="url(#hill-obs)" />
        {/* Observatory Building on right hill */}
        <rect x="270" y="125" width="60" height="40" fill="#2E333D" rx="2" />
        {/* Dome */}
        <path d="M272 125 A 28 28 0 0 1 328 125 Z" fill="#4B5363" />
        {/* Dome slit */}
        <path d="M296 97 L 304 97 L 302 125 L 298 125 Z" fill="#FFE3A8" opacity="0.7" />
      </svg>
    );
  }

  // 4. Windmill Meadow (Wandering Songs)
  if (resolvedTheme === 'windmills-meadow') {
    return (
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky-wm" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5F88A6" />
            <stop offset="60%" stopColor="#BCD5E6" />
            <stop offset="100%" stopColor="#F9ECD3" />
          </linearGradient>
          <linearGradient id="meadow-wm" x1="0" y1="120" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8A9E58" />
            <stop offset="50%" stopColor="#6C8240" />
            <stop offset="100%" stopColor="#435225" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#sky-wm)" />
        {/* Soft cumulus clouds */}
        <ellipse cx="100" cy="80" rx="60" ry="22" fill="#FFFFFF" opacity="0.5" />
        <ellipse cx="280" cy="65" rx="75" ry="26" fill="#FFFFFF" opacity="0.6" />
        {/* Rolling Hills */}
        <path d="M0 160 Q 150 125 400 170 L 400 240 L 0 240 Z" fill="url(#meadow-wm)" />
        <path d="M0 190 Q 240 155 400 195 L 400 240 L 0 240 Z" fill="#4E612B" opacity="0.6" />
        {/* Windmill */}
        <polygon points="175,160 180,95 194,95 199,160" fill="#665243" />
        <polygon points="178,95 187,80 196,95" fill="#3D3025" />
        {/* Windmill Blades */}
        <circle cx="187" cy="98" r="3" fill="#2E241B" />
        <line x1="187" y1="98" x2="160" y2="70" stroke="#2E241B" strokeWidth="2.5" />
        <line x1="187" y1="98" x2="214" y2="126" stroke="#2E241B" strokeWidth="2.5" />
        <line x1="187" y1="98" x2="214" y2="70" stroke="#2E241B" strokeWidth="2.5" />
        <line x1="187" y1="98" x2="160" y2="126" stroke="#2E241B" strokeWidth="2.5" />
      </svg>
    );
  }

  // 5. City Street / Bookstore Cafe (InkFlow Notes)
  if (resolvedTheme === 'city-street-cafe') {
    return (
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky-str" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#28323B" />
            <stop offset="60%" stopColor="#4A5866" />
            <stop offset="100%" stopColor="#BA8C63" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#sky-str)" />
        {/* Street cobblestones */}
        <rect y="170" width="400" height="70" fill="#2D2824" />
        {/* Bookstore / Cafe shopfront */}
        <rect x="70" y="80" width="180" height="100" fill="#3E342B" rx="2" />
        {/* Striped Awning */}
        <polygon points="60,95 260,95 250,115 50,115" fill="#995D47" />
        {/* Large storefront warm window */}
        <rect x="85" y="118" width="105" height="50" rx="3" fill="#FFE8B2" opacity="0.9" />
        {/* Books on display inside */}
        <rect x="95" y="148" width="12" height="18" fill="#8A4E38" />
        <rect x="110" y="144" width="14" height="22" fill="#3B5A63" />
        <rect x="127" y="150" width="10" height="16" fill="#4B663A" />
        {/* Door */}
        <rect x="200" y="118" width="40" height="57" rx="2" fill="#241E19" />
        {/* Street Lamp */}
        <line x1="300" y1="195" x2="300" y2="90" stroke="#1F1A17" strokeWidth="4" />
        <polygon points="292,90 308,90 304,78 296,78" fill="#FFE8B2" />
        <circle cx="300" cy="85" r="16" fill="#FFDA73" opacity="0.3" />
      </svg>
    );
  }

  // 6. Cozy Desk Lamp (Email Drafts)
  if (resolvedTheme === 'cozy-desk-lamp') {
    return (
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="wall-dk" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#252427" />
            <stop offset="100%" stopColor="#3C3430" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#wall-dk)" />
        {/* Window with evening twilight on left */}
        <rect x="50" y="30" width="90" height="120" rx="2" fill="#586776" />
        <line x1="95" y1="30" x2="95" y2="150" stroke="#252427" strokeWidth="3" />
        <line x1="50" y1="90" x2="140" y2="90" stroke="#252427" strokeWidth="3" />
        {/* Wooden Desk */}
        <rect y="160" width="400" height="80" fill="#4E3B2C" />
        <line x1="0" y1="160" x2="400" y2="160" stroke="#664F3C" strokeWidth="3" />
        {/* Warm Desk Lamp on right */}
        <path d="M305 160 Q 305 105 280 85" stroke="#9C824A" strokeWidth="4" fill="none" />
        {/* Lamp Cone */}
        <polygon points="260,80 295,95 270,110" fill="#5C7A58" />
        {/* Warm light beam */}
        <polygon points="268,103 140,240 340,240 285,100" fill="#FFF2B8" opacity="0.22" />
        {/* Open Book / Manuscript on desk */}
        <polygon points="180,185 240,175 250,215 190,225" fill="#FAF6EE" />
        <polygon points="180,185 120,175 110,215 170,225" fill="#F1ECE2" />
      </svg>
    );
  }

  // 7. Stack of Books & Quill (Banner for Templates)
  if (resolvedTheme === 'books-quill') {
    return (
      <svg viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="bk-base" x1="0" y1="0" x2="500" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F9F5EC" />
            <stop offset="100%" stopColor="#ECE4D2" />
          </linearGradient>
        </defs>
        {/* Background gradient */}
        <rect width="500" height="200" fill="url(#bk-base)" rx="16" />
        {/* Soft background foliage */}
        <circle cx="450" cy="50" r="80" fill="#E1EAD8" opacity="0.4" />
        {/* Desk line */}
        <rect x="250" y="160" width="220" height="6" rx="2" fill="#B3A28F" />
        {/* Stack of Books */}
        <rect x="280" y="132" width="170" height="28" rx="3" fill="#A86E4B" />
        <rect x="283" y="135" width="164" height="6" fill="#F4EDE2" />
        <rect x="295" y="105" width="150" height="27" rx="3" fill="#4B6349" />
        <rect x="298" y="108" width="144" height="6" fill="#F4EDE2" />
        <rect x="310" y="80" width="130" height="25" rx="3" fill="#3D5366" />
        <rect x="313" y="83" width="124" height="5" fill="#F4EDE2" />
        {/* Ceramic Inkpot */}
        <path d="M410 75 Q 400 95 405 110 L 435 110 Q 440 95 430 75 Z" fill="#2B3632" />
        <rect x="412" y="72" width="16" height="5" rx="1" fill="#18201E" />
        {/* White / Cream Feather Quill dipping into pot */}
        <path d="M420 75 Q 435 30 455 10 C 452 25 448 45 423 75 Z" fill="#F9F6EE" stroke="#DDD2BE" strokeWidth="1" />
        <line x1="420" y1="75" x2="455" y2="10" stroke="#C5B59C" strokeWidth="1.5" />
      </svg>
    );
  }

  // Default Fallback: Dark Castle / Gothic Silhouette
  return (
    <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky-cs" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1C262B" />
          <stop offset="60%" stopColor="#2E3F47" />
          <stop offset="100%" stopColor="#6C5B55" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#sky-cs)" />
      <circle cx="120" cy="70" r="30" fill="#FFF2DC" opacity="0.8" />
      {/* Mountain Silhouettes */}
      <polygon points="0,240 90,130 180,240" fill="#202A30" />
      <polygon points="120,240 240,110 360,240" fill="#171F24" />
      {/* Castle Ramparts */}
      <rect x="260" y="145" width="80" height="70" fill="#101518" />
      <rect x="250" y="125" width="25" height="90" fill="#0C1013" />
      <rect x="325" y="125" width="25" height="90" fill="#0C1013" />
    </svg>
  );
};
