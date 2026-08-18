'use client';

import React, { useState, useEffect } from 'react';
import { WEST_AFRICAN_AND_GLOBAL_COUNTRIES, CountryCode } from '@/lib/countries';

interface PhoneInputWithCountryProps {
  value?: string;
  onChange?: (fullNumber: string) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export default function PhoneInputWithCountry({
  value = '',
  onChange,
  name = 'phone',
  placeholder,
  required = false,
  style
}: PhoneInputWithCountryProps) {
  // Déterminer le pays initial d'après le numéro passé
  const detectInitialCountry = (val: string): { country: CountryCode; localDigits: string } => {
    if (!val) return { country: WEST_AFRICAN_AND_GLOBAL_COUNTRIES[0], localDigits: '' };
    const matched = WEST_AFRICAN_AND_GLOBAL_COUNTRIES.find(c => val.startsWith(c.code));
    if (matched) {
      return { country: matched, localDigits: val.slice(matched.code.length).replace(/\D/g, '') };
    }
    return { country: WEST_AFRICAN_AND_GLOBAL_COUNTRIES[0], localDigits: val.replace(/\D/g, '') };
  };

  const initialParsed = detectInitialCountry(value);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initialParsed.country);
  const [localDigits, setLocalDigits] = useState<string>(initialParsed.localDigits);

  // Mettre à jour si value change de l'extérieur
  useEffect(() => {
    if (value) {
      const parsed = detectInitialCountry(value);
      setSelectedCountry(parsed.country);
      setLocalDigits(parsed.localDigits);
    }
  }, [value]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const found = WEST_AFRICAN_AND_GLOBAL_COUNTRIES.find(c => c.code === code) || WEST_AFRICAN_AND_GLOBAL_COUNTRIES[0];
    setSelectedCountry(found);
    const full = localDigits ? `${found.code}${localDigits}` : '';
    if (onChange) onChange(full);
  };

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Extraire uniquement les chiffres
    const cleaned = raw.replace(/\D/g, '');
    setLocalDigits(cleaned);
    const full = cleaned ? `${selectedCountry.code}${cleaned}` : '';
    if (onChange) onChange(full);
  };

  const computedFullValue = localDigits ? `${selectedCountry.code}${localDigits}` : '';
  const displayPlaceholder = placeholder || `Ex: ${selectedCountry.code}${selectedCountry.example.replace(/\s+/g, '')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
        {/* Pilule du Drapeau avec sélecteur */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 14px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{selectedCountry.flag}</span>
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--primary)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ marginLeft: '6px', flexShrink: 0 }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>

          {/* Select natif transparent superposé pour le comportement tactile fluide */}
          <select
            value={selectedCountry.code}
            onChange={handleCountryChange}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
            title="Choisir l'indicatif du pays"
          >
            {WEST_AFRICAN_AND_GLOBAL_COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Champ de Saisie du Numéro */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            fontSize: '15px',
            fontWeight: '600',
            color: 'var(--primary)',
            pointerEvents: 'none'
          }}>
            {selectedCountry.code}
          </span>
          <input
            type="tel"
            value={localDigits}
            onChange={handleDigitsChange}
            placeholder={selectedCountry.example}
            required={required}
            className="input-field"
            style={{
              paddingLeft: `${selectedCountry.code.length * 10 + 26}px`
            }}
          />
        </div>
      </div>

      {/* Input hidden pour envoi direct dans les FormData */}
      <input type="hidden" name={name} value={computedFullValue} />
    </div>
  );
}
