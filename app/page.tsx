"use client";

import { useMemo, useState } from "react";

type HolidayString = `${number}/${number}/${number}`; // "YYYY/MM/DD" 형태(느슨하게)
type DateInputString = `${number}-${number}-${number}`; // "YYYY-MM-DD" 형태(느슨하게)

export default function Home() {
  const themes = ["light", "dark", "pink", "blue", ] as const;

  type Theme = (typeof themes)[number];

  const themeIcons: Record<Theme, string> = {
    light: "☀️",
    dark: "🌙",
    pink: "💗",
    blue: "🌊",
  };

  const [theme, setTheme] = useState<Theme>("blue");

  const changeTheme = (nextTheme: Theme): void => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const holidays = useMemo<readonly HolidayString[]>(
    () => [
      "2024/01/01",
      "2024/02/09",
      "2024/02/10",
      "2024/02/12",
      "2024/03/01",
      "2024/05/05",
      "2024/05/06",
      "2024/05/15",
      "2024/06/06",
      "2024/08/15",
      "2024/09/16",
      "2024/09/17",
      "2024/09/18",
      "2024/09/19",
      "2024/09/20",
      "2024/10/01",
      "2024/10/03",
      "2024/10/09",
      "2024/12/25",
      "2024/12/30",
      "2024/12/31",
      "2025/01/01",
      "2025/01/27",
      "2025/01/28",
      "2025/01/29",
      "2025/01/30",
      "2025/03/01",
      "2025/03/03",
      "2025/05/05",
      "2025/05/06",
      "2025/05/25",
      "2025/06/03",
      "2025/06/06",
      "2025/08/15",
      "2025/10/03",
      "2025/10/04",
      "2025/10/06",
      "2025/10/07",
      "2025/10/08",
      "2025/10/09",
      "2025/12/25",
      "2026/01/01",
      "2026/01/02",
      "2026/01/03",
      "2026/02/16",
      "2026/02/17",
      "2026/02/18",
      "2026/03/02",
      "2026/05/01",
      "2026/05/02",
      "2026/05/04",
      "2026/05/05",
      "2026/05/25",
      "2026/06/03",
      "2026/06/06",
      "2026/07/17",
      "2026/08/15",
      "2026/08/17",
      "2026/09/24",
      "2026/09/25",
      "2026/09/26",
      "2026/10/03",
      "2026/10/05",
      "2026/10/06",
      "2026/10/07",
      "2026/10/08",
      "2026/10/09",
    ],
    [],
  );

  const clearTime = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const isSunday = (date: Date): boolean => date.getDay() === 0;

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const isHoliday = (date: Date): boolean => {
    const t = clearTime(date).getTime();
    return holidays.some((h) => clearTime(new Date(h)).getTime() === t);
  };

  const countHolidaysInRange = (startDate: Date, endDate: Date): number => {
    const start = clearTime(startDate).getTime();
    const end = clearTime(endDate).getTime();

    let count = 0;
    for (const h of holidays) {
      const ht = clearTime(new Date(h)).getTime();
      if (ht >= start && ht <= end) count++;
    }
    return count;
  };

  // ✅ 순수 계산 함수 (hooks 없음)
  const calculateTerm = (startDate: Date): Date => {
    let resultDate = addDays(startDate, 84);

    // start ~ (start+84) 사이 휴일 수만큼 추가
    const holidaysCount = countHolidaysInRange(startDate, resultDate);
    resultDate = addDays(resultDate, holidaysCount);

    // 일요일이면 다음날
    if (isSunday(resultDate)) resultDate = addDays(resultDate, 1);

    // 휴일이면 휴일 아닌 날까지 + (중간에 일요일이면 또 +1)
    while (isHoliday(resultDate)) {
      resultDate = addDays(resultDate, 1);
      if (isSunday(resultDate)) resultDate = addDays(resultDate, 1);
    }

    return resultDate;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const calculatedDate = useMemo<Date>(
    () => calculateTerm(selectedDate),
    [selectedDate],
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value as DateInputString; // "YYYY-MM-DD"
    if (!value) return;

    // date input은 로컬 기준으로 해석되게 생성
    const [y, m, d] = value.split("-").map(Number);
    const newDate = new Date(y, m - 1, d);

    if (!Number.isNaN(newDate.getTime())) setSelectedDate(newDate);
  };

  const toInputValue = (date: Date): string => {
    // 로컬 날짜 기준으로 YYYY-MM-DD 만들기
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between bg-card px-16 py-32 text-card-foreground sm:items-start">
        <div className="w-full">
          <div className="fixed left-1/2 top-1/2 z-50 flex -translate-y-24 translate-x-16 gap-3">
            {themes.map((themeName) => (
              <button
                key={themeName}
                type="button"
                onClick={() => changeTheme(themeName)}
                aria-label={`Change theme to ${themeName}`}
                className={`border-none bg-transparent p-0 text-3xl transition hover:scale-110 ${
                  theme === themeName ? "scale-125" : "opacity-50"
                }`}
              >
                {themeIcons[themeName]}
              </button>
            ))}
          </div>
          <h2>Term Calculator V2 😇</h2>
          <h3 className="mb-2">Select a date:</h3>
          <input
            type="date"
            value={toInputValue(selectedDate)}
            onChange={handleDateChange}
            className="rounded border border-border bg-card px-3 py-2 text-card-foreground"
          />

          <div className="mt-4">
            <p>Term: {toInputValue(calculatedDate)}</p>
          </div>

          <div className="mt-8">
            <h3 className="mb-2">Closed</h3>

            <ul className="list-disc pl-5">
              {[...holidays].reverse().map((holiday) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const holidayDate = new Date(holiday);
                holidayDate.setHours(0, 0, 0, 0);

                const diffTime = holidayDate.getTime() - today.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                const isPast = diffDays < 0;
                const isUpcomingSoon = diffDays >= 0 && diffDays <= 7;

                const className = isPast
                  ? "line-through text-muted-light"
                  : isUpcomingSoon
                    ? "rounded-md bg-soon px-2 py-1 font-semibold text-soon-foreground"
                    : undefined;

                return (
                  <li key={holiday} className={className}>
                    {isUpcomingSoon && <span className="mr-1">💖</span>}
                    {holiday}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
