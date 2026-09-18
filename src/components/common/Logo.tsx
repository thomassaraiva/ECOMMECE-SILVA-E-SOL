import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'symbol-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
}) => {
  // Cores oficiais extraídas diretamente da identidade visual do usuário
  const brandGreen = '#2A8882';
  const brandOrange = '#F4803E';

  if (variant === 'symbol-only') {
    return (
      <svg
        viewBox="0 0 160 100"
        className={`inline-block ${size === 'sm' ? 'w-8 h-5' : size === 'lg' ? 'w-16 h-10' : 'w-12 h-7.5'} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Símbolo Sol e Ondas Silva e Sol"
      >
        {/* Sol Poente Laranja */}
        <path d="M 52 48 A 28 28 0 0 1 108 48 Z" fill={brandOrange} />
        {/* Ondas Verdes */}
        <path
          d="M 32 38 C 50 56 68 60 104 54 C 138 48 158 54 182 82 C 173 76 146 66 119 67 C 77 68 59 57 32 38 Z"
          fill={brandGreen}
        />
        <path
          d="M 18 58 C 36 74 72 80 117 73 C 147 68 174 78 195 101 C 180 91 150 84 114 86 C 63 89 36 75 18 58 Z"
          fill={brandGreen}
        />
      </svg>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center select-none ${className}`}>
        <svg
          viewBox="0 0 320 180"
          className={
            size === 'sm'
              ? 'w-36 h-auto'
              : size === 'lg'
              ? 'w-64 h-auto'
              : size === 'xl'
              ? 'w-72 h-auto'
              : 'w-48 h-auto'
          }
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sol Poente Semicircular Laranja */}
          <path d="M 115 62 A 38 38 0 0 1 190 62 Z" fill={brandOrange} />

          {/* Ondas do Mar em Verde Costeiro */}
          <path
            d="M 90 48 C 112 70 134 75 178 68 C 220 61 245 68 275 104 C 264 96 230 84 196 85 C 144 86 122 72 90 48 Z"
            fill={brandGreen}
          />
          <path
            d="M 72 73 C 94 93 138 101 194 92 C 231 86 264 99 290 128 C 271 116 234 107 189 110 C 125 114 91 96 72 73 Z"
            fill={brandGreen}
          />

          {/* Letreiro "Silva e Sol" */}
          <text
            x="160"
            y="145"
            textAnchor="middle"
            fill={brandGreen}
            style={{
              fontFamily: "'Caveat', 'Playfair Display', cursive, sans-serif",
              fontSize: '52px',
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            Silva e Sol
          </text>

          {/* Subtítulo "DO SEU JEITO" */}
          <text
            x="245"
            y="170"
            textAnchor="end"
            fill={brandOrange}
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
              fontSize: '13px',
              fontWeight: 800,
              fontStyle: 'italic',
              letterSpacing: '1.8px',
            }}
          >
            DO SEU JEITO
          </text>
        </svg>
      </div>
    );
  }

  // Horizontal (Default para Cabeçalho / Navbar)
  return (
    <div className={`flex items-center select-none ${className}`}>
      <div className="flex items-center gap-2 md:gap-3">
        {/* Símbolo com Sol e Ondas */}
        <svg
          viewBox="0 0 200 120"
          className={
            size === 'sm'
              ? 'w-9 h-6'
              : size === 'lg'
              ? 'w-14 h-9'
              : 'w-11 h-7 md:w-12 md:h-8'
          }
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sol Poente Laranja */}
          <path d="M 68 46 A 28 28 0 0 1 124 46 Z" fill={brandOrange} />

          {/* Ondas Verdes */}
          <path
            d="M 48 36 C 65 52 82 56 116 50 C 148 45 166 50 188 77 C 180 71 154 62 128 63 C 89 64 72 53 48 36 Z"
            fill={brandGreen}
          />
          <path
            d="M 34 54 C 51 69 85 75 127 68 C 155 64 180 73 200 95 C 186 86 158 79 124 81 C 76 84 51 70 34 54 Z"
            fill={brandGreen}
          />
        </svg>

        {/* Tipografia da Logo com Cores Exatas */}
        <div className="flex flex-col justify-center leading-none">
          <span
            style={{
              fontFamily: "'Caveat', 'Playfair Display', cursive, sans-serif",
              color: brandGreen,
              fontSize: size === 'sm' ? '22px' : size === 'lg' ? '34px' : '26px',
              fontWeight: 700,
              lineHeight: 0.95,
            }}
          >
            Silva e Sol
          </span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
              color: brandOrange,
              fontSize: size === 'sm' ? '8px' : size === 'lg' ? '11px' : '9.5px',
              fontWeight: 800,
              fontStyle: 'italic',
              letterSpacing: '1.8px',
              marginTop: '1px',
            }}
            className="text-right"
          >
            DO SEU JEITO
          </span>
        </div>
      </div>
    </div>
  );
};
