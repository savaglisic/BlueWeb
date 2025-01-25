// columns.js

// Which columns must always be visible
export const importantFields = ['barcode', 'genotype'];

// All possible columns
export const columns = [
  { field: 'barcode', label: 'Barcode', priority: 1 },
  { field: 'genotype', label: 'Genotype', priority: 2 },
  { field: 'stage', label: 'Stage', priority: 3 },
  { field: 'site', label: 'Site', priority: 4 },
  { field: 'block', label: 'Block', priority: 5 },
  { field: 'project', label: 'Project', priority: 6 },
  { field: 'post_harvest', label: 'Post Harvest', priority: 7 },
  { field: 'bush_plant_number', label: 'Bush Plant Number', priority: 8 },
  { field: 'notes', label: 'Notes', priority: 9 },
  { field: 'mass', label: 'Mass', priority: 10 },
  { field: 'x_berry_mass', label: 'X Berry Mass', priority: 11 },
  { field: 'number_of_berries', label: 'Number of Berries', priority: 12 },
  { field: 'ph', label: 'pH', priority: 13 },
  { field: 'brix', label: 'Brix', priority: 14 },
  { field: 'juicemass', label: 'Juice Mass', priority: 15 },
  { field: 'tta', label: 'TTA', priority: 16 },
  { field: 'mladded', label: 'ml Added', priority: 17 },
  { field: 'avg_firmness', label: 'Avg Firmness', priority: 18 },
  { field: 'avg_diameter', label: 'Avg Diameter', priority: 19 },
  { field: 'sd_firmness', label: 'SD Firmness', priority: 20 },
  { field: 'sd_diameter', label: 'SD Diameter', priority: 21 },
  { field: 'box', label: 'Box', priority: 22 },
];

// Abbreviations for some columns
export const abbreviations = {
  'Post Harvest': 'PostHarv',
  'Bush Plant Number': 'BushNo',
  'Notes': 'Notes',
  'Mass': 'Mass',
  'X Berry Mass': 'XBerryM',
  'Number of Berries': 'NumBerr',
  'pH': 'pH',
  'Brix': 'Brix',
  'Juice Mass': 'JuiceM',
  'TTA': 'TTA',
  'ml Added': 'mlAdded',
  'Avg Firmness': 'AvgFirm',
  'Avg Diameter': 'AvgDiam',
  'SD Firmness': 'SDFirm',
  'SD Diameter': 'SDDiam',
  'Box': 'Box',
};

// Helper to sort columns by priority
export function getSortedColumns() {
  return columns.slice().sort((a, b) => a.priority - b.priority);
}
