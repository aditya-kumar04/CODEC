import React, { useState, useRef, useEffect } from 'react'
import {
    User, Mail, BookOpen, Calendar, Shield,
    FileText, Eye, Edit3, Check, X, Camera,
    Clock, Lock, Globe,
} from 'lucide-react'

// ─── ProfileView ──────────────────────────────────────────────────────────────

function EditableField({ label, value, onSave }) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const inputRef = useRef(null)

    const startEdit = () => { setDraft(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 30) }
    const cancel = () => { setEditing(false); setDraft(value) }
    const save = () => { onSave(draft.trim() || value); setEditing(false) }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#374151', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</p>
            {editing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        ref={inputRef}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
                        style={{
                            flex: 1, padding: '7px 11px', borderRadius: 7, outline: 'none',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#f3f4f6', fontSize: 13,
                            caretColor: '#9ca3af',
                        }}
                    />
                    <button onClick={save} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4, transition: 'color 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#e5e7eb'}
                        onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                    ><Check size={14} /></button>
                    <button onClick={cancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 4, transition: 'color 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
                        onMouseLeave={e => e.currentTarget.style.color = '#374151'}
                    ><X size={14} /></button>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={startEdit}>
                    <p style={{ fontSize: 13.5, color: '#d1d5db', flex: 1 }}>{value}</p>
                    <Edit3 size={12} color="#374151" style={{ flexShrink: 0, transition: 'color 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
                        onMouseLeave={e => e.currentTarget.style.color = '#374151'}
                    />
                </div>
            )}
        </div>
    )
}

// ─── ProfileView ──────────────────────────────────────────────────────────────

export default function ProfileView() {
    const [userProfile, setUserProfile] = useState(null)
    const [stats, setStats] = useState({ uploads: 0, publicFiles: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('codec_token')
                if (!token) return

                const res = await fetch('http://localhost:5050/api/users/me', {
                    headers: { Authorization: 'Bearer ' + token },
                })

                if (res.ok) {
                    const data = await res.json()
                    // The backend returns { user: {...}, stats: {...} }
                    setUserProfile(data.user)
                    setStats({
                        uploads: data.stats?.totalUploads || 0,
                        publicFiles: data.stats?.publicFiles || 0
                    })
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [])

    const update = (key) => async (val) => {
        try {
            const token = localStorage.getItem('codec_token')
            const res = await fetch('http://localhost:5050/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                },
                body: JSON.stringify({ [key]: val })
            })

            if (res.ok) {
                const updatedUser = await res.json()
                setUserProfile(updatedUser)
            }
        } catch (error) {
            console.error('Failed to update profile:', error)
        }
    }

    if (isLoading || !userProfile) {
        return <div style={{ padding: '40px 48px', color: '#6b7280' }}>Loading profile...</div>
    }

    const avatarUrl = userProfile.profilePic
        ? userProfile.profilePic
        : `https://ui-avatars.com/api/?name=${userProfile.name}&background=random&color=fff`

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>

            {/* Page title */}
            <div style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.4px', marginBottom: 6 }}>Profile</h1>
                <p style={{ fontSize: 13, color: '#4b5563' }}>Your account information and activity on Codec.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>

                {/* ── Left column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Avatar card */}
                    <div style={{
                        borderRadius: 14, padding: '28px 24px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(12px)',
                        textAlign: 'center',
                    }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    objectFit: 'cover'
                                }}
                            />
                            <button style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: 24, height: 24, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'background 0.15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                <Camera size={11} color="#9ca3af" />
                            </button>
                        </div>

                        <p style={{ fontSize: 16, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.3px', marginBottom: 4 }}>{userProfile.name}</p>
                        <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 14 }}>{userProfile.email}</p>

                        {/* Role badge */}
                        <span style={{
                            fontSize: 9, fontFamily: "'DM Mono',monospace",
                            color: '#6b7280', letterSpacing: '0.14em',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.04)',
                            padding: '4px 12px', borderRadius: 4,
                            textTransform: 'uppercase', display: 'inline-block',
                        }}>
                            PROFESSOR · ACTIVE
                        </span>
                    </div>

                    {/* Stats */}
                    <div style={{
                        borderRadius: 14, padding: '20px 24px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                        <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#374151', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Activity</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, color: '#6b7280' }}>Uploads</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#e5e7eb', fontFamily: "'DM Mono',monospace" }}>{stats.uploads}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, color: '#6b7280' }}>Public Files</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#e5e7eb', fontFamily: "'DM Mono',monospace" }}>{stats.publicFiles}</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta info */}
                    <div style={{
                        borderRadius: 14, padding: '20px 24px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                        <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#374151', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Details</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                            {[
                                { icon: Shield, text: userProfile.employeeId || 'Not set' },
                                { icon: BookOpen, text: userProfile.department || 'Not set' },
                                { icon: Calendar, text: userProfile.designation || 'Professor' },
                                { icon: Clock, text: `Joined ${new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` },
                            ].map(({ icon: Icon, text }, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Icon size={13} color="#374151" style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: '#6b7280' }}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Editable info */}
                    <div style={{
                        borderRadius: 14, padding: '24px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                        <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#374151', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 22 }}>Account Information</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <EditableField label="Full Name" value={userProfile.name} onSave={update('name')} />
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                            <EditableField label="Department" value={userProfile.department || 'Not set'} onSave={update('department')} />
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                            <EditableField label="Designation" value={userProfile.designation || 'Professor'} onSave={update('designation')} />
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                            <EditableField label="Bio" value={userProfile.bio || 'Add a bio...'} onSave={update('bio')} />
                        </div>

                        {/* Non-editable fields */}
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                { label: 'Email', value: userProfile.email, icon: Mail },
                                { label: 'Employee ID', value: userProfile.employeeId || 'Not set', icon: Shield },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label}>
                                    <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#374151', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Icon size={13} color="#374151" />
                                        <p style={{ fontSize: 13.5, color: '#6b7280' }}>{value}</p>
                                        <Lock size={10} color="#1f2937" style={{ marginLeft: 'auto' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent activity */}
                    <div style={{
                        borderRadius: 14, padding: '24px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                        <p style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#374151', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 18 }}>Recent Activity</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center', padding: '20px 0', opacity: 0.5 }}>
                            <Clock size={20} color="#374151" style={{ marginBottom: 8 }} />
                            <p style={{ fontSize: 12, color: '#6b7280' }}>No recent activity to show.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}