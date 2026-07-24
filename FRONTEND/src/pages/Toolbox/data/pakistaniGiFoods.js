/**
 * Approximate glycemic index values for common Pakistani foods.
 * GI categories: Low ≤55, Medium 56–69, High ≥70.
 * `swap` only on medium/high — labels must match another food's `name` exactly.
 */
export const GI_FOODS = [
  // Staples & breads
  { name: 'Basmati rice (white, boiled)', gi: 58, category: 'medium', swap: ['Brown basmati rice', 'Khichdi (rice + daal)', 'Daal masoor (red lentils)'] },
  { name: 'Brown basmati rice', gi: 50, category: 'low' },
  { name: 'Sella / steamed rice', gi: 60, category: 'medium', swap: ['Brown basmati rice', 'Khichdi (rice + daal)'] },
  { name: 'Chapati / roti (atta)', gi: 62, category: 'medium', swap: ['Whole wheat roti (multigrain)', 'Jowar (sorghum) roti', 'Bajra (pearl millet) roti'] },
  { name: 'Whole wheat roti (multigrain)', gi: 53, category: 'low' },
  { name: 'Paratha (plain)', gi: 70, category: 'high', swap: ['Chapati / roti (atta)', 'Whole wheat roti (multigrain)'] },
  { name: 'Naan (white flour)', gi: 71, category: 'high', swap: ['Chapati / roti (atta)', 'Whole wheat roti (multigrain)'] },
  { name: 'Puri', gi: 75, category: 'high', swap: ['Chapati / roti (atta)', 'Whole wheat roti (multigrain)'] },
  { name: 'White bread / double roti', gi: 75, category: 'high', swap: ['Whole wheat roti (multigrain)', 'Chapati / roti (atta)'] },
  { name: 'Jowar (sorghum) roti', gi: 49, category: 'low' },
  { name: 'Bajra (pearl millet) roti', gi: 54, category: 'low' },
  { name: 'Makki (corn) roti', gi: 68, category: 'medium', swap: ['Jowar (sorghum) roti', 'Bajra (pearl millet) roti'] },

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
  { name: 'Aloo (potato, boiled)', gi: 78, category: 'high', swap: ['Sweet potato', 'Bhindi (okra)', 'Lauki (bottle gourd)'] },
  { name: 'Aloo sabzi', gi: 72, category: 'high', swap: ['Bhindi (okra)', 'Tinda', 'Lauki (bottle gourd)'] },
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
  { name: 'Kela (banana, ripe)', gi: 62, category: 'medium', swap: ['Seb (apple)', 'Amrood (guava)', 'Anaar (pomegranate)'] },
  { name: 'Anaar (pomegranate)', gi: 35, category: 'low' },
  { name: 'Amrood (guava)', gi: 24, category: 'low' },
  { name: 'Seb (apple)', gi: 36, category: 'low' },
  { name: 'Angoor (grapes)', gi: 59, category: 'medium', swap: ['Seb (apple)', 'Amrood (guava)'] },
  { name: 'Khajoor (dates)', gi: 42, category: 'low' },
  { name: 'Tarbooz (watermelon)', gi: 76, category: 'high', swap: ['Amrood (guava)', 'Seb (apple)'] },
  { name: 'Kinno / orange', gi: 43, category: 'low' },

  // Dairy & drinks
  { name: 'Dahi (plain yogurt)', gi: 14, category: 'low' },
  { name: 'Lassi (sweet)', gi: 60, category: 'medium', swap: ['Lassi (salted / plain)', 'Dahi (plain yogurt)'] },
  { name: 'Lassi (salted / plain)', gi: 30, category: 'low' },
  { name: 'Chai with sugar', gi: 60, category: 'medium', swap: ['Lassi (salted / plain)', 'Dahi (plain yogurt)'] },
  { name: 'Rooh Afza / sweet sherbet', gi: 70, category: 'high', swap: ['Lassi (salted / plain)', 'Kinno / orange'] },
  { name: 'Sugarcane juice', gi: 70, category: 'high', swap: ['Lassi (salted / plain)', 'Kinno / orange'] },

  // Sweets & snacks
  { name: 'Samosa', gi: 68, category: 'medium', swap: ['Chana chaat', 'Chana (chickpeas, boiled)', 'Sprouted moong'] },
  { name: 'Pakora', gi: 65, category: 'medium', swap: ['Chana chaat', 'Sprouted moong', 'Bhindi (okra)'] },
  { name: 'Jalebi', gi: 81, category: 'high', swap: ['Seb (apple)', 'Amrood (guava)', 'Khajoor (dates)'] },
  { name: 'Gulab jamun', gi: 75, category: 'high', swap: ['Seb (apple)', 'Anaar (pomegranate)', 'Dahi (plain yogurt)'] },
  { name: 'Halwa (sooji)', gi: 70, category: 'high', swap: ['Seb (apple)', 'Dahi (plain yogurt)'] },
  { name: 'Seviyan (sweet)', gi: 65, category: 'medium', swap: ['Dahi (plain yogurt)', 'Khichdi (rice + daal)'] },
  { name: 'Nimco / mixture', gi: 65, category: 'medium', swap: ['Chana chaat', 'Roasted chana', 'Sprouted moong'] },
  { name: 'Roasted chana', gi: 33, category: 'low' },
  { name: 'Biscuits (glucose / tea)', gi: 70, category: 'high', swap: ['Roasted chana', 'Seb (apple)', 'Dahi (plain yogurt)'] },

  // Mixed dishes
  { name: 'Biryani (typical serving)', gi: 65, category: 'medium', swap: ['Khichdi (rice + daal)', 'Brown basmati rice', 'Karahi chicken with roti'] },
  { name: 'Khichdi (rice + daal)', gi: 45, category: 'low' },
  { name: 'Pulao', gi: 60, category: 'medium', swap: ['Brown basmati rice', 'Khichdi (rice + daal)'] },
  { name: 'Haleem', gi: 40, category: 'low' },
  { name: 'Nihari with naan', gi: 70, category: 'high', swap: ['Karahi chicken with roti', 'Chapati / roti (atta)', 'Haleem'] },
  { name: 'Karahi chicken with roti', gi: 55, category: 'low' },
];
