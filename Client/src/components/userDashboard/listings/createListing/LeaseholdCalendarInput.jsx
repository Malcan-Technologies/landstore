import { useEffect, useMemo, useRef, useState } from "react";
import ReactCalendar from "react-calendar";
import SelectDropdown from "@/components/common/SelectDropdown";
import Calendar from "@/components/svg/Calendar";

const buildYearOptions = (startYear) =>
  Array.from({ length: 50 }, (_, index) => {
    const year = startYear + index;
    return { value: String(year), label: String(year) };
  });

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const isSameCalendarDay = (firstDate, secondDate) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate();

const LeaseholdCalendarInput = ({ label, value, calendarYear, onChange, onCalendarYearChange }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarWrapperRef = useRef(null);
  const minSelectableDate = useMemo(() => getStartOfToday(), []);
  const yearOptions = useMemo(() => buildYearOptions(minSelectableDate.getFullYear()), [minSelectableDate]);

  const selectedDate = useMemo(() => {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }, [value]);

  const formattedDate = useMemo(() => {
    if (!selectedDate) {
      return "";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!isCalendarOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (calendarWrapperRef.current && !calendarWrapperRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isCalendarOpen]);

  useEffect(() => {
    if (!isCalendarOpen || !calendarWrapperRef.current) {
      return;
    }

    calendarWrapperRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [isCalendarOpen]);

  return (
    <div className={isCalendarOpen ? "mb-5" : ""}>
      <label className="mb-2 block text-[12px] font-medium text-gray2 sm:text-[13px]">{label}</label>
      <div ref={calendarWrapperRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            className="h-9 w-full rounded-xl border border-border-input bg-white px-3 pr-9 text-left text-[12px] text-gray2 outline-none transition hover:border-green-secondary focus:border-green-secondary sm:h-10 sm:px-3.5 sm:pr-10 sm:text-[13px] md:h-11 md:text-[14px]"
          >
            {formattedDate || "MM/DD/YYYY"}
          </button>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray5">
            <Calendar size={14} color="currentColor" />
          </span>
        </div>
        {isCalendarOpen && (
          <div className="mt-3 w-full min-w-70 rounded-sm border border-[#E6EBF0] p-2 sm:p-2.5">
            <SelectDropdown
              value={selectedDate ? String(selectedDate.getFullYear()) : calendarYear}
              onChange={(nextYear) => {
                const nextDate = selectedDate ? new Date(selectedDate) : new Date(minSelectableDate);
                nextDate.setFullYear(Number(nextYear));
                nextDate.setHours(0, 0, 0, 0);

                if (nextDate < minSelectableDate) {
                  nextDate.setTime(minSelectableDate.getTime());
                }

                onCalendarYearChange(nextYear);
                onChange(nextDate.toISOString());
              }}
              options={yearOptions}
              className="mb-2.5"
              buttonClassName="h-12 rounded-[14px] border-[#DDE3EA] px-4 text-[16px] font-medium text-gray2 sm:text-[16px]"
            />
            <div className="leasehold-date-picker rounded-2xl border border-[#E6EBF0] bg-white px-2 py-3 shadow-[0px_8px_20px_rgba(15,61,46,0.06)] sm:px-3 sm:py-4">
              <ReactCalendar
                value={selectedDate}
                onChange={(nextValue) => {
                  const nextDate = Array.isArray(nextValue) ? nextValue[0] : nextValue;
                  if (!nextDate) {
                    onChange("");
                    return;
                  }

                  const normalizedDate = new Date(nextDate);
                  normalizedDate.setHours(0, 0, 0, 0);

                  if (selectedDate && isSameCalendarDay(normalizedDate, selectedDate)) {
                    onChange("");
                    setIsCalendarOpen(false);
                    return;
                  }

                  if (normalizedDate < minSelectableDate) {
                    onChange("");
                    setIsCalendarOpen(false);
                    return;
                  }

                  onCalendarYearChange(String(normalizedDate.getFullYear()));
                  onChange(normalizedDate.toISOString());
                  setIsCalendarOpen(false);
                }}
                minDate={minSelectableDate}
                next2Label={null}
                prev2Label={null}
                showNeighboringMonth
              />
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .leasehold-date-picker .react-calendar {
          width: 100%;
          border: 0;
          background: transparent;
          font-family: inherit;
        }

        .leasehold-date-picker .react-calendar__navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          gap: 0.5rem;
        }

        .leasehold-date-picker .react-calendar__navigation button {
          min-width: 2.5rem;
          height: 2.5rem;
          border: 1px solid #dbe4ee;
          border-radius: 0.75rem;
          background: #ffffff;
          color: #111827;
          font-size: 1.125rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .leasehold-date-picker .react-calendar__navigation__label {
          flex: 1 1 auto !important;
          min-width: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          pointer-events: none;
        }

        .leasehold-date-picker .react-calendar__navigation__label__labelText {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .leasehold-date-picker .react-calendar__navigation__prev2-button,
        .leasehold-date-picker .react-calendar__navigation__next2-button {
          display: none;
        }

        .leasehold-date-picker .react-calendar__month-view__weekdays {
          margin-bottom: 0.75rem;
          text-align: center;
          font-size: 0.625rem;
          font-weight: 400;
          color: #4b5563;
          text-transform: none;
        }

        .leasehold-date-picker .react-calendar__month-view__weekdays abbr {
          text-decoration: none;
        }

        .leasehold-date-picker .react-calendar__tile {
          height: 2.5rem;
          max-width: 100%;
          border-radius: 0.5rem;
          background: transparent;
          font-size: 0.875rem;
          font-weight: 400;
          color: #111827;
        }

        .leasehold-date-picker .react-calendar__tile:enabled:hover,
        .leasehold-date-picker .react-calendar__tile:enabled:focus {
          background: #f3f4f6;
        }

        .leasehold-date-picker .react-calendar__tile--active,
        .leasehold-date-picker .react-calendar__tile--active:enabled:hover,
        .leasehold-date-picker .react-calendar__tile--active:enabled:focus {
          background: #2f2f2f;
          color: #ffffff;
        }

        .leasehold-date-picker .react-calendar__month-view__days__day--neighboringMonth {
          color: #b8bec8;
        }

        .leasehold-date-picker .react-calendar__month-view__days {
          row-gap: 0.2rem;
        }

        @media (min-width: 640px) {
          .leasehold-date-picker .react-calendar__navigation {
            margin-bottom: 0.75rem;
          }

          .leasehold-date-picker .react-calendar__tile {
            height: 2.75rem;
            font-size: 0.9375rem;
          }

          .leasehold-date-picker .react-calendar__month-view__weekdays {
            font-size: 0.75rem;
          }

          .leasehold-date-picker .react-calendar__navigation__label {
            font-size: 1.125rem;
          }

          .leasehold-date-picker .react-calendar__navigation button {
            min-width: 2.625rem;
            height: 2.625rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LeaseholdCalendarInput;
