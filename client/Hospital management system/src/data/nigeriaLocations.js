export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const LGA_DATA_URL = 'https://raw.githubusercontent.com/temikeezy/nigeria-geojson-data/main/data/lgas.json';
let localGovernmentData;

export async function getLocalGovernments(state) {
  if (!state) return [];

  if (!localGovernmentData) {
    const response = await fetch(LGA_DATA_URL);
    if (!response.ok) throw new Error('Unable to load local governments');
    localGovernmentData = await response.json();
  }

  const key = state === 'Federal Capital Territory' ? 'FCT' : state;
  return localGovernmentData[key] || [];
}
