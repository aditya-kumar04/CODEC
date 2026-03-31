import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import {
    Upload, FileText, Image as ImageIcon, BookOpen,
    Trash2, Sparkles, Eye, EyeOff, X, Cpu,
    Clock, ChevronDown, ChevronUp, Share2, Users
} from 'lucide-react'

const toCard = (d) => {
    const baseName = (d.originalName || d.fileName || '').toString()
    const ext = (baseName.split('.').pop() || '').toUpperCase()
    const type = ['PDF', 'DOCX', 'PNG', 'JPG'].includes(ext)
        ? ext
        : (d.mimeType?.includes('pdf') ? 'PDF' : (d.mimeType?.includes('presentation') ? 'PPTX' : 'DOCX'))
    const icon = ['PNG', 'JPG'].includes(type) ? ImageIcon : (type === 'DOCX' ? BookOpen : FileText)
    const sizeMB = d.size ? `${(d.size / 1024 / 1024).toFixed(1)} MB` : ''
    const created = d.createdAt ? new Date(d.createdAt) : new Date()
    const date = created.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    return {
        id: d._id || d.id,
        title: baseName.replace(/\.[^/.]+$/, ''),
        type,
        date,
        size: sizeMB,
        isPublic: !!d.isPublic,
        icon,
        aiSummary: d.aiSummary || '',
    }
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({ doc, onClose }) {
    const [users, setUsers] = useState([])
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [sharing, setSharing] = useState(false)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('codec_token')
                const [usersRes, groupsRes] = await Promise.all([
                    fetch('http://localhost:5050/api/users', { headers: { Authorization: 'Bearer ' + token } }),
                    fetch('http://localhost:5050/api/groups', { headers: { Authorization: 'Bearer ' + token } })
                ])

                if (usersRes.ok) {
                    const data = await usersRes.json()
                    setUsers(data.filter(u => u._id !== localStorage.getItem('codec_user_id')))
                }
                if (groupsRes.ok) {
                    setGroups(await groupsRes.json())
                }
            } catch (err) {
                console.error("Failed to fetch sharing data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleShare = async (targetUserId, shareWithDepartment = false, targetGroupId = null) => {
        setSharing(true)
        setMessage(null)
        try {
            const token = localStorage.getItem('codec_token')
            const res = await fetch(`http://localhost:5050/api/documents/${doc.id}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                },
                body: JSON.stringify({ targetUserId, shareWithDepartment, targetGroupId })
            })
            if (res.ok) {
                let successMsg = 'Document shared!'
                if (shareWithDepartment) successMsg = 'Shared with department!'
                else if (targetGroupId) successMsg = 'Shared with group!'

                setMessage({ type: 'success', text: successMsg })
                if (targetUserId) {
                    setUsers(prev => prev.filter(u => u._id !== targetUserId))
                }
            } else {
                setMessage({ type: 'error', text: 'Sharing failed.' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error.' })
        } finally {
            setSharing(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 110,
            background: 'rgba(3,3,3,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fade-in 0.15s ease',
        }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '90%', maxWidth: 420,
                background: 'rgba(14,14,18,0.98)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '24px',
                display: 'flex', flexDirection: 'column', gap: 20,
                maxHeight: '85vh', overflow: 'hidden',
                animation: 'slide-up 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f3f4f6' }}>Share Document</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}><X size={18} /></button>
                </div>

                {message && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 8,
                        background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        color: message.type === 'success' ? '#4ade80' : '#f87171',
                        fontSize: 12, textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                        disabled={sharing}
                        onClick={() => handleShare(null, true)}
                        style={{
                            width: '100%', padding: '12px', borderRadius: 10,
                            background: 'rgba(129,140,248,0.1)',
                            border: '1px solid rgba(129,140,248,0.2)',
                            color: '#a5b4fc', fontSize: 13, fontWeight: 500,
                            cursor: sharing ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => !sharing && (e.currentTarget.style.background = 'rgba(129,140,248,0.15)')}
                        onMouseLeave={e => !sharing && (e.currentTarget.style.background = 'rgba(129,140,248,0.1)')}
                    >
                        <Users size={16} /> Share with my Department
                    </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, overflowY: 'auto' }}>
                    {/* Groups Section */}
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 12, fontFamily: "'DM Mono',monospace" }}>SHARE WITH GROUPS</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {loading ? <p style={{ color: '#374151', fontSize: 12 }}>Loading groups...</p> :
                                groups.length === 0 ? <p style={{ color: '#374151', fontSize: 11 }}>No groups joined.</p> :
                                    groups.map(g => (
                                        <div key={g._id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: 13, color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</p>
                                                <p style={{ fontSize: 10, color: '#374151' }}>{g.members.length} members</p>
                                            </div>
                                            <button
                                                disabled={sharing}
                                                onClick={() => handleShare(null, false, g._id)}
                                                style={{
                                                    padding: '4px 10px', borderRadius: 6,
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                    color: '#9ca3af', fontSize: 10, cursor: 'pointer'
                                                }}
                                            >Share</button>
                                        </div>
                                    ))}
                        </div>
                    </div>

                    {/* Professors Section */}
                    <div>
                        <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 12, fontFamily: "'DM Mono',monospace" }}>SHARE WITH PROFESSORS</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {loading ? null :
                                users.length === 0 ? <p style={{ color: '#374151', fontSize: 11 }}>No other professors found.</p> :
                                    users.map(u => (
                                        <div key={u._id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: 13, color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                                                <p style={{ fontSize: 10, color: '#374151' }}>{u.department || 'No Dept'}</p>
                                            </div>
                                            <button
                                                disabled={sharing}
                                                onClick={() => handleShare(u._id)}
                                                style={{
                                                    padding: '4px 10px', borderRadius: 6,
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                    color: '#9ca3af', fontSize: 10, cursor: 'pointer'
                                                }}
                                            >Share</button>
                                        </div>
                                    ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── AI Summary Panel ─────────────────────────────────────────────────────────

function SummaryPanel({ doc, onClose }) {
    const [summary, setSummary] = useState('')
    const [loading, setLoading] = useState(false)
    const [generated, setGenerated] = useState(false)

    const generate = useCallback(async () => {
        setSummary(''); setLoading(true); setGenerated(false)
        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 800,
                    messages: [{
                        role: 'user',
                        content: `You are Codec AI for RGIPT. Generate a concise academic summary for:
Title: "${doc.title}" | Type: ${doc.type}

3 short paragraphs:
1. Document scope and content
2. Key academic concepts
3. One specific teaching or study tip

Be precise and authoritative. No filler.`,
                    }],
                }),
            })
            const data = await res.json()
            setSummary(data?.content?.[0]?.text ?? 'Failed to generate.')
        } catch {
            setSummary('Connection error. Please try again.')
        } finally {
            setLoading(false); setGenerated(true)
        }
    }, [doc])

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(3,3,3,0.9)', backdropFilter: 'blur(14px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fade-in 0.15s ease',
        }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '92%', maxWidth: 540,
                background: 'rgba(14,14,18,0.98)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                display: 'flex', flexDirection: 'column',
                maxHeight: '82vh', overflow: 'hidden',
                animation: 'slide-up 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 22px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Cpu size={13} color="#9ca3af" />
                        <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#6b7280', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                            AI Summary · {doc.title}
                        </span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 2 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
                        onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                    ><X size={14} /></button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 22px', overflowY: 'auto', flex: 1 }}>
                    {!generated && !loading && (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12, margin: '0 auto 16px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Sparkles size={18} color="#6b7280" />
                            </div>
                            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                                Generate an intelligent summary for this document.
                            </p>
                            <button onClick={generate} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '10px 22px', borderRadius: 8,
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: '#e5e7eb', fontSize: 12,
                                fontFamily: "'DM Mono',monospace",
                                letterSpacing: '0.1em', cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                            >
                                <Sparkles size={11} /> Generate Summary
                            </button>
                        </div>
                    )}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 0' }}>
                            <div style={{ display: 'flex', gap: 3 }}>
                                {[0, 1, 2, 3].map(i => (
                                    <div key={i} style={{
                                        width: 2, height: 16, borderRadius: 2, background: '#6b7280',
                                        animation: `bar-bounce 1s ease-in-out ${i * 0.15}s infinite`,
                                    }} />
                                ))}
                            </div>
                            <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#4b5563', letterSpacing: '0.12em' }}>ANALYSING DOCUMENT...</span>
                        </div>
                    )}
                    {generated && summary && (
                        <div>
                            <p style={{ fontSize: 13.5, color: '#d1d5db', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{summary}</p>
                            <button onClick={generate} style={{
                                marginTop: 18, fontSize: 11, fontFamily: "'DM Mono',monospace",
                                color: '#4b5563', background: 'none',
                                border: '1px solid rgba(255,255,255,0.08)',
                                padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                            >↺ Regenerate</button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes fade-in  { from { opacity:0 } to { opacity:1 } }
        @keyframes slide-up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes bar-bounce { 0%,100%{transform:scaleY(0.3);opacity:0.25} 50%{transform:scaleY(1);opacity:1} }
      `}</style>
        </div>
    )
}

// ─── Doc Card ─────────────────────────────────────────────────────────────────

function DocCard({ doc, onDelete, onTogglePublic, onSummary, onToggleSummary, isSummaryVisible, onAskQuestion, chatQuestion, onQuestionChange, chatAnswers, isAsking, onShare }) {
    const [hovered, setHovered] = useState(false)
    const [isSummarizing, setIsSummarizing] = useState(false)
    const [localSummary, setLocalSummary] = useState(doc.aiSummary || '')
    const Icon = doc.icon

    const docId = doc.id; // Correct ID for Dashboard cards

    const handleSummarize = async (e) => {
        e.stopPropagation();
        if (localSummary) return; // Already have one

        setIsSummarizing(true);
        try {
            const token = localStorage.getItem('codec_token');
            const res = await fetch(`http://localhost:5050/api/documents/${doc.id}/summarize`, {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + token }
            });
            const data = await res.json();
            if (res.ok) {
                setLocalSummary(data.summary);
                onToggleSummary(doc.id, true); // Auto-show after generation
            } else {
                alert(data.message || 'Summarization failed');
            }
        } catch (err) {
            console.error('Summary error:', err);
            alert('Network error during summarization');
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                border: hovered ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '18px',
                display: 'flex', flexDirection: 'column', gap: 14,
                transition: 'all 0.2s',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={16} color="#9ca3af" />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Public/Private toggle */}
                    <button onClick={() => onTogglePublic(doc)} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '4px 9px', borderRadius: 6,
                        background: doc.isPublic ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: doc.isPublic ? '#9ca3af' : '#374151',
                        fontSize: 10, fontFamily: "'DM Mono',monospace",
                        letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#9ca3af' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = doc.isPublic ? '#9ca3af' : '#374151' }}
                    >
                        {doc.isPublic ? <Eye size={10} /> : <EyeOff size={10} />}
                        {doc.isPublic ? 'Public 🌍' : 'Private 🔒'}
                    </button>

                    {/* Share */}
                    <button onClick={() => onShare(doc)} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '4px 9px', borderRadius: 6,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#374151',
                        fontSize: 10, fontFamily: "'DM Mono',monospace",
                        letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#9ca3af' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#374151' }}
                    >
                        <Share2 size={10} />
                        Share
                    </button>

                    {/* Delete */}
                    <button onClick={() => onDelete(doc.id)} style={{
                        width: 28, height: 28, borderRadius: 6, border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#374151', transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.08)'; e.currentTarget.style.color = '#f87171' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151' }}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Title */}
            <div>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#f3f4f6', marginBottom: 4, lineHeight: 1.35 }}>{doc.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                        fontSize: 9, fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em',
                        padding: '2px 7px', borderRadius: 4,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#6b7280',
                    }}>{doc.type}</span>
                    <span style={{ fontSize: 11, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={9} /> {doc.date}
                    </span>
                    <span style={{ fontSize: 11, color: '#374151' }}>{doc.size}</span>
                </div>
            </div>

            {/* AI Summary Section */}
            <div style={{ marginTop: 4 }}>
                {!localSummary && !isSummarizing ? (
                    <button onClick={handleSummarize} style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        padding: '8px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#6b7280', fontSize: 11,
                        fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em',
                        cursor: 'pointer', transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#e5e7eb' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#6b7280' }}
                    >
                        <Sparkles size={11} /> ✨ Generate AI Summary
                    </button>
                ) : localSummary && !isSummarizing ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleSummary(doc.id) }}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                            padding: '8px', borderRadius: 8,
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
                ) : isSummarizing ? (
                    <div style={{
                        padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'
                    }}>
                        <span style={{ fontSize: 10, color: '#4b5563', fontFamily: "'DM Mono',monospace" }}>Gemini is analyzing...</span>
                    </div>
                ) : null}

                {localSummary && isSummaryVisible && (
                    <div style={{
                        padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)', position: 'relative', marginTop: 12
                    }}>
                        <div className="markdown-summary" style={{
                            fontSize: 11, color: '#9ca3af', lineHeight: 1.5,
                        }}>
                            <ReactMarkdown components={{
                                p: ({ node, ...props }) => <p style={{ marginBottom: '8px' }} {...props} />,
                                ul: ({ node, ...props }) => <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '8px' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />,
                                h3: ({ node, ...props }) => <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#f3f4f6', marginTop: '12px', marginBottom: '6px' }} {...props} />,
                                strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold', color: '#818cf8' }} {...props} />
                            }}>
                                {localSummary}
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
                                    placeholder="Ask a question..."
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
                                        fontSize: 11,
                                        outline: 'none',
                                    }}
                                />
                                <button
                                    onClick={() => onAskQuestion(docId)}
                                    disabled={isAsking || !(chatQuestion[docId] || '').trim()}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        background: (isAsking || !(chatQuestion[docId] || '').trim()) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: (isAsking || !(chatQuestion[docId] || '').trim()) ? '#374151' : '#e5e7eb',
                                        fontSize: 10,
                                        fontFamily: "'DM Mono',monospace",
                                        cursor: (isAsking || !(chatQuestion[docId] || '').trim()) ? 'default' : 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {isAsking ? '...' : 'Ask'}
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
        </div>
    )
}

// ─── MyUploadsView ────────────────────────────────────────────────────────────

export default function MyUploadsView({ userRole }) {
    const [docs, setDocs] = useState([])
    const [dragOver, setDragOver] = useState(false)
    const [summaryDoc, setSummaryDoc] = useState(null)
    const [shareDoc, setShareDoc] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState(null)
    const [uploadTags, setUploadTags] = useState('')
    const [visibleSummaries, setVisibleSummaries] = useState({})
    const [chatQuestion, setChatQuestion] = useState({})
    const [chatAnswers, setChatAnswers] = useState({})
    const [isAsking, setIsAsking] = useState(false)
    const fileRef = useRef(null)

    useEffect(() => {
        const token = localStorage.getItem('codec_token')
        if (!token) return
            ; (async () => {
                try {
                    const res = await fetch('http://localhost:5050/api/documents', {
                        headers: { Authorization: 'Bearer ' + token },
                    })
                    const data = await res.json().catch(() => ({}))
                    if (res.ok) {
                        const list = Array.isArray(data) ? data : (data.documents || [])
                        setDocs(list.map(toCard))
                    }
                } catch {
                }
            })()
    }, [])

    const handleFiles = useCallback(async (files) => {
        setUploadError(null)
        const token = localStorage.getItem('codec_token')
        if (!token) {
            // not authenticated — redirect to login
            localStorage.removeItem('codec_user')
            localStorage.removeItem('codec_token')
            window.location.href = '/login'
            return
        }

        const formData = new FormData()
        Array.from(files).forEach((f) => formData.append('files', f))
        formData.append('tags', uploadTags);

        setUploading(true)
        try {
            const res = await fetch('http://localhost:5050/api/documents/upload', {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + token },
                body: formData,
            })
            // parse body safely
            const data = await res.json().catch(() => ({}))
            if (res.status === 401) {
                // token invalid/expired
                localStorage.removeItem('codec_user')
                localStorage.removeItem('codec_token')
                window.location.href = '/login'
                return
            }
            if (!res.ok) {
                // show server error message (multer or controller)
                setUploadError(data?.message || `Upload failed (${res.status})`)
                return
            }

            // Clear upload tags on success
            setUploadTags('');

            // Handle both { documents: [...] } and [...] formats
            const list = Array.isArray(data) ? data : (data.documents || [])
            if (list.length > 0) {
                const newCards = list.map(toCard)
                setDocs(prev => [...newCards, ...prev])
            }
        } catch (err) {
            console.error('Upload error:', err)
            setUploadError('Network error. Please try again.')
        } finally {
            setUploading(false)
        }
    }, [uploadTags])

    const handleDrop = useCallback(e => {
        e.preventDefault(); setDragOver(false)
        if (!uploading) handleFiles(e.dataTransfer.files)
    }, [handleFiles, uploading])

    const handleDelete = useCallback(async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this file? Once deleted, it cannot be recovered from the platform.");
        if (!isConfirmed) return;

        const token = localStorage.getItem('codec_token');
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:5050/api/documents/${id}`, {
                method: 'DELETE',
                headers: { Authorization: 'Bearer ' + token },
            });

            if (res.ok) {
                setDocs(p => p.filter(d => d.id !== id));
            } else {
                const data = await res.json().catch(() => ({}));
                console.error('Delete failed:', data.message || res.status);
                alert(`Delete failed: ${data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    }, [])

    const handleTogglePrivacy = useCallback(async (doc) => {
        if (!doc.isPublic) {
            const isConfirmed = window.confirm("Are you sure you want to make this document public? It will be viewable to everyone on the platform.");
            if (!isConfirmed) return;
        }

        const token = localStorage.getItem('codec_token');
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:5050/api/documents/${doc.id}/privacy`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                },
                body: JSON.stringify({ isPublic: !doc.isPublic })
            });

            if (res.ok) {
                setDocs(p => p.map(d => d.id === doc.id ? { ...d, isPublic: !doc.isPublic } : d));
            } else {
                const data = await res.json().catch(() => ({}));
                alert(`Toggle failed: ${data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Privacy toggle error:', err);
        }
    }, [])

    const toggleSummary = (docId, forceState) => {
        setVisibleSummaries(prev => ({
            ...prev,
            [docId]: forceState !== undefined ? forceState : !prev[docId]
        }));
    };

    const handleAskQuestion = async (docId) => {
        const question = chatQuestion[docId];
        if (!question || !question.trim()) return;

        setIsAsking(true);
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
        }
    };

    const handleQuestionChange = (docId, value) => {
        setChatQuestion(prev => ({ ...prev, [docId]: value }));
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>

            {/* Page header */}
            <div style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.4px', marginBottom: 6 }}>My Files</h1>
                <p style={{ fontSize: 13, color: '#4b5563' }}>Upload and manage your personal academic documents.</p>
            </div>

            {/* Drop zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => { if (!uploading) fileRef.current?.click() }}
                style={{
                    borderRadius: 14,
                    border: dragOver ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px dashed rgba(255,255,255,0.1)',
                    background: dragOver ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                    padding: '52px 32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginBottom: 40,
                    transition: 'all 0.2s',
                    boxShadow: dragOver ? '0 0 32px rgba(255,255,255,0.03)' : 'none',
                }}
            >
                <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => { if (!uploading) handleFiles(e.target.files) }} />
                <div style={{
                    width: 48, height: 48, borderRadius: 12, margin: '0 auto 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {uploading ? <span style={{ fontSize: 12, color: '#6b7280' }}>Uploading…</span> : <Upload size={20} color="#6b7280" />}
                </div>
                <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4 }}>
                    <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{uploading ? 'Uploading files…' : 'Click to upload'}</span> or drag & drop
                </p>
                <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#374151', letterSpacing: '0.1em' }}>
                    PDF · DOCX · PNG · JPG — UP TO 50MB PER FILE
                </p>
                {uploadError && <p style={{ marginTop: 8, fontSize: 13, color: '#f87171' }}>{uploadError}</p>}
            </div>

            {/* Tags Input - Clearly visible above list */}
            <div style={{
                marginBottom: 32,
                maxWidth: 400,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '20px',
                borderRadius: 12
            }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>
                    Add tags to your upload
                </label>
                <input
                    type="text"
                    placeholder="Enter tags (comma separated) - e.g. physics, exam"
                    value={uploadTags}
                    onChange={e => setUploadTags(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f3f4f6',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'all 0.15s'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                />
            </div>

            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#374151', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Your Documents ({docs.length})
                </p>
                <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#1f2937', letterSpacing: '0.12em' }}>
                    {docs.filter(d => d.isPublic).length} PUBLIC · {docs.filter(d => !d.isPublic).length} PRIVATE
                </p>
            </div>

            {/* Grid */}
            {docs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                    {docs.map(doc => (
                        <DocCard
                            key={doc.id} doc={doc}
                            onDelete={handleDelete}
                            onTogglePublic={handleTogglePrivacy}
                            onSummary={setSummaryDoc}
                            onToggleSummary={toggleSummary}
                            isSummaryVisible={visibleSummaries[doc.id]}
                            onAskQuestion={handleAskQuestion}
                            chatQuestion={chatQuestion}
                            onQuestionChange={handleQuestionChange}
                            chatAnswers={chatAnswers}
                            isAsking={isAsking}
                            onShare={setShareDoc}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#374151', fontSize: 13 }}>
                    No documents uploaded yet.
                </div>
            )}

            {summaryDoc && <SummaryPanel doc={summaryDoc} onClose={() => setSummaryDoc(null)} />}
            {shareDoc && <ShareModal doc={shareDoc} onClose={() => setShareDoc(null)} />}
        </div>
    )
}
