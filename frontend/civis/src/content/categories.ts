export type CategoryKey =
  | 'roads'
  | 'lights'
  | 'water'
  | 'garbage'
  | 'parks'
  | 'drainage'
  | 'bridges'
  | 'wifi'
  | 'transport'
  | 'animals'

export type ComplaintCategoryValue =
  | 'Roads & Potholes'
  | 'Street Lights'
  | 'Water Supply'
  | 'Garbage & Sanitation'
  | 'Parks & Trees'
  | 'Drainage & Flooding'
  | 'Footpaths & Bridges'
  | 'Public WiFi & Signals'
  | 'Public Transport'
  | 'Stray Animals'

export type CategoryDefinition = {
  key: CategoryKey
  icon: string
  value: ComplaintCategoryValue
}

export const complaintCategories: readonly CategoryDefinition[] = [
  { key: 'roads', icon: '🛣', value: 'Roads & Potholes' },
  { key: 'lights', icon: '💡', value: 'Street Lights' },
  { key: 'water', icon: '🚰', value: 'Water Supply' },
  { key: 'garbage', icon: '🗑', value: 'Garbage & Sanitation' },
  { key: 'parks', icon: '🌳', value: 'Parks & Trees' },
  { key: 'drainage', icon: '🚧', value: 'Drainage & Flooding' },
  { key: 'bridges', icon: '🏗', value: 'Footpaths & Bridges' },
  { key: 'wifi', icon: '📶', value: 'Public WiFi & Signals' },
  { key: 'transport', icon: '🚌', value: 'Public Transport' },
  { key: 'animals', icon: '🐕', value: 'Stray Animals' },
] as const
