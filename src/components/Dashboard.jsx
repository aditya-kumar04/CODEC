import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Search, Users, LogOut, Cpu, UserCircle, Bell, CheckCircle, Share2, Trash2 } from 'lucide-react'
import MyUploadsView from './MyUploadsView'
import SearchPageView from './SearchPageView'
import CommunityView from './CommunityView'
import ProfileView from './ProfileView'
import SharedDocuments from './SharedDocuments'
import ManageGroups from './ManageGroups'

const NAV = [
  { id: 'uploads', icon: Upload, label: 'My Files' },
  { id: 'search', icon: Search, label: 'Deep Search' },
  { id: 'shared', icon: Share2, label: 'Shared' },
  { id: 'groups', icon: Users, label: 'My Groups' },
  { id: 'community', icon: Users, label: 'Community' },
]

export default function Dashboard({ userRole }) {
  const navigate = useNavigate()
  const [view, setView] = useState('uploads')
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('codec_token')
      if (!token) return
      const res = await fetch('http://localhost:5050/api/notifications', {
        headers: { Authorization: 'Bearer ' + token }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error("Notif fetch error", err)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('codec_token')
      await fetch(`http://localhost:5050/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + token }
      })
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error("Mark read error", err)
    }
  }

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('codec_token')
      const res = await fetch(`http://localhost:5050/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      })
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id))
      }
    } catch (err) {
      console.error("Delete notif error", err)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Redirect admins to admin dashboard
  React.useEffect(() => {
    if (userRole === 'Admin') {
      navigate('/admin', { replace: true })
    }
  }, [userRole, navigate])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('codec_token')
    localStorage.removeItem('codec_user')
    navigate('/login', { replace: true })
  }, [navigate])

  const renderView = () => {
    if (view === 'uploads') return <MyUploadsView userRole={userRole} />
    if (view === 'search') return <SearchPageView />
    if (view === 'community') return <CommunityView />
    if (view === 'profile') return <ProfileView />
    if (view === 'shared') return <SharedDocuments />
    if (view === 'groups') return <ManageGroups />
    return null
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#e5e7eb' }}
    >
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        height: '100vh', position: 'sticky', top: 0, overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Brand */}
        <div style={{ padding: '28px 24px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Cpu size={13} color="#e5e7eb" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.3px' }}>Codec</span>
          </div>
          <p style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#374151', letterSpacing: '0.18em', paddingLeft: 36 }}>
            RGIPT · REPOSITORY
          </p>
        </div>

        {/* Notifications */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell size={14} color={unreadCount > 0 ? '#f87171' : '#6b7280'} />
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Alerts</span>
            </div>
            {unreadCount > 0 && (
              <span style={{
                background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 700,
                padding: '2px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center'
              }}>{unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', top: '100%', left: 12, right: 12, zIndex: 100,
              marginTop: 8, background: '#111114', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              maxHeight: 300, overflowY: 'auto', padding: '12px'
            }}>
              <p style={{ fontSize: 10, color: '#374151', fontFamily: "'DM Mono',monospace", marginBottom: 10, letterSpacing: '0.1em' }}>NOTIFICATIONS</p>
              {notifications.length === 0 ? <p style={{ fontSize: 11, color: '#4b5563', textAlign: 'center', padding: '20px 0' }}>No notifications</p> :
                notifications.map(n => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    style={{
                      padding: '10px', borderRadius: 8, marginBottom: 6,
                      background: n.isRead ? 'transparent' : 'rgba(255,255,255,0.03)',
                      border: n.isRead ? '1px solid transparent' : '1px solid rgba(255,255,255,0.05)',
                      cursor: n.isRead ? 'default' : 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    <p style={{ fontSize: 12, color: n.isRead ? '#6b7280' : '#e5e7eb', marginBottom: 4, lineHeight: 1.4 }}>{n.message}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 9, color: '#374151' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!n.isRead && <CheckCircle size={10} color="#4ade80" />}
                        <button
                          onClick={(e) => deleteNotif(e, n._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: '#374151' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                          onMouseLeave={e => e.currentTarget.style.color = '#374151'}
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Role chip */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{
            fontSize: 9, fontFamily: "'DM Mono', monospace",
            color: '#6b7280', letterSpacing: '0.14em',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.03)',
            padding: '3px 10px', borderRadius: 4,
            textTransform: 'uppercase',
          }}>
            {userRole ?? 'Professor'} · Active
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ id, icon: Icon, label }) => {
            const active = view === id
            return (
              <button key={id} onClick={() => setView(id)} style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '9px 12px', borderRadius: 8, border: 'none',
                background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                borderLeft: active ? '2px solid rgba(255,255,255,0.35)' : '2px solid transparent',
                color: active ? '#f9fafb' : '#4b5563',
                fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#9ca3af' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b5563' } }}
              >
                <Icon size={14} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Profile + Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Profile button */}
          <button onClick={() => setView('profile')} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 11,
            padding: '9px 12px', borderRadius: 8, border: 'none',
            background: view === 'profile' ? 'rgba(255,255,255,0.07)' : 'transparent',
            borderLeft: view === 'profile' ? '2px solid rgba(255,255,255,0.35)' : '2px solid transparent',
            color: view === 'profile' ? '#f9fafb' : '#4b5563',
            fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
          }}
            onMouseEnter={e => { if (view !== 'profile') { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#9ca3af' } }}
            onMouseLeave={e => { if (view !== 'profile') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b5563' } }}
          >
            <UserCircle size={14} /> Profile
          </button>

          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 11,
            padding: '9px 12px', borderRadius: 8, border: 'none',
            background: 'transparent', color: '#374151',
            fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,100,100,0.07)'; e.currentTarget.style.color = '#9ca3af' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151' }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── View ── */}
      <main style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderView()}
      </main>
    </div>
  )
}