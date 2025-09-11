// Synonym dictionary for enhanced search functionality
export interface SynonymDict {
  [key: string]: string[];
}

export const synonymDictionary: SynonymDict = {
  // Food & Dining
  'food': ['restaurant', 'dining', 'eatery', 'cafe', 'bistro', 'diner', 'kitchen'],
  'restaurant': ['food', 'dining', 'eatery', 'cafe', 'bistro', 'diner'],
  'cafe': ['coffee', 'coffeehouse', 'coffee shop', 'restaurant', 'food'],
  'coffee': ['cafe', 'coffeehouse', 'coffee shop', 'espresso', 'latte'],
  'bar': ['pub', 'tavern', 'lounge', 'nightclub', 'drinks'],
  'pizza': ['italian', 'food', 'restaurant', 'dining'],
  'burger': ['food', 'restaurant', 'fast food', 'dining'],
  
  // Retail & Shopping
  'shop': ['store', 'retail', 'shopping', 'market', 'outlet'],
  'store': ['shop', 'retail', 'shopping', 'market', 'outlet'],
  'clothing': ['fashion', 'apparel', 'clothes', 'garments', 'wear'],
  'fashion': ['clothing', 'apparel', 'clothes', 'style', 'boutique'],
  'electronics': ['tech', 'technology', 'gadgets', 'devices', 'computers'],
  'phone': ['mobile', 'smartphone', 'cellular', 'electronics'],
  'computer': ['tech', 'electronics', 'laptop', 'pc', 'technology'],
  
  // Services
  'repair': ['fix', 'service', 'maintenance', 'restoration'],
  'fix': ['repair', 'service', 'maintenance', 'restoration'],
  'doctor': ['physician', 'medical', 'clinic', 'healthcare', 'health'],
  'medical': ['doctor', 'physician', 'clinic', 'healthcare', 'health'],
  'lawyer': ['attorney', 'legal', 'law firm', 'advocate'],
  'attorney': ['lawyer', 'legal', 'law firm', 'advocate'],
  'salon': ['beauty', 'hair', 'spa', 'grooming', 'cosmetics'],
  'beauty': ['salon', 'spa', 'cosmetics', 'makeup', 'hair'],
  'gym': ['fitness', 'workout', 'exercise', 'training', 'health'],
  'fitness': ['gym', 'workout', 'exercise', 'training', 'health'],
  
  // Automotive
  'car': ['auto', 'automobile', 'vehicle', 'automotive'],
  'auto': ['car', 'automobile', 'vehicle', 'automotive'],
  'garage': ['auto', 'car', 'repair', 'service', 'mechanic'],
  'mechanic': ['auto', 'car', 'repair', 'service', 'garage'],
  
  // Real Estate & Construction
  'house': ['home', 'property', 'real estate', 'residence'],
  'home': ['house', 'property', 'real estate', 'residence'],
  'construction': ['building', 'contractor', 'renovation'],
  'contractor': ['construction', 'building', 'renovation'],
  
  // Education & Learning
  'school': ['education', 'learning', 'academy', 'institute'],
  'education': ['school', 'learning', 'academy', 'institute', 'training'],
  'tutor': ['education', 'learning', 'teaching', 'instructor'],
  'teacher': ['education', 'learning', 'tutor', 'instructor'],
  
  // Entertainment & Events
  'event': ['party', 'celebration', 'function', 'occasion'],
  'party': ['event', 'celebration', 'function', 'entertainment'],
  'music': ['entertainment', 'band', 'concert', 'audio'],
  'photography': ['photo', 'photographer', 'pictures', 'images'],
  
  // Financial Services
  'bank': ['financial', 'finance', 'banking', 'money'],
  'finance': ['bank', 'financial', 'banking', 'money', 'loan'],
  'insurance': ['financial', 'coverage', 'policy', 'protection'],
  
  // Transportation
  'taxi': ['transport', 'cab', 'ride', 'transportation'],
  'transport': ['taxi', 'cab', 'ride', 'transportation', 'delivery'],
  'delivery': ['transport', 'shipping', 'courier', 'logistics'],
  
  // Health & Wellness
  'pharmacy': ['medicine', 'drugs', 'health', 'medical'],
  'medicine': ['pharmacy', 'drugs', 'health', 'medical'],
  'spa': ['wellness', 'beauty', 'relaxation', 'massage'],
  'massage': ['spa', 'wellness', 'therapy', 'health'],
  
  // Professional Services
  'accountant': ['accounting', 'finance', 'tax', 'bookkeeping'],
  'consulting': ['consultant', 'advisory', 'professional', 'services'],
  'marketing': ['advertising', 'promotion', 'branding', 'digital'],
  'web': ['website', 'internet', 'online', 'digital'],
  
  // Common informal terms
  'cheap': ['affordable', 'budget', 'low cost', 'inexpensive'],
  'expensive': ['premium', 'luxury', 'high end', 'costly'],
  'fast': ['quick', 'rapid', 'speedy', 'express'],
  'good': ['quality', 'excellent', 'great', 'best'],
  'near': ['close', 'nearby', 'local', 'around'],
};

/**
 * Expands search terms with synonyms
 * @param query - The search query string
 * @returns Array of expanded search terms including original and synonyms
 */
export function expandSearchTerms(query: string): string[] {
  if (!query || typeof query !== 'string') return [];
  
  const terms = query.toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 0);
  
  const expandedTerms = new Set<string>();
  
  // Add original terms
  terms.forEach(term => expandedTerms.add(term));
  
  // Add synonyms for each term
  terms.forEach(term => {
    if (synonymDictionary[term]) {
      synonymDictionary[term].forEach(synonym => {
        expandedTerms.add(synonym);
      });
    }
  });
  
  return Array.from(expandedTerms);
}

/**
 * Creates a search query with OR conditions for all expanded terms
 * @param field - The database field to search in
 * @param expandedTerms - Array of search terms including synonyms
 * @returns Formatted query string for Supabase
 */
export function createExpandedSearchQuery(field: string, expandedTerms: string[]): string {
  return expandedTerms
    .map(term => `${field}.ilike.%${term}%`)
    .join(',');
}

/**
 * Maps informal category names to formal ones
 * @param category - The category string to normalize
 * @returns Normalized category name
 */
export function normalizeCategoryName(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'food': 'Restaurant',
    'restaurant': 'Restaurant', 
    'cafe': 'Restaurant',
    'shop': 'Retail Store',
    'store': 'Retail Store',
    'clothing': 'Retail Store',
    'fashion': 'Retail Store',
    'medical': 'Healthcare',
    'doctor': 'Healthcare',
    'clinic': 'Healthcare',
    'legal': 'Legal Services',
    'lawyer': 'Legal Services',
    'attorney': 'Legal Services',
    'auto': 'Automotive',
    'car': 'Automotive',
    'garage': 'Automotive',
    'house': 'Real Estate',
    'home': 'Real Estate',
    'property': 'Real Estate',
    'school': 'Education',
    'education': 'Education',
  };
  
  return categoryMap[category.toLowerCase()] || category;
}