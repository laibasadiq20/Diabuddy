const Topic = require('./models/Topic');

/**
 * Seeds the Topic collection with default diabetes-relevant categories
 * if it is currently empty. Safe to call on every server start.
 */
const seedTopics = async () => {
  try {
    const count = await Topic.countDocuments();
    if (count > 0) {
      console.log(`[Topics] ${count} topics already seeded — skipping.`);
      return;
    }

    const defaults = [
      {
        name: 'Glucose Management',
        slug: 'glucose-management',
        description: 'Tips, questions, and insights on monitoring and managing blood glucose levels.',
        icon: 'Droplets',
        color: '#5E87A0',
      },
      {
        name: 'Nutrition & Meals',
        slug: 'nutrition-meals',
        description: 'Low-GI recipes, carb counting, meal planning, and diet strategies for people with diabetes.',
        icon: 'Utensils',
        color: '#B8902E',
      },
      {
        name: 'Exercise & Fitness',
        slug: 'exercise-fitness',
        description: 'How to safely exercise with diabetes — workouts, timing, and glucose impact.',
        icon: 'Dumbbell',
        color: '#7C9470',
      },
      {
        name: 'Insulin & Medications',
        slug: 'insulin-medications',
        description: 'Discussions about insulin types, dosing, oral medications, and new treatments.',
        icon: 'Pill',
        color: '#C2724F',
      },
      {
        name: 'Mental Health & Wellbeing',
        slug: 'mental-health',
        description: 'Coping with diabetes burnout, anxiety, stress, and emotional wellbeing.',
        icon: 'Heart',
        color: '#A78BFA',
      },
      {
        name: 'T1D Family & Parenting',
        slug: 't1d-family-parenting',
        description: 'Support for parents, caregivers, and families living with Type 1 diabetes.',
        icon: 'Baby',
        color: '#F472B6',
      },
      {
        name: 'Tech & Devices',
        slug: 'tech-devices',
        description: 'CGMs, insulin pumps, apps, and the latest diabetes technology.',
        icon: 'Smartphone',
        color: '#60A5FA',
      },
      {
        name: 'General Q&A',
        slug: 'general-qa',
        description: 'A friendly space for all diabetes-related questions that don\'t fit elsewhere.',
        icon: 'MessageCircle',
        color: '#22C55E',
      },
    ];

    await Topic.insertMany(defaults);
    console.log(`[Topics] ✅ Seeded ${defaults.length} default topic categories.`);
  } catch (err) {
    console.error('[Topics] ❌ Failed to seed topics:', err.message);
  }
};

module.exports = seedTopics;
