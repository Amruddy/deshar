"use client";

import { useRef, useState } from "react";
import type { TeacherGroupJournalData } from "@/app/lib/data/supabase-read";

type JournalGridProps = {
  data: TeacherGroupJournalData;
  saveAction: (formData: FormData) => Promise<void>;
};

type SaveState = "idle" | "saving" | "saved" | "error";

function saveStateText(state: SaveState) {
  if (state === "saving") {
    return "Сохраняется";
  }

  if (state === "saved") {
    return "Сохранено";
  }

  if (state === "error") {
    return "Не удалось сохранить";
  }

  return "Автосохранение";
}

export function JournalGrid({ data, saveAction }: JournalGridProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  function scheduleSave() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void saveJournal();
    }, 650);
  }

  async function saveJournal() {
    const form = formRef.current;

    if (!form) {
      return;
    }

    setSaveState("saving");

    try {
      await saveAction(new FormData(form));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <form className="journal-form" ref={formRef}>
      <input name="month" type="hidden" value={data.monthValue} />
      <div className="journal-table-wrap">
        <table className="journal-table">
          <thead>
            <tr>
              <th className="journal-student-head">Ученики</th>
              {data.lessons.map((lesson) => (
                <th className={lesson.isWeekStart ? "week-start" : undefined} key={lesson.id}>
                  <a className="journal-lesson-link" href={`/teacher/lessons/${lesson.id}`}>
                    <span>{lesson.weekday}</span>
                    <strong>{lesson.day}</strong>
                    <em>{lesson.timeRange}</em>
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.students.map((student) => (
              <tr key={student.id}>
                <th className="journal-student-name" scope="row">
                  {student.name}
                </th>
                {data.lessons.map((lesson, lessonIndex) => {
                  const cell = student.cells[lessonIndex];
                  const inputId = `mark-${lesson.id}-${student.id}`;

                  return (
                    <td
                      className={lesson.isWeekStart ? "week-start" : undefined}
                      data-attendance={cell.attendanceTone}
                      data-label={`${lesson.weekday} ${lesson.day}, ${lesson.timeRange}`}
                      data-future={cell.isFuture ? "true" : undefined}
                      key={cell.id}
                    >
                      <div className="journal-cell">
                        <label className="visually-hidden" htmlFor={inputId}>
                          {student.name}, {lesson.day}
                        </label>
                        <input
                          aria-label={`${student.name}, ${lesson.day}`}
                          className="journal-cell-input"
                          defaultValue={cell.markValue}
                          id={inputId}
                          maxLength={2}
                          name={`mark__${cell.lessonId}__${cell.studentId}`}
                          onBlur={() => void saveJournal()}
                          onChange={scheduleSave}
                          placeholder="-"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="journal-meta">
        <div className="journal-legend" aria-label="Обозначения журнала">
          <span>П - присутствовал</span>
          <span>Н - отсутствовал</span>
          <span>У - уважительная причина</span>
        </div>
        <p className="journal-save-state" aria-live="polite" data-state={saveState}>
          {saveStateText(saveState)}
        </p>
      </div>
    </form>
  );
}
