import React, { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Search, FileText, Image as ImageIcon, BookOpen, Clock, User, ScanSearch, X, Loader, Sparkles, Eye } from 'lucide-react'

// ─── Result row ───────────────────────────────────────────────────────────────

function ResultRow({ doc, onSummarize, isSummarizing, activeSummaryId, onToggleSummary, isSummaryVisible, onAskQuestion, chatQuestion, onQuestionChange, chatAnswers, isAsking }) {
    const [hovered, setHovered] = useState(false)

    // Determine icon based on mimeType/extension
    const getIcon = (mimeType, fileName) => {
        if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) return FileText;
        if (mimeType?.startsWith('image/') || fileName?.match(/\.(jpg|jpeg|png|gif)$/i)) return ImageIcon;
        return BookOpen;
    }

    const Icon = getIcon(doc.mimeType, doc.fileName)

    // Format file size
    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const docId = doc._id || doc.id;
    const isThisDocSummarizing = isSummarizing && activeSummaryId === docId;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', flexDirection: 'column', gap: 12,
                padding: '14px 18px', borderRadius: 10,
                background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: hovered ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                transition: 'all 0.15s',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none'
                    }}
                >
                    <Icon size={15} color="#6b7280" />
                </a>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 13.5, fontWeight: 500, color: '#f3f4f6', marginBottom: 4, textDecoration: 'none', display: 'block' }}
                    >
                        {doc.originalName}
                    </a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={9} />You
                        </span>
                        <span style={{ fontSize: 11, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={9} />{new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{ fontSize: 11, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Size: {formatSize(doc.size)}
                        </span>
                        {doc.tags && doc.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                                {doc.tags.map((tag, idx) => (
                                    <span key={idx} style={{
                                        fontSize: 9, color: '#9ca3af', background: 'rgba(255,255,255,0.04)',
                                        padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)'
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {!doc.aiSummary && !isThisDocSummarizing && (
                        <button
                            onClick={() => onSummarize(docId)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 12px', borderRadius: 6,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#9ca3af', fontSize: 10,
                                fontFamily: "'DM Mono',monospace", letterSpacing: '0.05em',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                        >
                            <Sparkles size={11} /> ✨ Summarize
                        </button>
                    )}

                    {doc.aiSummary && !isThisDocSummarizing && (
                        <button
                            onClick={() => onToggleSummary(docId)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 12px', borderRadius: 6,
                                background: isSummaryVisible ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: isSummaryVisible ? '#f3f4f6' : '#6b7280', fontSize: 10,
                                fontFamily: "'DM Mono',monospace", letterSpacing: '0.05em',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}
                        >
                            {isSummaryVisible ? 'Hide Summary' : 'Show Summary'}
                        </button>
                    )}

                    {isThisDocSummarizing && (
                        <span style={{ fontSize: 10, color: '#4b5563', fontFamily: "'DM Mono',monospace" }}>
                            Gemini is analyzing...
                        </span>
                    )}

                    <span style={{
                        fontSize: 9, fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em',
                        padding: '3px 9px', borderRadius: 4,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#6b7280', flexShrink: 0,
                    }}>
                        {doc.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                </div>
            </div>

            {/* AI Summary Content */}
            {doc.aiSummary && isSummaryVisible && (
                <div style={{
                    marginLeft: 50, padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    position: 'relative'
                }}>
                    <div className="markdown-summary" style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.5 }}>
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

                    {/* Chat with Document Q&A Section */}
                    <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                type="text"
                                placeholder="Ask a specific question about this document..."
                                value={chatQuestion[docId] || ''}
                                onChange={(e) => onQuestionChange(docId, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isAsking && (chatQuestion[docId] || '').trim()) {
                                        onAskQuestion(docId);
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#f3f4f6',
                                    fontSize: 12,
                                    outline: 'none',
                                }}
                            />
                            <button
                                onClick={() => onAskQuestion(docId)}
                                disabled={isAsking || !(chatQuestion[docId] || '').trim()}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    background: (isAsking || !(chatQuestion[docId] || '').trim()) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: (isAsking || !(chatQuestion[docId] || '').trim()) ? '#374151' : '#e5e7eb',
                                    fontSize: 11,
                                    fontFamily: "'DM Mono',monospace",
                                    cursor: (isAsking || !(chatQuestion[docId] || '').trim()) ? 'default' : 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {isAsking && activeSummaryId === docId ? 'Thinking...' : 'Ask AI'}
                            </button>
                        </div>

                        {chatAnswers[docId] && (
                            <div style={{ marginTop: 14, padding: '12px', borderRadius: 8, background: 'rgba(129,140,248,0.03)', border: '1px solid rgba(129,140,248,0.1)' }}>
                                <div className="markdown-summary" style={{ fontSize: 11, color: '#d1d5db', lineHeight: 1.6 }}>
                                    <ReactMarkdown components={{
                                        p: ({ node, ...props }) => <p style={{ marginBottom: '8px' }} {...props} />,
                                        ul: ({ node, ...props }) => <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '8px' }} {...props} />,
                                        li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />,
                                        h3: ({ node, ...props }) => <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#f3f4f6', marginTop: '12px', marginBottom: '6px' }} {...props} />,
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
    )
}

// ─── Filter Button ───────────────────────────────────────────────────────────

function FilterButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: active ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active ? '#f3f4f6' : '#6b7280',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s'
            }}
        >
            {label}
        </button>
    )
}

// ─── SearchPageView ───────────────────────────────────────────────────────────

export default function SearchPageView() {
    const [searchQuery, setSearchQuery] = useState('')
    const [documents, setDocuments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [activeFilter, setActiveFilter] = useState('All')
    const [tagFilter, setTagFilter] = useState('')
    const [timeFilter, setTimeFilter] = useState('all')
    const [privacyFilter, setPrivacyFilter] = useState('all')

    const [isSummarizing, setIsSummarizing] = useState(false);
    const [activeSummaryId, setActiveSummaryId] = useState(null);
    const [visibleSummaries, setVisibleSummaries] = useState({});

    const [chatQuestion, setChatQuestion] = useState({});
    const [chatAnswers, setChatAnswers] = useState({});
    const [isAsking, setIsAsking] = useState(false);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(null, searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, tagFilter, timeFilter, privacyFilter]);

    const handleSearch = async (e, queryOverride) => {
        if (e) e.preventDefault()

        const query = queryOverride !== undefined ? queryOverride : searchQuery
        setIsLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('codec_token')
            if (!token) throw new Error('Not authenticated')

            const url = `http://localhost:5050/api/documents/search?q=${encodeURIComponent(query)}&tags=${encodeURIComponent(tagFilter)}&time=${timeFilter}&privacy=${privacyFilter}`
            const res = await fetch(url, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })

            if (!res.ok) throw new Error('Search failed')

            const data = await res.json()
            setDocuments(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Search error:', err)
            setError('Failed to fetch results')
            setDocuments([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSummarize = async (docId) => {
        setIsSummarizing(true);
        setActiveSummaryId(docId);
        try {
            const token = localStorage.getItem('codec_token');
            const res = await fetch(`http://localhost:5050/api/documents/${docId}/summarize`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + token,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setDocuments(prev => prev.map(doc => {
                    const id = doc._id || doc.id;
                    return id === docId ? { ...doc, aiSummary: data.summary } : doc;
                }));
                setVisibleSummaries(prev => ({ ...prev, [docId]: true }));
            } else {
                alert(data.message || 'Summarization failed');
            }
        } catch (err) {
            console.error('Summary error:', err);
            alert('Network error during summarization');
        } finally {
            setIsSummarizing(false);
            setActiveSummaryId(null);
        }
    };

    const toggleSummary = (docId) => {
        setVisibleSummaries(prev => ({ ...prev, [docId]: !prev[docId] }));
    };

    const handleAskQuestion = async (docId) => {
        const question = chatQuestion[docId];
        if (!question || !question.trim()) return;

        setIsAsking(true);
        setActiveSummaryId(docId); // Reuse this to track active doc
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
            } else {
                alert(data.message || 'Failed to get answer');
            }
        } catch (err) {
            console.error('Chat error:', err);
            alert('Network error during chat');
        } finally {
            setIsAsking(false);
            setActiveSummaryId(null);
        }
    };

    const handleQuestionChange = (docId, value) => {
        setChatQuestion(prev => ({ ...prev, [docId]: value }));
    };

    const filteredDocuments = useMemo(() => {
        if (activeFilter === 'All') return documents

        return documents.filter(doc => {
            const type = doc.mimeType || ''
            if (activeFilter === 'PDF') return type.includes('pdf')
            if (activeFilter === 'Images') return type.startsWith('image/')
            if (activeFilter === 'CSV/Data') return type.includes('csv') || type.includes('spreadsheet') || type.includes('excel')
            return true
        })
    }, [documents, activeFilter])

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(3,3,3,0.2)'
            }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f9fafb', marginBottom: 16 }}>Deep Search</h1>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, maxWidth: 1000 }}>
                    <div style={{ position: 'relative', flex: 2 }}>
                        <Search size={16} color="#6b7280" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search content, titles..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 42px',
                                borderRadius: 10,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#f3f4f6',
                                fontSize: 14,
                                outline: 'none',
                                transition: 'all 0.15s',
                            }}
                            onFocus={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
                            onBlur={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        />
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Filter by Tags..."
                            value={tagFilter}
                            onChange={e => setTagFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: 10,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#f3f4f6',
                                fontSize: 14,
                                outline: 'none',
                                transition: 'all 0.15s',
                            }}
                            onFocus={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
                            onBlur={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        />
                    </div>
                    <div style={{ position: 'relative', flex: 0.8 }}>
                        <select
                            value={timeFilter}
                            onChange={e => setTimeFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: 10,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#f3f4f6',
                                fontSize: 14,
                                outline: 'none',
                                appearance: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="all">All Time</option>
                            <option value="15">Last 15 Days</option>
                            <option value="30">Last 30 Days</option>
                        </select>
                        <Clock size={14} color="#6b7280" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <div style={{ position: 'relative', flex: 0.8 }}>
                        <select
                            value={privacyFilter}
                            onChange={e => setPrivacyFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: 10,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#f3f4f6',
                                fontSize: 14,
                                outline: 'none',
                                appearance: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="all">All Files</option>
                            <option value="public">Public Only</option>
                            <option value="private">Private Only</option>
                        </select>
                        <Eye size={14} color="#6b7280" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                </form>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {['All', 'PDF', 'Images', 'CSV/Data'].map(filter => (
                        <FilterButton
                            key={filter}
                            label={filter}
                            active={activeFilter === filter}
                            onClick={() => setActiveFilter(filter)}
                        />
                    ))}
                </div>
            </div>

            {/* Results Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50%', color: '#6b7280' }}>
                        <Loader size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                        <span style={{ fontSize: 13 }}>Searching your library...</span>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', color: '#ef4444', marginTop: 40 }}>{error}</div>
                ) : filteredDocuments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, fontFamily: "'DM Mono',monospace" }}>
                            FOUND {filteredDocuments.length} RESULT{filteredDocuments.length !== 1 ? 'S' : ''}
                        </p>
                        {filteredDocuments.map(doc => (
                            <ResultRow
                                key={doc._id}
                                doc={doc}
                                onSummarize={handleSummarize}
                                isSummarizing={isSummarizing}
                                activeSummaryId={activeSummaryId}
                                onToggleSummary={toggleSummary}
                                isSummaryVisible={visibleSummaries[doc._id || doc.id]}
                                onAskQuestion={handleAskQuestion}
                                chatQuestion={chatQuestion}
                                onQuestionChange={handleQuestionChange}
                                chatAnswers={chatAnswers}
                                isAsking={isAsking}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: 60, opacity: 0.6 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 20, margin: '0 auto 20px',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <ScanSearch size={28} color="#4b5563" />
                        </div>
                        <h3 style={{ fontSize: 15, color: '#e5e7eb', marginBottom: 6 }}>No matches found</h3>
                        <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 300, margin: '0 auto' }}>
                            Try searching for specific keywords within your document contents or file names.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
