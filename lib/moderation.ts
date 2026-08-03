// Liste des mots-clés sensibles liés au suicide, à l'automutilation ou à la détresse extrême
export const SENSITIVE_KEYWORDS = [
  'suicide',
  'suicider',
  'tuer',
  'mourir',
  'finir ma vie',
  'en finir',
  'plus envie de vivre',
  'veux plus vivre',
  'enlever la vie',
  'auto-mutiler',
  'automutilation',
  'pendre',
  'poison',
  'couper les veines'
];

/**
 * Vérifie si le texte contient un mot-clé sensible (insensible à la casse)
 */
export function checkSensitiveContent(text: string): boolean {
  if (!text) return false;
  const normalizedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return SENSITIVE_KEYWORDS.some(keyword => {
    const normalizedKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalizedText.includes(normalizedKeyword);
  });
}

// Contacts d'aide d'urgence au Sénégal et généraux
export const CRISIS_RESOURCES = {
  title: "Tu n'es pas seul·e face à cette douleur 💚",
  message: "Goumin est un espace d'entraide, mais ton contenu contient des mots qui indiquent que tu traverses une détresse profonde. S'il te plaît, contacte un professionnel ou un proche immédiatement. Il y a de l'aide disponible :",
  contacts: [
    { name: "Urgences Médicales (Sénégal)", value: "1515 ou 33 889 15 15" },
    { name: "Urgences Psychiatriques - Hôpital de Fann (Dakar)", value: "33 869 18 18" },
    { name: "Secours généraux / Gendarmerie", value: "17 ou 800 00 20 20" },
    { name: "Écoute Empathique en ligne", value: "Parles-en aussi à ton Contact de Confiance dans tes paramètres." }
  ]
};
