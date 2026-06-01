export interface SubjectSetup {
  id: number;
  subject: string;
  abbreviation: string;
}

export interface SetupMockData {
  rooms: string[];
  subjects: SubjectSetup[];
}

const SETUP_MOCK_STORAGE_KEY = 'engineers-school-setup-mock';

export const DEFAULT_SETUP_ROOMS = ['101', '204', '305', 'Gym'];

export const DEFAULT_SETUP_SUBJECTS: SubjectSetup[] = [
  { id: 1, subject: 'Maths', abbreviation: 'MAT' },
  { id: 2, subject: 'Physics', abbreviation: 'PHY' },
  { id: 3, subject: 'P.E.', abbreviation: 'PE' },
];

export const DEFAULT_SETUP_DATA: SetupMockData = {
  rooms: DEFAULT_SETUP_ROOMS,
  subjects: DEFAULT_SETUP_SUBJECTS,
};

const isBrowser = () => typeof window !== 'undefined';

export const loadSetupMockData = (): SetupMockData => {
  if (!isBrowser()) {
    return DEFAULT_SETUP_DATA;
  }

  try {
    const storedData = window.localStorage.getItem(SETUP_MOCK_STORAGE_KEY);

    if (!storedData) {
      return DEFAULT_SETUP_DATA;
    }

    const parsedData = JSON.parse(storedData) as Partial<SetupMockData>;

    return {
      rooms: parsedData.rooms?.length ? parsedData.rooms : DEFAULT_SETUP_ROOMS,
      subjects: parsedData.subjects?.length ? parsedData.subjects : DEFAULT_SETUP_SUBJECTS,
    };
  } catch {
    return DEFAULT_SETUP_DATA;
  }
};

export const saveSetupMockData = (data: SetupMockData) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SETUP_MOCK_STORAGE_KEY, JSON.stringify(data));
};

export const mergeUniqueOptions = (baseOptions: string[], setupOptions: string[]) =>
  Array.from(new Set([...baseOptions, ...setupOptions]));
