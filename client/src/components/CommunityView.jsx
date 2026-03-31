import React, { useState, useEffect } from 'react'
import { FileText, Image as ImageIcon, BookOpen, Download, ChevronRight, User } from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Mock community data ──────────────────────────────────────────────────────

const COMMUNITY = [
    {
        id: 1,
        name: 'Dr. Arvind Sharma',
        role: 'Professor · Mechanical Engineering',
        initials: 'AS',
        docs: [
            { id: 11, title: 'Thermodynamics Sem 4', type: 'PDF', date: '10 Mar 2026', size: '2.4 MB', icon: FileText },
            { id: 12, title: 'Fluid Mechanics Notes', type: 'PDF', date: '07 Mar 2026', size: '1.8 MB', icon: FileText },
            { id: 13, title: 'Heat Transfer Lab', type: 'Image', date: '02 Mar 2026', size: '3.1 MB', icon: ImageIcon },
        ],
    },
    {
        id: 2,
        name: 'Prof. Meera Joshi',
        role: 'Professor · ECE',
        initials: 'MJ',
        docs: [
            { id: 21, title: 'Electromagnetic Theory', type: 'PDF', date: '05 Mar 2026', size: '1.5 MB', icon: FileText },
            { id: 22, title: 'Control Systems Sem 5', type: 'PDF', date: '01 Mar 2026', size: '2.2 MB', icon: FileText },
        ],
    },
    {
        id: 3,
        name: 'Dr. Rohan Gupta',
        role: 'Assistant Professor · CS',
        initials: 'RG',
        docs: [
            { id: 31, title: 'CS Data Structures', type: 'PDF', date: '09 Mar 2026', size: '1.1 MB', icon: FileText },
            { id: 32, title: 'Algorithm Analysis', type: 'Doc', date: '03 Mar 2026', size: '0.7 MB', icon: BookOpen },
        ],
    },
    {
        id: 4,
        name: 'Dr. Priya Nair',
        role: 'Associate Professor · ECE',
        initials: 'PN',
        docs: [
            { id: 41, title: 'Circuit Diagram Lab 3', type: 'Image', date: '08 Mar 2026', size: '3.7 MB', icon: ImageIcon },
            { id: 42, title: 'Digital Circuits Notes', type: 'PDF', date: '04 Mar 2026', size: '1.3 MB', icon: FileText },
        ],
    },
    {
        id: 5,
        name: 'Dr. Ananya Singh',
        role: 'HOD · Computer Science',
        initials: 'AS',
        docs: [
            { id: 51, title: 'DBMS Assignment 2', type: 'Doc', date: '06 Mar 2026', size: '0.6 MB', icon: BookOpen },
        ],
    },
]

// ─── Document row inside expanded user ───────────────────────────────────────

function PublicDocRow({ doc }) {
    const [hovered, setHovered] = useState(false)
    const Icon = doc.icon

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '11px 16px', borderRadius: 8,
                background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                transition: 'background 0.15s', cursor: 'pointer',
            }}
        >
            <div style={{
                width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={13} color="#6b7280" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#e5e7eb', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.title}
                </p>
                <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#374151', letterSpacing: '0.08em' }}>
                    {doc.type} · {doc.size} · {doc.date}
                </p>
            </div>

            <button style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', borderRadius: 6, border: 'none',
                background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#6b7280', fontSize: 10,
                fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em',
                cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
            }}
                onMouseEnter={e => { e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
                <Download size={10} /> Download
            </button>
        </div>
    )
}

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({ person }) {
    // Generate initials safely
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    return (
        <div style={{
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
            transition: 'border-color 0.2s',
        }}>
            {/* Header — click to open profile */}
            <Link
                to={`/profile/${person._id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.15s',
                    textDecoration: 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
                {/* Avatar */}
                <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontFamily: "'DM Mono',monospace",
                    color: '#9ca3af', letterSpacing: '0.05em',
                }}>
                    {getInitials(person.name)}
                </div>

                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6', marginBottom: 2 }}>{person.name}</p>
                    <p style={{ fontSize: 11, color: '#374151' }}>{person.designation || person.role || 'Faculty'}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{
                        fontSize: 9, fontFamily: "'DM Mono',monospace",
                        color: '#374151', letterSpacing: '0.12em',
                    }}>
                        VIEW PROFILE
                    </span>
                    <ChevronRight size={14} color="#374151" />
                </div>
            </Link>
        </div>
    )
}

// ─── CommunityView ────────────────────────────────────────────────────────────

export default function CommunityView() {
    const [search, setSearch] = useState('')
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('codec_token')
                if (!token) return

                const res = await fetch('http://localhost:5050/api/users', {
                    headers: { Authorization: 'Bearer ' + token },
                })

                if (res.ok) {
                    const data = await res.json()
                    setUsers(data)
                }
            } catch (error) {
                console.error('Failed to fetch users:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const filtered = users.filter(p =>
        !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.role?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.4px', marginBottom: 6 }}>Professor Network</h1>
                <p style={{ fontSize: 13, color: '#4b5563' }}>Browse public documents shared by fellow faculty members.</p>
            </div>

            {/* Search people */}
            <div style={{ position: 'relative', maxWidth: 380, marginBottom: 32 }}>
                <User size={13} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#374151', pointerEvents: 'none' }} />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or department..."
                    style={{
                        width: '100%', padding: '10px 14px 10px 36px', borderRadius: 9,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#e5e7eb', fontSize: 13, outline: 'none',
                        boxSizing: 'border-box', transition: 'border-color 0.15s',
                        caretColor: '#9ca3af',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
                />
            </div>

            {/* Stats bar */}
            <div style={{
                display: 'flex', gap: 24, marginBottom: 28,
                paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                {[
                    { label: 'Members', value: users.length },
                    { label: 'Professors', value: users.filter(p => p.role?.startsWith('Professor')).length },
                ].map(({ label, value }) => (
                    <div key={label}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.3px', lineHeight: 1 }}>{value}</p>
                        <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#374151', letterSpacing: '0.12em', marginTop: 4 }}>{label.toUpperCase()}</p>
                    </div>
                ))}
            </div>

            {/* User list */}
            {isLoading ? (
                <div style={{ textAlign: 'center', paddingTop: 48, color: '#6b7280', fontSize: 13 }}>
                    Loading community members...
                </div>
            ) : filtered.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(person => <UserRow key={person._id} person={person} />)}
                </div>
            ) : (
                <div style={{ textAlign: 'center', paddingTop: 48, color: '#374151', fontSize: 13 }}>
                    No members match your search.
                </div>
            )}
        </div>
    )
}