import {
  Droplets,
  Utensils,
  Syringe,
  Pill,
  GlassWater,
  Moon,
  Smile,
} from 'lucide-react';
import WalkingPerson from '../../components/icons/WalkingPerson';

export const LOG_TYPES = [
  {
    id: 'glucose',
    path: 'glucose',
    apiPath: 'glucose',
    label: 'Blood glucose',
    icon: Droplets,
    hubLine: 'Record your glucose readings.',
    tip: 'Log your reading as soon as you measure it and choose the correct context for more accurate insights.',
  },
  {
    id: 'meal',
    path: 'meal',
    apiPath: 'meal',
    label: 'Meals & nutrition',
    icon: Utensils,
    hubLine: 'Record meals and track nutrition.',
    tip: 'Need help? Open Toolbox → Nutrition Calculator, then enter the numbers here.',
  },
  {
    id: 'insulin',
    path: 'insulin',
    apiPath: 'insulin',
    label: 'Insulin',
    icon: Syringe,
    hubLine: 'Record insulin dose and injection details.',
    tip: 'Log the dose you took, with type and reason. Do not change prescribed doses here.',
  },
  {
    id: 'medication',
    path: 'medication',
    apiPath: 'medication',
    label: 'Medications',
    icon: Pill,
    hubLine: 'Log medication name, dose, and status.',
    tip: 'Mark taken, missed, or skipped so adherence is clear at your next visit.',
  },
  {
    id: 'water',
    path: 'water',
    apiPath: 'water',
    label: 'Water intake',
    icon: GlassWater,
    hubLine: 'Track your daily water intake.',
    tip: 'Use a quick-add glass or enter ounces — small sips add up toward your daily goal.',
  },
  {
    id: 'exercise',
    path: 'exercise',
    apiPath: 'exercise',
    label: 'Exercise',
    icon: WalkingPerson,
    hubLine: 'Record workouts and daily activity.',
    tip: 'Log duration and intensity soon after you finish — it helps link movement to glucose patterns.',
  },
  {
    id: 'sleep',
    path: 'sleep',
    apiPath: 'sleep',
    label: 'Sleep',
    icon: Moon,
    hubLine: 'Track your sleep and sleep quality.',
    tip: 'Confirm bedtime and wake time — duration is calculated for you. Quality helps spot rest trends.',
  },
  {
    id: 'mood',
    path: 'mood',
    apiPath: 'mood',
    label: 'Mood & stress',
    icon: Smile,
    hubLine: 'Record your mood and stress level.',
    tip: 'A quick mood and stress check can explain glucose swings that meals alone do not.',
  },
];

export function getLogType(pathOrId) {
  return LOG_TYPES.find((t) => t.path === pathOrId || t.id === pathOrId) || null;
}
