// Palette catégorielle validée (contraste + séparation daltonisme) pour les
// graphiques camembert — voir la skill dataviz pour la méthode de validation.
export const CATEGORICAL_COLORS = [
  '#ae8c29',
  '#2b65b6',
  '#ae4a29',
  '#29a2ae',
  '#ae2976',
  '#652bb6',
  '#29ae60',
  '#2e3ac2',
  '#6bae29',
  '#ae29ae',
  '#ae6029',
  '#2981ae',
]

export function colorForIndex(index) {
  return CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]
}
