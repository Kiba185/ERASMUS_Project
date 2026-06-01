import React, { useState } from 'react';

const STUDENTS = [
  'John West',
  'Dominik Novak',
  'Richard Urban',
  'Filip Marek',
  'Anna Kralova',
  'Petr Svoboda',
  'Eva Horakova',
];

type Message = {
  id: string;
  person: string;
  subject: string;
  message: string;
  time: string;
  status?: 'new' | 'read' | 'sent';
};

const RECEIVED_MESSAGES: Message[] = [
  {
    id: 'received-1',
    person: 'MGR. John Doe',
    subject: 'Meeting reschedule',
    message: 'Hey, can we reschedule our meeting?',
    time: '2 hours ago',
    status: 'new',
  },
  {
    id: 'received-2',
    person: 'ING. Jane Smith',
    subject: 'Parent-teacher conference',
    message: "Don't forget about the parent-teacher conference next week.",
    time: '1 day ago',
    status: 'read',
  },
  {
    id: 'received-3',
    person: 'Anna Kralova',
    subject: 'Homework question',
    message: 'Can I send the worksheet later today?',
    time: '2 days ago',
    status: 'read',
  },
];

const SENT_MESSAGES: Message[] = [
  {
    id: 'sent-1',
    person: 'MGR. John Doe',
    subject: 'Re: Meeting reschedule',
    message: "Sure, let's reschedule for tomorrow.",
    time: '1 hour ago',
    status: 'sent',
  },
  {
    id: 'sent-2',
    person: 'ING. Jane Smith',
    subject: 'Re: Conference',
    message: "Thanks for the reminder! I'll be there.",
    time: '20 hours ago',
    status: 'sent',
  },
];

const statusClassNames: Record<NonNullable<Message['status']>, string> = {
  new: 'bg-palette-leaf text-white',
  read: 'bg-palette-sage/20 text-palette-moss',
  sent: 'bg-palette-mist text-palette-moss',
};

const MessagesPage: React.FC = () => {
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [recipient, setRecipient] = useState('');

  return (
    <section className="mx-auto max-w-7xl space-y-4 px-2 py-2 text-palette-pine">
      <header className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-palette-pine">Messages</h1>
            <p className="mt-1 text-sm font-medium text-palette-moss">
              Received and sent messages for school communication.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewMessageOpen((currentValue) => !currentValue)}
            aria-expanded={isNewMessageOpen}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-palette-fern px-5 text-sm font-black text-white shadow-soft transition hover:bg-palette-leaf focus:outline-none focus:ring-2 focus:ring-palette-leaf/30"
          >
            <span className="text-lg leading-none">+</span>
            New message
          </button>
        </div>
      </header>

      {isNewMessageOpen && (
        <section className="rounded-lg border border-palette-leaf/35 bg-white p-5 shadow-soft">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-black text-palette-pine">New Message</h2>
            <button
              type="button"
              onClick={() => setIsNewMessageOpen(false)}
              className="self-start rounded-md border border-palette-lichen/60 px-3 py-2 text-xs font-black text-palette-moss transition hover:border-palette-leaf hover:text-palette-pine md:self-auto"
            >
              Close
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-black uppercase tracking-wide text-palette-moss">
              Recipient
              <input
                type="search"
                list="message-recipients"
                placeholder="Search recipient..."
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                className="h-11 rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 text-sm font-semibold normal-case tracking-normal text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-black uppercase tracking-wide text-palette-moss">
              Subject
              <input
                type="text"
                placeholder="Enter subject..."
                className="h-11 rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 text-sm font-semibold normal-case tracking-normal text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
              />
            </label>
          </div>

          <datalist id="message-recipients">
            {STUDENTS.map((student) => (
              <option key={student} value={student} />
            ))}
          </datalist>

          <textarea
            placeholder="Message"
            rows={5}
            className="mt-3 w-full resize-none rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 py-3 text-sm font-medium text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <input id="message-attachment" type="file" className="hidden" />
            <label
              htmlFor="message-attachment"
              aria-label="Attach file"
              title="Attach file"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-palette-lichen/60 px-4 text-sm font-black text-palette-moss transition hover:border-palette-leaf hover:bg-palette-sage/15 hover:text-palette-pine"
            >
              Attach file
            </label>
            <button
              type="button"
              className="h-10 rounded-md bg-palette-fern px-5 text-sm font-black text-white shadow-soft transition hover:bg-palette-leaf focus:outline-none focus:ring-2 focus:ring-palette-leaf/30"
            >
              Send message
            </button>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-4 shadow-soft">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-black text-palette-pine">Received Messages</h2>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-palette-moss">
            {RECEIVED_MESSAGES.length} messages
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-palette-lichen/45 bg-white">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-palette-sage/20 text-xs font-black uppercase tracking-wide text-palette-moss">
              <tr>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-palette-lichen/35">
              {RECEIVED_MESSAGES.map((message) => (
                <tr key={message.id} className="transition hover:bg-palette-mist/60">
                  <td className="px-4 py-3 font-black text-palette-pine">{message.person}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-palette-pine">{message.subject}</span>
                      {message.status && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${statusClassNames[message.status]}`}>
                          {message.status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-md px-4 py-3 font-medium text-palette-moss">{message.message}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-palette-moss">{message.time}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="rounded-md border border-palette-leaf/50 px-4 py-2 text-xs font-black text-palette-fern transition hover:bg-palette-sage/15"
                    >
                      Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-palette-lichen/45 bg-white p-4 shadow-soft">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-black text-palette-pine">Sent Messages</h2>
          <span className="w-fit rounded-full bg-palette-mist px-3 py-1 text-xs font-black text-palette-moss">
            {SENT_MESSAGES.length} messages
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-palette-lichen/45">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-palette-mist text-xs font-black uppercase tracking-wide text-palette-moss">
              <tr>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-palette-lichen/35">
              {SENT_MESSAGES.map((message) => (
                <tr key={message.id} className="transition hover:bg-palette-mist/60">
                  <td className="px-4 py-3 font-black text-palette-pine">{message.person}</td>
                  <td className="px-4 py-3 font-bold text-palette-pine">{message.subject}</td>
                  <td className="max-w-md px-4 py-3 font-medium text-palette-moss">{message.message}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-palette-moss">{message.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default MessagesPage;
