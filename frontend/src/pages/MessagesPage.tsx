import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type Message = {
  id: number;
  person: string;
  subject: string;
  message: string;
  time: string;
  status?: 'new' | 'read' | 'sent';
  senderId?: number;
  recipientId?: number;
};


const statusClassNames: Record<NonNullable<Message['status']>, string> = {
  new: 'bg-palette-leaf text-white',
  read: 'bg-palette-sage/20 text-palette-moss',
  sent: 'bg-palette-mist text-palette-moss',
};

const MessagesPage: React.FC = () => {
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read'>('all');
  const [sortField, setSortField] = useState<'time' | 'person' | 'subject'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [receivedMessagesList, setReceivedMessagesList] = useState<Message[]>([]);
  const [sentMessagesList, setSentMessagesList] = useState<Message[]>([]);
  const [recipients, setRecipients] = useState<{ id: number; firstName: string; lastName: string; role?: string }[]>([]);
  const [recipientSelected, setRecipientSelected] = useState(false);
  const recipientDropdownRef = useRef<HTMLDivElement>(null);
  const [classes, setClasses] = useState<{ id: number; name: string; students: { id: number }[] }[]>([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    loading && setLoading(true);
    try {
      const [inboxRes, sentRes, recipientsRes, classesRes] = await Promise.all([
        fetch('http://localhost:3000/api/messages/inbox', { credentials: 'include' }),
        fetch('http://localhost:3000/api/messages/sent', { credentials: 'include' }),
        fetch('http://localhost:3000/api/messages/recipients', { credentials: 'include' }),
        fetch('http://localhost:3000/api/messages/classes', { credentials: 'include' }),

      ]);
      const inbox = await inboxRes.json();
      const sent = await sentRes.json();
      const recipientsList = await recipientsRes.json();
      const classesList = await classesRes.json();
      setClasses(Array.isArray(classesList) ? classesList : []);

      setReceivedMessagesList(inbox.map((m: any) => {
        const parts = m.body.split('\n');
        const hasSubject = parts[0].startsWith('**') && parts[0].endsWith('**');
        return {
          id: m.id,
          person: `${m.sender?.firstName} ${m.sender?.lastName}`,
          subject: hasSubject ? parts[0].replace(/\*\*/g, '') : '—',
          message: hasSubject ? parts.slice(1).join('\n') : m.body,
          time: new Date(m.createdAt).toLocaleString(),
          status: m.read ? 'read' : 'new',
          senderId: m.senderId,
        };
      }));

      setSentMessagesList(sent.map((m: any) => {
        const parts = m.body.split('\n');
        const hasSubject = parts[0].startsWith('**') && parts[0].endsWith('**');
        return {
          id: m.id,
          person: `${m.recipient?.firstName} ${m.recipient?.lastName}`,
          subject: hasSubject ? parts[0].replace(/\*\*/g, '') : '—',
          message: hasSubject ? parts.slice(1).join('\n') : m.body,
          time: new Date(m.createdAt).toLocaleString(),
          status: 'sent',
          recipientId: m.recipientId,
        };
      }));

      setRecipients(recipientsList);
    } catch {
      error && setError('Failed to load messages');
      console.error('Failed to load messages');
    }

    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (recipientDropdownRef.current && !recipientDropdownRef.current.contains(e.target as Node)) {
        setRecipientSelected(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { fetchMessages(); }, []);
  const parseTime = (t: string) => {
    if (t.includes('hour')) return parseInt(t) || 0;
    if (t.includes('day')) return (parseInt(t) || 0) * 24;
    return 0;
  };

  const filteredReceived = useMemo(() => {
    let result = receivedMessagesList;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.subject.toLowerCase().includes(q) || m.person.toLowerCase().includes(q) || m.message.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      result = result.filter(m => m.status === filterStatus);
    }
    result = [...result].sort((a, b) => {
      if (sortField === 'time') {
        const diff = parseTime(a.time) - parseTime(b.time);
        return sortOrder === 'asc' ? diff : -diff;
      }
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return result;
  }, [searchQuery, filterStatus, sortField, sortOrder, receivedMessagesList]);

  const filteredSent = useMemo(() => {
    let result = sentMessagesList;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.subject.toLowerCase().includes(q) || m.person.toLowerCase().includes(q) || m.message.toLowerCase().includes(q));
    }
    if (filterStatus === 'new' || filterStatus === 'read') {
      return []; // Sent messages don't have new/read status in our mock
    }
    result = [...result].sort((a, b) => {
      if (sortField === 'time') {
        const diff = parseTime(a.time) - parseTime(b.time);
        return sortOrder === 'asc' ? diff : -diff;
      }
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return result;
  }, [searchQuery, filterStatus, sortField, sortOrder, receivedMessagesList]);

  const handleReply = (msg: Message) => {
    setRecipient(msg.person);
    setSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
    setMessageText('');
    setAttachment(null);
    setIsNewMessageOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendMessage = async () => {

    console.log('recipient value:', JSON.stringify(recipient));
    if (!recipient.trim() || !messageText.trim()) {
      alert('Please fill in the recipient and message.');
      return;
    }

    let payload: { recipientId?: number; recipientIds?: number[]; body: string } = {
      body: subject ? `**${subject}**\n${messageText}` : messageText
    };
    if (recipient === 'Everyone') {
      payload.recipientIds = recipients.map(r => r.id);
    } else if (recipient.startsWith('Class: ')) {
      const className = recipient.replace('Class: ', '');
      const cls = classes.find(c => c.name === className);
      if (cls) {
        payload.recipientIds = cls.students.map(s => s.id);
      }
    } else if (recipient === 'All Teachers') {
      payload.recipientIds = recipients.filter(r => r.role === 'teacher').map(r => r.id);
    } else if (recipient === 'All Students') {
      payload.recipientIds = recipients.filter(r => r.role === 'student').map(r => r.id);
    } else {
      const recipientUser = recipients.find(r => `${r.firstName} ${r.lastName}` === recipient.trim());
      if (!recipientUser) {
        alert('Recipient not found. Please select from the list.');
        return;
      }
      payload.recipientId = recipientUser.id;
    }

    setSending(true);
    try {
      const res = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setIsNewMessageOpen(false);
      setRecipient('');
      setSubject('');
      setMessageText('');
      setAttachment(null);
      await fetchMessages();
    } catch {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedMessageId(prev => prev === id ? null : id);
  };

  if (loading) return (
    <div className="flex items-center justify-center gap-3 p-12 text-palette-pine font-bold text-lg">
      <svg className="w-6 h-6 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading messages...
    </div>
  );

  if (error) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-red-600 font-bold">{error}</p>
      <button onClick={fetchMessages} className="px-5 py-2.5 bg-palette-fern text-white font-bold rounded-xl hover:bg-palette-leaf transition">
        Retry
      </button>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl space-y-4 px-2 py-2 text-palette-pine">

      {sending && createPortal(
        <div className="fixed inset-0 bg-palette-pine/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-palette-fern border-t-transparent rounded-full animate-spin"></div>
            <p className="text-palette-pine font-bold text-lg">Sending...</p>
          </div>
        </div>,
        document.body
      )}

      <header className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-palette-pine">Messages</h1>
            <p className="mt-1 text-sm font-medium text-palette-moss">
              Received and sent messages for school communication.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsNewMessageOpen((currentValue) => !currentValue)}
              aria-expanded={isNewMessageOpen}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-palette-fern px-5 text-sm font-black text-white shadow-soft transition hover:bg-palette-leaf focus:outline-none focus:ring-2 focus:ring-palette-leaf/30"
            >
              <span className="text-lg leading-none">+</span>
              New message
            </button>
            <button
              type="button"
              onClick={fetchMessages}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-palette-lichen/60 bg-white px-4 text-sm font-black text-palette-moss shadow-soft transition hover:bg-palette-mist hover:text-palette-pine"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow-soft border border-palette-lichen/45">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Search in messages, subjects, senders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-md border border-palette-lichen/60 bg-gray-50 px-3 text-sm font-medium text-palette-pine outline-none transition focus:bg-white focus:border-palette-leaf focus:ring-2 focus:ring-palette-leaf/20"
          />
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="h-10 rounded-md border border-palette-lichen/60 bg-gray-50 px-3 text-sm font-bold text-palette-pine outline-none transition focus:bg-white focus:border-palette-leaf focus:ring-2 focus:ring-palette-leaf/20"
          >
            <option value="all">All Status</option>
            <option value="new">Unread (New)</option>
            <option value="read">Read</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="h-10 rounded-md border border-palette-lichen/60 bg-gray-50 px-3 text-sm font-bold text-palette-pine outline-none transition focus:bg-white focus:border-palette-leaf focus:ring-2 focus:ring-palette-leaf/20"
          >
            <option value="time">Sort by Time</option>
            <option value="person">Sort by Person</option>
            <option value="subject">Sort by Subject</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="h-10 px-3 flex items-center justify-center rounded-md border border-palette-lichen/60 bg-gray-50 text-sm font-black text-palette-moss transition hover:bg-palette-mist hover:text-palette-pine"
            title="Toggle sort order"
          >
            {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
          </button>
        </div>
      </div>

      {isNewMessageOpen && (
        <section className="rounded-lg border border-palette-leaf/35 bg-white p-5 shadow-soft">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-black text-palette-pine">New Message</h2>
            <button
              type="button"
              onClick={() => {
                setIsNewMessageOpen(false);
                setRecipient('');
                setSubject('');
                setMessageText('');
                setAttachment(null);
              }}
              className="self-start rounded-md border border-palette-lichen/60 px-3 py-2 text-xs font-black text-palette-moss transition hover:border-palette-leaf hover:text-palette-pine md:self-auto"
            >
              Close
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-black uppercase tracking-wide text-palette-moss">
              Recipient
              <div className="relative" ref={recipientDropdownRef}>
                <input
                  type="text"
                  placeholder="Search recipient..."
                  value={recipient}
                  onChange={(e) => { setRecipient(e.target.value); setRecipientSelected(false); }}
                  className="h-11 w-full rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 text-sm font-semibold text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
                />
                {!recipientSelected && recipient !== 'Everyone' && recipient !== 'All Teachers' && recipient !== 'All Students' && (
                  <ul className="absolute z-10 mt-1 w-full rounded-md border border-palette-lichen/60 bg-white shadow-lg max-h-64 overflow-y-auto">
                    {['Everyone', 'All Teachers', 'All Students']
                      .filter(opt => opt.toLowerCase().includes(recipient.toLowerCase()) || recipient === '')
                      .map(opt => (
                        <li
                          key={opt}
                          onClick={() => { setRecipient(opt); setRecipientSelected(true); }}
                          className="cursor-pointer px-3 py-2 text-sm font-black text-palette-fern hover:bg-palette-mist"
                        >
                          {opt}
                        </li>
                      ))
                    }
                    {classes
                      .filter(c => c.name.toLowerCase().includes(recipient.toLowerCase()) || recipient === '')
                      .map(c => (
                        <li
                          key={`class-${c.id}`}
                          onClick={() => { setRecipient(`Class: ${c.name}`); setRecipientSelected(true); }}
                          className="cursor-pointer px-3 py-2 text-sm font-black text-palette-fern hover:bg-palette-mist"
                        >
                          Class: {c.name}
                        </li>
                      ))
                    }
                    {recipients
                      .filter(r => `${r.firstName} ${r.lastName}`.toLowerCase().includes(recipient.toLowerCase()))
                      .map(r => (
                        <li
                          key={r.id}
                          onClick={() => { setRecipient(`${r.firstName} ${r.lastName}`); setRecipientSelected(true); }}
                          className="cursor-pointer px-3 py-2 text-sm text-palette-pine hover:bg-palette-mist"
                        >
                          {r.firstName} {r.lastName} <span className="text-palette-moss">({r.role})</span>
                        </li>
                      ))
                    }
                  </ul>
                )}
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-black uppercase tracking-wide text-palette-moss">
              Subject
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Enter subject..."
                className="h-11 rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 text-sm font-semibold normal-case tracking-normal text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
              />
            </label>
          </div>
          <datalist id="message-recipients">
            {recipients.map((r) => (
              <option key={r.id} value={`${r.firstName} ${r.lastName}`} />
            ))}
          </datalist>

          <textarea
            placeholder="Message"
            rows={5}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="mt-3 w-full resize-none rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 py-3 text-sm font-medium text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                id="message-attachment"
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setAttachment(e.target.files[0]);
                  }
                }}
              />
              <label
                htmlFor="message-attachment"
                aria-label="Attach file"
                title="Attach file"
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-palette-lichen/60 px-4 text-sm font-black text-palette-moss transition hover:border-palette-leaf hover:bg-palette-sage/15 hover:text-palette-pine"
              >
                Attach file
              </label>
              {attachment && (
                <div className="flex items-center gap-2 rounded-full bg-palette-mist px-3 py-1 text-xs font-black text-palette-moss">
                  <span>{attachment.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove attachment"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSendMessage}
              className="h-10 rounded-md bg-palette-fern px-5 text-sm font-black text-white shadow-soft transition hover:bg-palette-leaf focus:outline-none focus:ring-2 focus:ring-palette-leaf/30"
            >
              {sending ? 'Sending...' : 'Send message'}
            </button>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-4 shadow-soft">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-black text-palette-pine">Received Messages</h2>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-palette-moss">
            {filteredReceived.length} messages
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
              {filteredReceived.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-palette-moss font-medium">No messages found.</td></tr>
              )}
              {filteredReceived.map((message) => (
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
                  <td className="px-4 py-3 font-medium text-palette-moss cursor-pointer group" onClick={() => toggleExpand(message.id)}>
                    <div className="flex flex-col gap-1">
                      <div className={`transition-all duration-300 ${expandedMessageId === message.id ? "whitespace-pre-wrap" : "line-clamp-1"}`}>
                        {message.message}
                      </div>
                      {expandedMessageId === message.id ? (
                        <div className="text-[10px] uppercase font-black tracking-wider text-palette-fern/70">
                          Click to collapse
                        </div>
                      ) : message.message.length > 50 ? (
                        <div className="text-[10px] uppercase font-black tracking-wider text-palette-moss/50 group-hover:text-palette-fern/70 transition-colors">
                          Click to expand
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-palette-moss">{message.time}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReply(message); }}
                      type="button"
                      className="rounded-md border border-palette-leaf/50 px-4 py-2 text-xs font-black text-palette-fern transition hover:bg-palette-sage/15 hover:bg-palette-leaf hover:text-white"
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
            {filteredSent.length} messages
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
              {filteredSent.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-palette-moss font-medium">No sent messages found.</td></tr>
              )}
              {filteredSent.map((message) => (
                <tr key={message.id} className="transition hover:bg-palette-mist/60">
                  <td className="px-4 py-3 font-black text-palette-pine">{message.person}</td>
                  <td className="px-4 py-3 font-bold text-palette-pine">{message.subject}</td>
                  <td className="max-w-md px-4 py-3 font-medium text-palette-moss cursor-pointer group" onClick={() => toggleExpand(message.id)}>
                    <div className={`transition-all duration-300 ${expandedMessageId === message.id ? "" : "line-clamp-1"}`}>
                      {message.message}
                    </div>
                    {expandedMessageId === message.id && (
                      <div className="mt-2 text-[10px] uppercase font-black tracking-wider text-palette-fern/70">
                        Click to collapse
                      </div>
                    )}
                    {expandedMessageId !== message.id && message.message.length > 50 && (
                      <div className="mt-1 text-[10px] uppercase font-black tracking-wider text-palette-moss/50 group-hover:text-palette-fern/70 transition-colors">
                        Click to expand
                      </div>
                    )}
                  </td>
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
