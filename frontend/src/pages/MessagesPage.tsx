import React, { useState } from 'react';

/* pro backend tvurce toto je mockup*/
const STUDENTS = [
  'John West',
  'Dominik Novak',
  'Richard Urban',
  'Filip Marek',
  'Anna Kralova',
  'Petr Svoboda',
  'Eva Horakova',
];

const MessagesPage: React.FC = () => {
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [recipient, setRecipient] = useState('');

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-bold text-green-700">Messages</h1>
          <p className="mt-4 text-gray-600">Here you can view and manage your messages.</p>
        </div>

        <div className="flex min-w-36 items-center justify-center gap-3 rounded-lg bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setIsNewMessageOpen((currentValue) => !currentValue)}
            aria-label="New message"
            title="New message"
            aria-expanded={isNewMessageOpen}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white transition hover:bg-green-800"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {isNewMessageOpen && (
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">New Message</h2>
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-palette-pine">
              Recipient
              <input
                type="search"
                list="message-recipients"
                placeholder="Search recipient..."
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-palette-pine">
              Subject
              <input
                type="text"
                placeholder="Enter subject..."
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20"
              />
            </label>
            <datalist id="message-recipients">
              {STUDENTS.map((student) => (
                <option key={student} value={student} />
              ))}
            </datalist>
            <textarea
              placeholder="Message"
              rows={4}
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-700"
            />
            <div className="flex items-center justify-between gap-3">
              <input id="message-attachment" type="file" className="hidden" />
              <label
                htmlFor="message-attachment"
                aria-label="Attach file"
                title="Attach file"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-green-700 text-green-700 transition hover:bg-green-50"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 0 1 5.7 5.7l-8.5 8.5a2 2 0 0 1-2.8-2.8l7.8-7.8" />
                </svg>
              </label>
              <button
                type="button"
                className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Inbox</h2>
        <ul className="space-y-3">
          <li className="border-b pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">MGR. John Doe</p>
                <p className="text-sm text-gray-500">Hey, can we reschedule our meeting?</p>
              </div>
              <span className="text-sm text-gray-400">2 hours ago</span>
            </div>
          </li>
          <li className="border-b pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">ING. Jane Smith</p>
                <p className="text-sm text-gray-500">
                  Don't forget about the parent-teacher conference next week.
                </p>
              </div>
              <span className="text-sm text-gray-400">1 day ago</span>
            </div>
          </li>
        </ul>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Sent Messages</h2>
        <ul className="space-y-3">
          <li className="border-b pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">To: MGR. John Doe</p>
                <p className="text-sm text-gray-500">Sure, let's reschedule for tomorrow.</p>
              </div>
              <span className="text-sm text-gray-400">1 hour ago</span>
            </div>
          </li>
          <li className="border-b pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">To: ING. Jane Smith</p>
                <p className="text-sm text-gray-500">Thanks for the reminder! I'll be there.</p>
              </div>
              <span className="text-sm text-gray-400">20 hours ago</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default MessagesPage;
