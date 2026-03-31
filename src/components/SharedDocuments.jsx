
import React, { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { FileText, Image as ImageIcon, BookOpen, Clock, User, Sparkles, ChevronDown, ChevronUp, Download, Search } from 'lucide-react'

// ─── Shared Card ──────────────────────────────────────────────────────────────

function SharedDocCard({ doc, onSummarize, isSummarizing, activeSummaryId, onToggleSummary, isSummaryVisible, onAskQuestion, chatQuestion, onQuestionChange, chatAnswers, isAsking }) {
    const [hovered, setHovered] = useState(false)

    const getIcon = (mimeType, fileName) => {
        if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) return FileText;
        if (mimeType?.startsWith('image/') || fileName?.match(/\.(jpg|jpeg|png|gif)$/i)) return ImageIcon;
        return BookOpen;
    }

    const Icon = getIcon(doc.mimeType, doc.fileName)
    const docId = doc._id || doc.id;
    const isThisDocSummarizing = isSummarizing && activeSummaryId === docId;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', flexDirection: 'column', gap: 14,
                padding: '20px', borderRadius: 14,
                background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                border: hovered ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.2s',
                backdropFilter: 'blur(12px)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none'
                    }}
                >
                    <Icon size={18} color="#9ca3af" />
                </a>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6', marginBottom: 4, textDecoration: 'none', display: 'block' }}
                    >
                        {doc.originalName}
                    </a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{
                            fontSize: 9, fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em',
                            padding: '2px 6px', borderRadius: 4,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#9ca3af',
                        }}>
                            {doc.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                    </div>
                </div>

                <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        padding: '6px 10px', borderRadius: 6,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#9ca3af', display: 'flex', alignItems: 'center',
                        textDecoration: 'none', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    <Download size={14} />
                </a>
            </div>

            {/* AI Summary/Chat Toggle */}
            <div style={{ marginTop: 4 }}>
                {!doc.aiSummary && !isThisDocSummarizing ? (
                    <button onClick={() => onSummarize(docId)} style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        padding: '9px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#9ca3af', fontSize: 11,
                        fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em',
                        cursor: 'pointer', transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#e5e7eb' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#9ca3af' }}
                    >
                        <Sparkles size={11} /> ✨ Generate AI Summary
                    </button>
                ) : doc.aiSummary && !isThisDocSummarizing ? (
                    <button
                        onClick={() => onToggleSummary(docId)}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                            padding: '9px', borderRadius: 8,
                            background: isSummaryVisible ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: isSummaryVisible ? '#f3f4f6' : '#6b7280', fontSize: 11,
                            fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        {isSummaryVisible ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        {isSummaryVisible ? 'Hide Summary' : 'Show Summary'}
                    </button>
                ) : isThisDocSummarizing ? (
                    <div style={{
                        padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'
                    }}>
                        <span style={{ fontSize: 10, color: '#4b5563', fontFamily: "'DM Mono',monospace" }}>Gemini is analyzing...</span>
                    </div>
                ) : null}

                {doc.aiSummary && isSummaryVisible && (
                    <div style={{
                        padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)', position: 'relative', marginTop: 12
                    }}>
                        <div className="markdown-summary" style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>
                            <ReactMarkdown components={{
                                p: ({ node, ...props }) => <p style={{ marginBottom: '8px' }} {...props} />,
                                ul: ({ node, ...props }) => <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '8px' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />,
                                h3: ({ node, ...props }) => <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#f3f4f6', marginTop: '12px', marginBottom: '6px' }} {...props} />,
                                strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold', color: '#818cf8' }} {...props} />
                            }}>
                                {doc.aiSummary}
                            </ReactMarkdown>
                        </div>
                        <div style={{
                            position: 'absolute', top: -8, right: 10, padding: '2px 8px',
                            background: '#1f2937', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: 8, color: '#6b7280', fontFamily: "'DM Mono',monospace"
                        }}>AI SUMMARY</div>

                        {/* Chat Section */}
                        <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    placeholder="Ask a question..."
                                    value={chatQuestion[docId] || ''}
                                    onChange={(e) => onQuestionChange(docId, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isAsking && (chatQuestion[docId] || '').trim()) {
                                            onAskQuestion(docId);
                                        }
                                    }}
                                    style={{
                                        flex: 1, padding: '8px 12px', borderRadius: 8,
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#f3f4f6', fontSize: 11, outline: 'none',
                                    }}
                                />
                                <button
                                    onClick={() => onAskQuestion(docId)}
                                    disabled={isAsking || !(chatQuestion[docId] || '').trim()}
                                    style={{
                                        padding: '8px 12px', borderRadius: 8,
                                        background: (isAsking || !(chatQuestion[docId] || '').trim()) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: (isAsking || !(chatQuestion[docId] || '').trim()) ? '#374151' : '#e5e7eb',
                                        fontSize: 10, fontFamily: "'DM Mono',monospace",
                                        cursor: (isAsking || !(chatQuestion[docId] || '').trim()) ? 'default' : 'pointer',
                                    }}
                                >
                                    {isAsking && activeSummaryId === docId ? '...' : 'Ask'}
                                </button>
                            </div>
                            {chatAnswers[docId] && (
                                <div style={{ marginTop: 12, padding: '10px', borderRadius: 8, background: 'rgba(129,140,248,0.03)', border: '1px solid rgba(129,140,248,0.1)' }}>
                                    <div className="markdown-summary" style={{ fontSize: 10.5, color: '#d1d5db', lineHeight: 1.6 }}>
                                        <ReactMarkdown components={{
                                            p: ({ node, ...props }) => <p style={{ marginBottom: '6px' }} {...props} />,
                                            ul: ({ node, ...props }) => <ul style={{ listStyleType: 'disc', paddingLeft: '16px', marginBottom: '6px' }} {...props} />,
                                            li: ({ node, ...props }) => <li style={{ marginBottom: '3px' }} {...props} />,
                                            h3: ({ node, ...props }) => <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#f3f4f6', marginTop: '10px', marginBottom: '4px' }} {...props} />,
                                            strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold', color: '#818cf8' }} {...props} />
                                        }}>
                                            {chatAnswers[docId]}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Shared By */}
            <div style={{
                marginTop: 'auto', paddingTop: 14,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: 10
            }}>
                <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600, color: '#9ca3af'
                }}>
                    {doc.uploader?.name?.[0]?.toUpperCase() || 'P'}
                </div>
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        👤 Shared by: <span style={{ color: '#9ca3af', fontWeight: 500 }}>{doc.uploader?.name}</span>
                    </p>
                    <p style={{ fontSize: 9, color: '#374151' }}>{doc.uploader?.designation} · {doc.uploader?.department}</p>
                </div>
            </div>
        </div>
    )
}

// ─── SharedDocuments Page ─────────────────────────────────────────────────────

export default function SharedDocuments() {
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSummarizing, setIsSummarizing] = useState(false)
    const [activeSummaryId, setActiveSummaryId] = useState(null)
    const [visibleSummaries, setVisibleSummaries] = useState({})
    const [chatQuestion, setChatQuestion] = useState({})
    const [chatAnswers, setChatAnswers] = useState({})
    const [isAsking, setIsAsking] = useState(false)

    // Filter states
    const [timeFilter, setTimeFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [uploaderFilter, setUploaderFilter] = useState('')

    useEffect(() => {
        const fetchShared = async () => {
            try {
                const token = localStorage.getItem('codec_token')
                const url = `http://localhost:5050/api/documents/shared?time=${timeFilter}&type=${typeFilter}&uploaderId=${uploaderFilter}`
                const res = await fetch(url, {
                    headers: { Authorization: 'Bearer ' + token }
                })
                if (res.ok) {
                    const data = await res.json()
                    setDocs(data)
                }
            } catch (err) {
                console.error("Fetch shared error", err)
            } finally {
                setLoading(false)
            }
        }
        fetchShared()
    }, [timeFilter, typeFilter, uploaderFilter])

    const handleSummarize = async (docId) => {
        setIsSummarizing(true);
        setActiveSummaryId(docId);
        try {
            const token = localStorage.getItem('codec_token');
            const res = await fetch(`http://localhost:5050/api/documents/${docId}/summarize`, {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + token },
            });
            const data = await res.json();
            if (res.ok) {
                setDocs(prev => prev.map(doc => {
                    const id = doc._id || doc.id;
                    return id === docId ? { ...doc, aiSummary: data.summary } : doc;
                }));
                setVisibleSummaries(prev => ({ ...prev, [docId]: true }));
            }
        } catch (err) {
            console.error('Summary error:', err);
        } finally {
            setIsSummarizing(false);
            setActiveSummaryId(null);
        }
    };

    const handleAskQuestion = async (docId) => {
        const question = chatQuestion[docId];
        if (!question || !question.trim()) return;

        setIsAsking(true);
        setActiveSummaryId(docId);
        try {
            const token = localStorage.getItem('codec_token');
            const res = await fetch(`http://localhost:5050/api/documents/${docId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
                body: JSON.stringify({ question }),
            });
            const data = await res.json();
            if (res.ok) {
                setChatAnswers(prev => ({ ...prev, [docId]: data.answer }));
                setChatQuestion(prev => ({ ...prev, [docId]: '' }));
            }
        } catch (err) {
            console.error('Chat error:', err);
        } finally {
            setIsAsking(false);
            setActiveSummaryId(null);
        }
    };

    if (loading) return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: 13 }}>
            Loading shared files...
        </div>
    )

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
            <div style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.4px', marginBottom: 6 }}>Shared with Me</h1>
                <p style={{ fontSize: 13, color: '#4b5563' }}>Private materials shared with you by other professors.</p>
            </div>

            {/* Filters UI */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                    <select
                        value={timeFilter}
                        onChange={e => setTimeFilter(e.target.value)}
                        style={{
                            padding: '10px 14px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                            color: '#e5e7eb', fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 140
                        }}
                    >
                        <option value="all">All Time</option>
                        <option value="15">Last 15 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                    <ChevronDown size={14} color="#374151" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>

                <div style={{ position: 'relative' }}>
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        style={{
                            padding: '10px 14px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                            color: '#e5e7eb', fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 140
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="pdf">PDF Documents</option>
                        <option value="image">Images</option>
                        <option value="doc">Word/Docs</option>
                    </select>
                    <ChevronDown size={14} color="#374151" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>

                <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                    <Search size={14} color="#374151" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Filter by Sharer ID..."
                        value={uploaderFilter}
                        onChange={e => setUploaderFilter(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                            color: '#e5e7eb', fontSize: 13, outline: 'none'
                        }}
                    />
                </div>
            </div>

            {docs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {docs.map(doc => (
                        <SharedDocCard
                            key={doc._id}
                            doc={doc}
                            onSummarize={handleSummarize}
                            isSummarizing={isSummarizing}
                            activeSummaryId={activeSummaryId}
                            onToggleSummary={(id) => setVisibleSummaries(prev => ({ ...prev, [id]: !prev[id] }))}
                            isSummaryVisible={visibleSummaries[doc._id]}
                            onAskQuestion={handleAskQuestion}
                            chatQuestion={chatQuestion}
                            onQuestionChange={(id, val) => setChatQuestion(prev => ({ ...prev, [id]: val }))}
                            chatAnswers={chatAnswers}
                            isAsking={isAsking}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#4b5563', fontSize: 13 }}>No documents shared with you yet.</p>
                </div>
            )}
        </div>
    )
}
