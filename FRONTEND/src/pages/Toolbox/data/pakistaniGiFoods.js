/**
 * Approximate glycemic index values for common Pakistani foods.
 * GI categories: Low ≤55, Medium 56–69, High ≥70.
 * `swap` only on medium/high — lower-GI options to consider instead.
 */
export const GI_FOODS = [
  // Staples & breads
  { name: 'Basmati rice (white, boiled)', gi: 58, category: 'medium', swap: ['Brown basmati rice', 'Quinoa', 'Barley'] },
  { name: 'Brown basmati rice', gi: 50, category: 'low' },
  { name: 'Sella / steamed rice', gi: 60, category: 'medium', swap: ['Brown basmati rice', 'Mix rice with daal'] },
  { name: 'Chapati / roti (atta)', gi: 62, category: 'medium', swap: ['Multigrain roti', 'Jowar roti', 'Bajra roti'] },
  { name: 'Whole wheat roti (multigrain)', gi: 53, category: 'low' },
  { name: 'Paratha (plain)', gi: 70, category: 'high', swap: ['Chapati', 'Multigrain roti'] },
  { name: 'Naan (white flour)', gi: 71, category: 'high', swap: ['Chapati', 'Whole-wheat pita'] },
  { name: 'Puri', gi: 75, category: 'high', swap: ['Chapati', 'Baked whole-wheat flatbread'] },
  { name: 'White bread / double roti', gi: 75, category: 'high', swap: ['Whole wheat bread', 'Multigrain toast'] },
  { name: 'Jowar (sorghum) roti', gi: 49, category: 'low' },
  { name: 'Bajra (pearl millet) roti', gi: 54, category: 'low' },
  { name: 'Makki (corn) roti', gi: 68, category: 'medium', swap: ['Jowar roti', 'Bajra roti'] },

  // Lentils & legumes
  { name: 'Daal masoor (red lentils)', gi: 26, category: 'low' },
  { name: 'Daal moong (mung)', gi: 38, category: 'low' },
  { name: 'Daal chana', gi: 11, category: 'low' },
  { name: 'Chana (chickpeas, boiled)', gi: 28, category: 'low' },
  { name: 'Chana chaat', gi: 33, category: 'low' },
  { name: 'Rajma (kidney beans)', gi: 24, category: 'low' },
  { name: 'Lobia (black-eyed peas)', gi: 33, category: 'low' },
  { name: 'Sprouted moong', gi: 25, category: 'low' },

  // Vegetables
  { name: 'Aloo (potato, boiled)', gi: 78, category: 'high', swap: ['Sweet potato (small portion)', 'Cauliflower mash'] },
  { name: 'Aloo sabzi', gi: 72, category: 'high', swap: ['Bhindi', 'Tinda', 'Lauki'] },
  { name: 'Sweet potato', gi: 54, category: 'low' },
  { name: 'Bhindi (okra)', gi: 15, category: 'low' },
  { name: 'Lauki (bottle gourd)', gi: 15, category: 'low' },
  { name: 'Tinda', gi: 15, category: 'low' },
  { name: 'Palak (spinach)', gi: 15, category: 'low' },
  { name: 'Baingan (eggplant)', gi: 15, category: 'low' },
  { name: 'Gajar (carrot, raw)', gi: 35, category: 'low' },
  { name: 'Karela (bitter gourd)', gi: 15, category: 'low' },

  // Fruits
  { name: 'Aam (mango, ripe)', gi: 51, category: 'low' },
  { name: 'Kela (banana, ripe)', gi: 62, category: 'medium', swap: ['Slightly green banana', 'Apple', 'Guava'] },
  { name: 'Anaar (pomegranate)', gi: 35, category: 'low' },
  { name: 'Amrood (guava)', gi: 24, category: 'low' },
  { name: 'Seb (apple)', gi: 36, category: 'low' },
  { name: 'Angoor (grapes)', gi: 59, category: 'medium', swap: ['Apple', 'Guava'] },
  { name: 'Khajoor (dates)', gi: 42, category: 'low' },
  { name: 'Tarbooz (watermelon)', gi: 76, category: 'high', swap: ['Guava', 'Apple'] },
  { name: 'Kinno / orange', gi: 43, category: 'low' },

  // Dairy & drinks
  { name: 'Dahi (plain yogurt)', gi: 14, category: 'low' },
  { name: 'Lassi (sweet)', gi: 60, category: 'medium', swap: ['Plain salted lassi'] },
  { name: 'Lassi (salted / plain)', gi: 30, category: 'low' },
  { name: 'Chai with sugar', gi: 60, category: 'medium', swap: ['Tea without sugar'] },
  { name: 'Rooh Afza / sweet sherbet', gi: 70, category: 'high', swap: ['Lemon water'] },
  { name: 'Sugarcane juice', gi: 70, category: 'high', swap: ['Lemon water', 'Unsweetened buttermilk'] },

  // Sweets & snacks
  { name: 'Samosa', gi: 68, category: 'medium', swap: ['Chana chaat', 'Roasted chana'] },
  { name: 'Pakora', gi: 65, category: 'medium', swap: ['Roasted chana', 'Vegetable sticks'] },
  { name: 'Jalebi', gi: 81, category: 'high', swap: ['Fresh fruit'] },
  { name: 'Gulab jamun', gi: 75, category: 'high', swap: ['Fruit chaat (no syrup)'] },
  { name: 'Halwa (sooji)', gi: 70, category: 'high', swap: ['Fresh fruit'] },
  { name: 'Seviyan (sweet)', gi: 65, category: 'medium', swap: ['Plain oats', 'Unsweetened yogurt'] },
  { name: 'Nimco / mixture', gi: 65, category: 'medium', swap: ['Roasted chana', 'Nuts (small handful)'] },
  { name: 'Biscuits (glucose / tea)', gi: 70, category: 'high', swap: ['Nuts (small handful)', 'Roasted chana'] },

  // Mixed dishes
  { name: 'Biryani (typical serving)', gi: 65, category: 'medium', swap: ['Smaller rice portion + salad', 'Daal + roti'] },
  { name: 'Khichdi (rice + daal)', gi: 45, category: 'low' },
  { name: 'Pulao', gi: 60, category: 'medium', swap: ['Brown rice pulao'] },
  { name: 'Haleem', gi: 40, category: 'low' },
  { name: 'Nihari with naan', gi: 70, category: 'high', swap: ['Nihari with chapati + salad'] },
  { name: 'Karahi chicken with roti', gi: 55, category: 'low' },
];
