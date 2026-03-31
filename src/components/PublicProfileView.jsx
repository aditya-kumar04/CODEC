import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Search, FileText, Image as ImageIcon, BookOpen, Clock, User, Download, Sparkles } from 'lucide-react'

// ─── Result row ───────────────────────────────────────────────────────────────
function PublicDocRow({ doc, onSummarize, isSummarizing, activeSummaryId, onToggleSummary, isSummaryVisible, onAskQuestion, chatQuestion, onQuestionChange, chatAnswers, isAsking }) {
    const [hovered, setHovered] = useState(false)

    const getIcon = (mimeType, fileName) => {
        if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) return FileText;
        if (mimeType?.startsWith('image/') || fileName?.match(/\.(jpg|jpeg|png|gif)$/i)) return ImageIcon;
        return BookOpen;
    }

    const Icon = getIcon(doc.mimeType, doc.fileName)

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
                background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: hovered ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.15s',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
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
                        style={{ fontSize: 14, fontWeight: 500, color: '#f3f4f6', marginBottom: 4, textDecoration: 'none', display: 'block' }}
                    >
                        {doc.originalName}
                    </a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} />{new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Size: {formatSize(doc.size)}
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

                    <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 6,
                            background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                            color: hovered ? '#f3f4f6' : '#9ca3af',
                            fontSize: 11, fontFamily: "'DM Mono',monospace", letterSpacing: '0.05em',
                            transition: 'all 0.15s',
                            textDecoration: 'none'
                        }}
                    >
                        <Download size={12} /> Open
                    </a>
                </div>
            </div>

            {/* AI Summary Content */}
            {doc.aiSummary && isSummaryVisible && (
                <div style={{
                    marginLeft: 54, padding: '12px 16px', borderRadius: 10,
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

// ─── PublicProfileView ────────────────────────────────────────────────────────
export default function PublicProfileView() {
    const { userId } = useParams()
    const [profileUser, setProfileUser] = useState(null)
    const [publicDocs, setPublicDocs] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    const [isSummarizing, setIsSummarizing] = useState(false)
    const [activeSummaryId, setActiveSummaryId] = useState(null)
    const [visibleSummaries, setVisibleSummaries] = useState({})

    const [chatQuestion, setChatQuestion] = useState({})
    const [chatAnswers, setChatAnswers] = useState({})
    const [isAsking, setIsAsking] = useState(false)

    // Fetch user details
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('codec_token')
                const res = await fetch(`http://localhost:5050/api/users/${userId}`, {
                    headers: { Authorization: 'Bearer ' + token }
                })
                if (res.ok) {
                    const data = await res.json()
                    setProfileUser(data)
                }
            } catch (err) {
                console.error("Failed to fetch user", err)
            }
        }
        fetchUser()
    }, [userId])

    // Fetch public docs with debounce for search
    useEffect(() => {
        const fetchDocs = async () => {
            setIsLoading(true)
            try {
                const token = localStorage.getItem('codec_token')
                const url = `http://localhost:5050/api/documents/user/${userId}/public?q=${encodeURIComponent(searchQuery)}`
                const res = await fetch(url, {
                    headers: { Authorization: 'Bearer ' + token }
                })
                if (res.ok) {
                    const data = await res.json()
                    setPublicDocs(data)
                }
            } catch (err) {
                console.error("Failed to fetch docs", err)
            } finally {
                setIsLoading(false)
            }
        }

        const timer = setTimeout(() => {
            fetchDocs()
        }, 300)

        return () => clearTimeout(timer)
    }, [userId, searchQuery])

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
                setPublicDocs(prev => prev.map(doc => {
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

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    if (!profileUser) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#09090b' }}>
                <span style={{ color: '#6b7280', fontFamily: "'DM Mono', monospace" }}>Loading Profile...</span>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#09090b', color: '#e5e7eb', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* Header Area */}
            <div style={{
                padding: '48px 48px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)'
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 600, fontFamily: "'DM Mono',monospace",
                        color: '#e5e7eb', letterSpacing: '0.05em',
                    }}>
                        {getInitials(profileUser.name)}
                    </div>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f9fafb', marginBottom: 4 }}>{profileUser.name}</h1>
                        <p style={{ fontSize: 14, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={14} /> {profileUser.role || 'Community Member'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ padding: '32px 48px', maxWidth: 900, margin: '0 auto' }}>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: 32 }}>
                    <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                    <input
                        type="text"
                        placeholder={`Search ${profileUser.name.split(' ')[0]}'s public documents...`}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 16px 14px 44px',
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#f3f4f6',
                            fontSize: 14,
                            outline: 'none',
                            transition: 'all 0.15s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                </div>

                {/* Documents Grid/List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>Searching documents...</div>
                    ) : publicDocs.length > 0 ? (
                        publicDocs.map(doc => (
                            <PublicDocRow
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
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.05)' }}>
                            <FileText size={32} color="#4b5563" style={{ margin: '0 auto 12px' }} />
                            <p style={{ color: '#9ca3af', fontSize: 14 }}>No public documents found.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}