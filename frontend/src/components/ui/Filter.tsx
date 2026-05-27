export const ALL_FILTER_VALUE = 'all';

export interface FilterOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

interface FilterProps<TValue extends string = string> {
  label?: string;
  value: TValue;
  onChange: (value: TValue) => void;
  options: FilterOption<TValue>[];
  className?: string;
  selectClassName?: string;
}

export const createFilterOptions = <TItem,>(
  items: TItem[],
  getValue: (item: TItem) => string,
  getLabel: (value: string) => string = (value) => value,
  allLabel = 'All',
): FilterOption[] => {
  const values = Array.from(new Set(items.map(getValue).filter(Boolean)));

  return [
    { value: ALL_FILTER_VALUE, label: allLabel },
    ...values.map((value) => ({
      value,
      label: getLabel(value),
    })),
  ];
};

export const filterItemsByValue = <TItem,>(
  items: TItem[],
  selectedValue: string,
  getValue: (item: TItem) => string,
  allValue = ALL_FILTER_VALUE,
): TItem[] => {
  if (selectedValue === allValue) {
    return items;
  }

  return items.filter((item) => getValue(item) === selectedValue);
};

export const Filter = <TValue extends string = string,>({
  label = 'Filter',
  value,
  onChange,
  options,
  className = '',
  selectClassName = '',
}: FilterProps<TValue>) => {
  return (
    <label className={`flex flex-col gap-2 text-sm font-medium text-palette-pine ${className}`}>
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
        className={`h-10 rounded-md border border-palette-lichen/80 bg-palette-mist px-3 text-sm text-palette-pine focus:outline-none focus:ring-2 focus:ring-palette-leaf ${selectClassName}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
