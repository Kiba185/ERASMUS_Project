import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Filter, type FilterOption } from './Filter';

const ABSENCE_STATUSES = ['Late', 'Unexcused absence', 'Excused absence'] as const;
const ABSENCE_REASONS = ['Doctor', 'Sick Leave', 'Family reasons', 'Other'] as const;

type AbsenceStatus = (typeof ABSENCE_STATUSES)[number];
type AbsenceReason = (typeof ABSENCE_REASONS)[number];

interface AttendancePopUpProps {
  isOpen: boolean;
  studentName: string;
  subjectLabel: string;
  dateLabel: string;
  initialReason?: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const isAbsenceStatus = (value: string): value is AbsenceStatus =>
  ABSENCE_STATUSES.includes(value as AbsenceStatus);

const isAbsenceReason = (value: string): value is AbsenceReason =>
  ABSENCE_REASONS.includes(value as AbsenceReason);

const parseInitialAbsence = (value: string) => {
  const [possibleStatus, ...reasonParts] = value.split(': ');
  const status = isAbsenceStatus(possibleStatus) ? possibleStatus : '';
  const reason = status ? reasonParts.join(': ') : value;

  return { status, reason };
};

const STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'Select status' },
  ...ABSENCE_STATUSES.map((status) => ({ value: status, label: status })),
];

const REASON_OPTIONS: FilterOption[] = [
  { value: '', label: 'Select reason' },
  ...ABSENCE_REASONS.map((reason) => ({ value: reason, label: reason })),
];

const AttendancePopUp = ({
  isOpen,
  studentName,
  subjectLabel,
  dateLabel,
  initialReason = '',
  onConfirm,
  onClose,
}: AttendancePopUpProps) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const parsedAbsence = parseInitialAbsence(initialReason);
    setSelectedStatus(parsedAbsence.status);

    if (isAbsenceReason(parsedAbsence.reason)) {
      setSelectedReason(parsedAbsence.reason);
      setCustomReason('');
    } else if (parsedAbsence.reason) {
      setSelectedReason('Other');
      setCustomReason(parsedAbsence.reason);
    } else {
      setSelectedReason('');
      setCustomReason('');
    }
  }, [initialReason, isOpen]);

  const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;
  const finalValue = selectedStatus && finalReason ? `${selectedStatus}: ${finalReason}` : '';

  const detailInputClassName = useMemo(
    () =>
      'h-10 rounded-md border border-palette-sage bg-palette-sage/15 px-3 text-sm text-palette-pine placeholder:text-palette-moss focus:outline-none focus:ring-2 focus:ring-palette-leaf',
    [],
  );
  const popupFilterSelectClassName =
    'border-palette-sage bg-palette-sage/15 text-palette-pine focus:ring-palette-leaf';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (finalValue) {
      onConfirm(finalValue);
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-palette-sage/45 px-4 backdrop-blur-[1px]">
      <div className="absolute h-[360px] w-[460px] rounded-full bg-palette-pine/15 blur-3xl" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-lg border border-palette-lichen/45 bg-palette-mist p-6 shadow-[0_0_55px_rgba(0,61,18,0.28)]"
      >
        <h2 className="text-xl font-bold text-palette-pine">Confirm absence</h2>
        <p className="mt-3 text-sm text-palette-moss">
          Mark <strong className="text-palette-pine">{studentName}</strong> as absent for{' '}
          <strong className="text-palette-pine">{subjectLabel}</strong> on {dateLabel}?
        </p>

        <div className="mt-5 grid gap-4">
          <Filter
            label="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={STATUS_OPTIONS}
            selectClassName={popupFilterSelectClassName}
          />
          <Filter
            label="Reason"
            value={selectedReason}
            onChange={(value) => {
              setSelectedReason(value);
              if (value !== 'Other') {
                setCustomReason('');
              }
            }}
            options={REASON_OPTIONS}
            selectClassName={popupFilterSelectClassName}
          />

          {selectedReason === 'Other' && (
            <label className="flex flex-col gap-2 text-sm font-medium text-palette-pine">
              Details
              <input
                id="other-reason"
                value={customReason}
                onChange={(event) => setCustomReason(event.target.value)}
                placeholder="Describe the reason..."
                className={detailInputClassName}
              />
            </label>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-palette-lichen px-4 py-2 text-sm font-semibold text-palette-pine hover:bg-palette-sage/15"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!finalValue}
            className="rounded-md bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark Absent
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

export default AttendancePopUp;
