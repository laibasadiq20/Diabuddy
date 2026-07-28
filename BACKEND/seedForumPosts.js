const bcrypt = require('bcrypt');
const Topic = require('./models/Topic');
const ForumPost = require('./models/ForumPost');
const User = require('./models/User');

const SEED_TAG = 'community-seed';

/**
 * Starter anonymous forum posts (2–3 per topic).
 * Safe to call on every boot — skips topics that already have seed posts.
 */
const STARTER_POSTS = {
  'glucose-management': [
    {
      title: 'Morning highs even when I eat the same breakfast',
      content:
        'I wake up around 140–160 most days, then my fasting number climbs a bit before I even eat. Same oatmeal + berries routine. Has anyone found a pattern that helped with dawn phenomenon without changing everything overnight? Looking for gentle ideas, not medical advice.',
      tags: ['dawn-phenomenon', 'fasting', SEED_TAG],
    },
    {
      title: 'How do you decide when a spike is “wait and see” vs act?',
      content:
        'After meals I sometimes hit 180 and feel fine; other times 160 makes me anxious. Curious how others decide when to correct vs wait 20 minutes and recheck. What’s your personal rule of thumb (again — sharing experiences, not prescribing)?',
      tags: ['spikes', 'CGM', SEED_TAG],
    },
    {
      title: 'Nighttime lows are scaring me a little',
      content:
        'I’ve had two nights where I woke up shaky around 3am. I keep glucose tabs by the bed now. Anyone else deal with this? What bedtime snacks or checks helped you feel safer sleeping?',
      tags: ['hypoglycemia', 'night', SEED_TAG],
    },
  ],
  'nutrition-meals': [
    {
      title: 'Low-effort dinners that don’t wreck my numbers',
      content:
        'Work days I’m exhausted and takeout is tempting. What are your go-to 15-minute meals that are carb-aware? Bonus points if they freeze well. Sharing what’s worked for you would help a lot.',
      tags: ['meal-prep', 'low-gi', SEED_TAG],
    },
    {
      title: 'Does anyone else struggle with restaurant portions?',
      content:
        'I can manage at home, but restaurants are unpredictable. Do you ask for sauces on the side, share plates, or pre-bolus differently? Anonymous tips welcome — no judgment zone.',
      tags: ['dining-out', 'portions', SEED_TAG],
    },
    {
      title: 'Sweet tooth without the crash — what’s your swap?',
      content:
        'I miss dessert after dinner. Greek yogurt + cinnamon? Dark chocolate square? Fruit + peanut butter? Drop your favorite “treat that didn’t spike me too hard” ideas.',
      tags: ['dessert', 'cravings', SEED_TAG],
    },
  ],
  'exercise-fitness': [
    {
      title: 'Walking after meals — does timing matter for you?',
      content:
        'I’ve started a 10–15 minute walk after dinner and my post-meal curve looks softer. Curious if mornings vs evenings work differently for others, or if intensity changes things.',
      tags: ['walking', 'post-meal', SEED_TAG],
    },
    {
      title: 'Strength training made my glucose drop fast',
      content:
        'First time lifting in a while and I went low mid-workout. I had carbs with me but felt unprepared. How do you fuel before the gym without overdoing it?',
      tags: ['strength', 'hypoglycemia', SEED_TAG],
    },
    {
      title: 'Anyone use exercise to flatten stubborn afternoon highs?',
      content:
        'Around 3–4pm I drift high even on quieter days. A short bike ride sometimes helps. Looking for other low-pressure movement ideas that fit a busy schedule.',
      tags: ['afternoon', 'movement', SEED_TAG],
    },
  ],
  'insulin-medications': [
    {
      title: 'Remembering doses when life gets chaotic',
      content:
        'Between work and family I sometimes second-guess whether I already took my meds. What reminder systems actually stuck for you — apps, pill boxes, alarms, habit stacking?',
      tags: ['reminders', 'adherence', SEED_TAG],
    },
    {
      title: 'Site rotation tips that reduced irritation',
      content:
        'One area of my belly got tender from repeating sites. How do you map rotation so you don’t reuse the same spots too soon? Photos of charts welcome if you’ve got a simple system.',
      tags: ['injection-sites', 'pump', SEED_TAG],
    },
    {
      title: 'Travel days mess with my schedule — how do you plan?',
      content:
        'Time zones + delayed meals always throw me off. Do you keep a written plan, pack extras differently, or talk to your care team before longer trips? Anonymous travel stories appreciated.',
      tags: ['travel', 'planning', SEED_TAG],
    },
  ],
  'mental-health': [
    {
      title: 'Diabetes burnout is real — how do you rest without quitting?',
      content:
        'Some weeks I do everything “right” and still feel tired of thinking about numbers. I’m not looking for a pep talk — more like: what tiny routines helped you come back gently after burnout?',
      tags: ['burnout', 'support', SEED_TAG],
    },
    {
      title: 'Anxiety before appointments',
      content:
        'I tense up days before checkups, even when things are mostly okay. Does anyone else feel this? What helps you walk in calmer — notes, bringing someone, asking for a pause mid-visit?',
      tags: ['anxiety', 'appointments', SEED_TAG],
    },
    {
      title: 'Feeling alone with this sometimes',
      content:
        'Friends mean well but don’t always get the mental load. This forum already helps. If you’re new here too: you’re not the only one figuring it out day by day. 💛',
      tags: ['community', 'loneliness', SEED_TAG],
    },
  ],
  't1d-family-parenting': [
    {
      title: 'School nurse communication that actually works',
      content:
        'We’re trying to keep a simple 504/care plan without 20 emails a week. What templates or check-in habits made school days smoother for your kid?',
      tags: ['school', 'care-plan', SEED_TAG],
    },
    {
      title: 'Overnight checks without living in fear',
      content:
        'New-ish to parenting with T1D and overnight alarms wreck my sleep. How did you find a balance between safety and not hovering every hour? CGM tips welcome.',
      tags: ['overnight', 'caregivers', SEED_TAG],
    },
    {
      title: 'Explaining diabetes to relatives without a lecture',
      content:
        'Family gatherings turn into unsolicited food advice. Any short scripts that set boundaries kindly? I want people to help, not police every bite.',
      tags: ['family', 'boundaries', SEED_TAG],
    },
  ],
  'tech-devices': [
    {
      title: 'CGM adhesive that lasts through workouts',
      content:
        'Sensors peel early when I sweat. What tapes/overlays or skin prep actually helped you get a full wear? Brand names okay — personal experience only.',
      tags: ['CGM', 'adhesive', SEED_TAG],
    },
    {
      title: 'App alerts: useful vs noise',
      content:
        'I turned on every alert and got overwhelmed. Which notifications do you keep on, and which did you silence so you still notice the important ones?',
      tags: ['apps', 'alerts', SEED_TAG],
    },
    {
      title: 'Pump vs MDI — what made you switch (or stay)?',
      content:
        'I’m researching options and would love honest anonymous stories: what improved, what surprised you, and what you wish you’d known earlier. No sales pitches please.',
      tags: ['pump', 'MDI', SEED_TAG],
    },
  ],
  'general-qa': [
    {
      title: 'New here — where should I start reading?',
      content:
        'Just joined DiaBuddy. Diagnosed not long ago and the information overload is a lot. Which topics here helped you most in the first months? Prefer real-people stories over jargon.',
      tags: ['newcomers', 'welcome', SEED_TAG],
    },
    {
      title: 'How do you talk to coworkers about lows?',
      content:
        'I’m unsure how much to share at work. Do you keep it simple (“I might need sugar sometimes”) or have a fuller plan with a trusted teammate? Looking for workplace-friendly ideas.',
      tags: ['work', 'hypoglycemia', SEED_TAG],
    },
    {
      title: 'What I wish someone told me earlier',
      content:
        'For anyone further along: drop one practical thing you learned the hard way. Could be about sleep, snacks, appointments, devices — whatever would have saved a newer person stress.',
      tags: ['advice', 'lessons', SEED_TAG],
    },
  ],
};

const ensureSeedAuthor = async () => {
  const email = 'community-seed@diabuddy.local';
  let user = await User.findOne({ email });
  if (user) return user;

  const passwordHash = await bcrypt.hash(
    `seed-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    10
  );

  user = await User.create({
    name: 'Community Buddy',
    username: 'community_buddy',
    email,
    passwordHash,
    role: 'patient',
    isVerified: true,
    isActive: true,
    bio: 'System account for starter anonymous community posts.',
  });

  console.log('[ForumSeed] Created community seed author user.');
  return user;
};

const seedForumPosts = async () => {
  try {
    const topics = await Topic.find();
    if (!topics.length) {
      console.log('[ForumSeed] No topics found — skipping post seed.');
      return;
    }

    const author = await ensureSeedAuthor();
    let created = 0;

    for (const topic of topics) {
      const existingSeed = await ForumPost.countDocuments({
        topicId: topic._id,
        tags: SEED_TAG,
        status: 'active',
      });

      if (existingSeed > 0) {
        continue;
      }

      const starters = STARTER_POSTS[topic.slug] || STARTER_POSTS['general-qa'];
      const docs = starters.map((post, i) => ({
        authorId: author._id,
        topicId: topic._id,
        title: post.title,
        content: post.content,
        tags: post.tags,
        type: 'text',
        isDraft: false,
        isAnonymous: true,
        likesCount: 2 + ((i + topic.slug.length) % 6),
        commentsCount: 0,
        viewsCount: 12 + ((i * 7 + topic.slug.length) % 40),
        status: 'active',
      }));

      await ForumPost.insertMany(docs);
      await Topic.findByIdAndUpdate(topic._id, {
        $inc: { postsCount: docs.length },
      });
      created += docs.length;
      console.log(`[ForumSeed] Added ${docs.length} anonymous posts → ${topic.name}`);
    }

    if (created === 0) {
      console.log('[ForumSeed] Starter posts already present — skipping.');
    } else {
      console.log(`[ForumSeed] ✅ Seeded ${created} anonymous starter posts.`);
    }
  } catch (err) {
    console.error('[ForumSeed] ❌ Failed to seed forum posts:', err.message);
  }
};

module.exports = seedForumPosts;
