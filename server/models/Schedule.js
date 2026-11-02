import mongoose from 'mongoose';

const DayScheduleSchema = new mongoose.Schema({
  day: { type: String, required: true }, // 'monday', 'tuesday', etc.
  label: { type: String, required: true }, // 'Monday', 'Tuesday', etc.
  isOpen: { type: Boolean, default: true },
  openTime: { type: String, default: '08:00' }, // HH:mm 24hr format
  closeTime: { type: String, default: '20:00' }, // HH:mm 24hr format
});

const ScheduleSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'weekly_operational_schedule', unique: true },
    days: [DayScheduleSchema],
    slotDurationMinutes: { type: Number, default: 30 }, // Configurable: 30 mins, 45 mins, 60 mins, etc.
    slotDurationHours: { type: Number, default: 0.5 },
  },
  { timestamps: true }
);

export const Schedule = mongoose.model('Schedule', ScheduleSchema);
