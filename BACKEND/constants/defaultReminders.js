/**
 * Default Reminders Constant Definitions
 * Used for auto-seeding new users and validating default reminder rules.
 */

const DEFAULT_REMINDERS = [
  {
    title: 'Take Insulin',
    icon: '💉',
    defaultTime: '08:00',
    repeat: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    appointmentDate: null,
  },
  {
    title: 'Take Medicine',
    icon: '💊',
    defaultTime: '09:00',
    repeat: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    appointmentDate: null,
  },
  {
    title: 'Check Blood Glucose',
    icon: '🩸',
    defaultTime: '07:00',
    repeat: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    appointmentDate: null,
  },
  {
    title: 'Bedtime',
    icon: '🌙',
    defaultTime: '22:00',
    repeat: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    appointmentDate: null,
  },
  {
    title: 'Doctor Appointment',
    icon: '📅',
    defaultTime: '',
    repeat: 'custom',
    days: [],
    appointmentDate: null,
  },
];

const DEFAULT_TITLES = DEFAULT_REMINDERS.map((r) => r.title);

module.exports = {
  DEFAULT_REMINDERS,
  DEFAULT_TITLES,
};
