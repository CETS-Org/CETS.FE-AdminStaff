import { startOfWeek, addDays, type BaseSession } from '@/components/schedule/scheduleUtils';
import type { ClassSession } from '@/types/timetable.type';
import type { CourseDateRange } from '@/types/course.types';

export const DAY_OF_WEEK_MAP: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
};

export const convertSessionsToBaseSession = (
  classSessions: ClassSession[],
  weekStart: Date,
  courseDateRange: CourseDateRange
): BaseSession[] => {
  const { startDate, endDate } = courseDateRange;

  return classSessions
    .filter((session) => {
      if (!session.timeSlotName || !session.dayOfWeek) return false;

      if (startDate && endDate) {
        const dayIndex = DAY_OF_WEEK_MAP[session.dayOfWeek];
        if (dayIndex !== undefined) {
          const sessionDate = new Date(weekStart);
          sessionDate.setDate(weekStart.getDate() + dayIndex);

          if (sessionDate < startDate || sessionDate > endDate) {
            return false;
          }
        }
      }

      return true;
    })
    .map((session) => {
      const dayIndex = DAY_OF_WEEK_MAP[session.dayOfWeek];
      const sessionDate = new Date(weekStart);
      sessionDate.setDate(weekStart.getDate() + dayIndex);

      const startTime = session.timeSlotName;

      return {
        id: session.id,
        title: session.courseName || 'Class Session',
        classCode: session.courseName || 'Course',
        start: `${sessionDate.toISOString().split('T')[0]}T${startTime}:00`,
        room: 'TBA',
        durationMin: 90,
      };
    });
};

export const calculateCourseDateRange = (
  startDate: string,
  endDate: string
): { startDate: Date; endDate: Date } | null => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return null;
  }

  return { startDate: start, endDate: end };
};

export const getWeekNavigationProps = (
  weekStart: Date,
  courseDateRange: CourseDateRange
) => {
  const weekEnd = addDays(weekStart, 6);
  const today = new Date();
  const todayIdx = (() => {
    const dayOfWeek = (today.getDay() + 6) % 7;
    if (today >= weekStart && today <= weekEnd) {
      return dayOfWeek;
    }
    return -1;
  })();

  const canGoPrevious = (() => {
    if (!courseDateRange.startDate) return true;
    const newWeekStart = addDays(weekStart, -7);
    const courseStartWeek = startOfWeek(courseDateRange.startDate);
    return newWeekStart >= courseStartWeek;
  })();

  const canGoNext = (() => {
    if (!courseDateRange.endDate) return true;
    const newWeekStart = addDays(weekStart, 7);
    const courseEndWeek = startOfWeek(courseDateRange.endDate);
    return newWeekStart <= courseEndWeek;
  })();

  return {
    weekEnd,
    todayIdx,
    canGoPrevious,
    canGoNext,
  };
};

