export interface CountryCode {
  code: string;
  flag: string;
  name: string;
  example: string;
}

export const WEST_AFRICAN_AND_GLOBAL_COUNTRIES: CountryCode[] = [
  { code: '+221', flag: '🇸🇳', name: 'Sénégal', example: '77 123 45 67' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", example: '07 12 34 56 78' },
  { code: '+223', flag: '🇲🇱', name: 'Mali', example: '66 12 34 56' },
  { code: '+224', flag: '🇬🇳', name: 'Guinée', example: '62 12 34 56' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso', example: '70 12 34 56' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin', example: '90 12 34 56' },
  { code: '+228', flag: '🇹🇬', name: 'Togo', example: '90 12 34 56' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun', example: '6 71 23 45 67' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria', example: '801 234 5678' },
  { code: '+212', flag: '🇲🇦', name: 'Maroc', example: '6 12 34 56 78' },
  { code: '+33',  flag: '🇫🇷', name: 'France', example: '6 12 34 56 78' },
  { code: '+1',   flag: '🇺🇸', name: 'États-Unis / Canada', example: '202 555 0123' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon', example: '66 12 34 56' },
  { code: '+242', flag: '🇨🇬', name: 'Congo-Brazzaville', example: '06 123 45 67' },
  { code: '+243', flag: '🇨🇩', name: 'RDC', example: '81 234 5678' },
  { code: '+235', flag: '🇹🇩', name: 'Tchad', example: '66 12 34 56' },
  { code: '+227', flag: '🇳🇪', name: 'Niger', example: '90 12 34 56' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritanie', example: '45 12 34 56' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisie', example: '20 123 456' },
  { code: '+213', flag: '🇩🇿', name: 'Algérie', example: '550 12 34 56' }
];

export function formatPhoneNumber(countryCode: string, rawLocalNumber: string): string {
  const digitsOnly = rawLocalNumber.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return `${countryCode}${digitsOnly}`;
}
