/**
 * Approximate glycemic index values for common Pakistani foods.
 * GI categories: Low ≤55, Medium 56–69, High ≥70.
 * Values are typical published estimates — individual response varies.
 */
export const GI_FOODS = [
  // Staples & breads
  { name: 'Basmati rice (white, boiled)', gi: 58, category: 'medium', alternatives: ['Brown basmati rice', 'Quinoa', 'Barley'] },
  { name: 'Brown basmati rice', gi: 50, category: 'low', alternatives: ['Barley', 'Bulgur', 'Quinoa'] },
  { name: 'Sella / steamed rice', gi: 60, category: 'medium', alternatives: ['Brown basmati', 'Mix rice with daal'] },
  { name: 'Chapati / roti (atta)', gi: 62, category: 'medium', alternatives: ['Multigrain roti', 'Jowar roti', 'Bajra roti'] },
  { name: 'Whole wheat roti (multigrain)', gi: 53, category: 'low', alternatives: ['Jowar roti', 'Bajra roti'] },
  { name: 'Paratha (plain)', gi: 70, category: 'high', alternatives: ['Chapati', 'Multigrain roti'] },
  { name: 'Naan (white flour)', gi: 71, category: 'high', alternatives: ['Chapati', 'Whole-wheat pita'] },
  { name: 'Puri', gi: 75, category: 'high', alternatives: ['Chapati', 'Baked whole-wheat flatbread'] },
  { name: 'White bread / double roti', gi: 75, category: 'high', alternatives: ['Whole wheat bread', 'Multigrain toast'] },
  { name: 'Jowar (sorghum) roti', gi: 49, category: 'low', alternatives: ['Bajra roti', 'Ragi roti'] },
  { name: 'Bajra (pearl millet) roti', gi: 54, category: 'low', alternatives: ['Jowar roti', 'Multigrain roti'] },
  { name: 'Makki (corn) roti', gi: 68, category: 'medium', alternatives: ['Jowar roti', 'Bajra roti'] },

  // Lentils & legumes
  { name: 'Daal masoor (red lentils)', gi: 26, category: 'low', alternatives: ['Chana daal', 'Moong daal'] },
  { name: 'Daal moong (mung)', gi: 38, category: 'low', alternatives: ['Masoor daal', 'Chana'] },
  { name: 'Daal chana', gi: 11, category: 'low', alternatives: ['Whole chana', 'Rajma'] },
  { name: 'Chana (chickpeas, boiled)', gi: 28, category: 'low', alternatives: ['Rajma', 'Lobia'] },
  { name: 'Chana chaat', gi: 33, category: 'low', alternatives: ['Sprouted moong chaat'] },
  { name: 'Rajma (kidney beans)', gi: 24, category: 'low', alternatives: ['Chana', 'Lobia'] },
  { name: 'Lobia (black-eyed peas)', gi: 33, category: 'low', alternatives: ['Rajma', 'Chana'] },
  { name: 'Sprouted moong', gi: 25, category: 'low', alternatives: ['Chana chaat', 'Cucumber salad'] },

  // Vegetables
  { name: 'Aloo (potato, boiled)', gi: 78, category: 'high', alternatives: ['Sweet potato (small portion)', 'Cauliflower mash'] },
  { name: 'Aloo sabzi', gi: 72, category: 'high', alternatives: ['Bhindi', 'Tinda', 'Lauki'] },
  { name: 'Sweet potato', gi: 54, category: 'low', alternatives: ['Carrot', 'Pumpkin'] },
  { name: 'Bhindi (okra)', gi: 15, category: 'low', alternatives: ['Tinda', 'Lauki'] },
  { name: 'Lauki (bottle gourd)', gi: 15, category: 'low', alternatives: ['Tinda', 'Torai'] },
  { name: 'Tinda', gi: 15, category: 'low', alternatives: ['Lauki', 'Bhindi'] },
  { name: 'Palak (spinach)', gi: 15, category: 'low', alternatives: ['Methi', 'Sarson saag'] },
  { name: 'Baingan (eggplant)', gi: 15, category: 'low', alternatives: ['Bhindi', 'Tinda'] },
  { name: 'Gajar (carrot, raw)', gi: 35, category: 'low', alternatives: ['Cucumber', 'Salad leaves'] },
  { name: 'Karela (bitter gourd)', gi: 15, category: 'low', alternatives: ['Bhindi', 'Lauki'] },

  // Fruits
  { name: 'Aam (mango, ripe)', gi: 51, category: 'low', alternatives: ['Guava', 'Apple', 'Pear'] },
  { name: 'Kela (banana, ripe)', gi: 62, category: 'medium', alternatives: ['Slightly green banana', 'Apple', 'Guava'] },
  { name: 'Anaar (pomegranate)', gi: 35, category: 'low', alternatives: ['Guava', 'Berries'] },
  { name: 'Amrood (guava)', gi: 24, category: 'low', alternatives: ['Apple', 'Pear'] },
  { name: 'Seb (apple)', gi: 36, category: 'low', alternatives: ['Guava', 'Pear'] },
  { name: 'Angoor (grapes)', gi: 59, category: 'medium', alternatives: ['Apple', 'Guava', 'Berries'] },
  { name: 'Khajoor (dates)', gi: 42, category: 'low', alternatives: ['1–2 dates max; prefer guava or apple'] },
  { name: 'Tarbooz (watermelon)', gi: 76, category: 'high', alternatives: ['Melon in small portion', 'Guava', 'Apple'] },
  { name: 'Kinno / orange', gi: 43, category: 'low', alternatives: ['Whole fruit over juice'] },

  // Dairy & drinks
  { name: 'Dahi (plain yogurt)', gi: 14, category: 'low', alternatives: ['Greek-style yogurt (unsweetened)'] },
  { name: 'Lassi (sweet)', gi: 60, category: 'medium', alternatives: ['Plain salted lassi', 'Unsweetened yogurt drink'] },
  { name: 'Lassi (salted / plain)', gi: 30, category: 'low', alternatives: ['Dahi with water'] },
  { name: 'Chai with sugar', gi: 60, category: 'medium', alternatives: ['Tea without sugar', 'Stevia if advised'] },
  { name: 'Rooh Afza / sweet sherbet', gi: 70, category: 'high', alternatives: ['Lemon water', 'Infused water'] },
  { name: 'Sugarcane juice', gi: 70, category: 'high', alternatives: ['Lemon water', 'Unsweetened buttermilk'] },

  // Sweets & snacks
  { name: 'Samosa', gi: 68, category: 'medium', alternatives: ['Baked vegetable roll', 'Chana chaat'] },
  { name: 'Pakora', gi: 65, category: 'medium', alternatives: ['Roasted chana', 'Vegetable sticks'] },
  { name: 'Jalebi', gi: 81, category: 'high', alternatives: ['Small portion of fruit', 'Sugar-free dessert if advised'] },
  { name: 'Gulab jamun', gi: 75, category: 'high', alternatives: ['Fruit chaat (no syrup)', 'Dahi with cinnamon'] },
  { name: 'Halwa (sooji)', gi: 70, category: 'high', alternatives: ['Small serving; prefer fruit'] },
  { name: 'Seviyan (sweet)', gi: 65, category: 'medium', alternatives: ['Plain oats', 'Unsweetened yogurt'] },
  { name: 'Nimco / mixture', gi: 65, category: 'medium', alternatives: ['Roasted chana', 'Nuts (small handful)'] },
  { name: 'Biscuits (glucose / tea)', gi: 70, category: 'high', alternatives: ['Handful of nuts', 'Roasted chana'] },

  // Mixed dishes
  { name: 'Biryani (typical serving)', gi: 65, category: 'medium', alternatives: ['Smaller rice portion + extra salad/raita', 'Daal + roti'] },
  { name: 'Khichdi (rice + daal)', gi: 45, category: 'low', alternatives: ['More daal, less rice'] },
  { name: 'Pulao', gi: 60, category: 'medium', alternatives: ['Brown rice pulao', 'Quinoa pilaf'] },
  { name: 'Haleem', gi: 40, category: 'low', alternatives: ['Keep oil/ghee moderate'] },
  { name: 'Nihari with naan', gi: 70, category: 'high', alternatives: ['Nihari with chapati + salad'] },
  { name: 'Karahi chicken with roti', gi: 55, category: 'low', alternatives: ['Extra salad; limit oil'] },
];

export function giLabel(category) {
  if (category === 'low') return { label: 'Low GI', colorKey: 'sage' };
  if (category === 'medium') return { label: 'Medium GI', colorKey: 'gold' };
  return { label: 'High GI', colorKey: 'clay' };
}
