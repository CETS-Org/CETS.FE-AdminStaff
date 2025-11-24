import { useEffect, useRef } from "react";

interface UseScheduleKeyboardShortcutsProps {
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onSearch?: () => void;
}

export const useScheduleKeyboardShortcuts = ({
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  onSearch,
}: UseScheduleKeyboardShortcutsProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Arrow Left: Previous week
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        onPreviousWeek();
      }
      
      // Ctrl/Cmd + Arrow Right: Next week
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        onNextWeek();
      }
      
      // Ctrl/Cmd + T: Today/Current week
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        onCurrentWeek();
      }
      
      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (onSearch) {
          onSearch();
        } else if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPreviousWeek, onNextWeek, onCurrentWeek, onSearch]);

  return { searchInputRef };
};

