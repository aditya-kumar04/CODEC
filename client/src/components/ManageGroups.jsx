
import React, { useState, useEffect } from 'react'
import { Users, Plus, X, UserPlus, CheckCircle, Shield, ShieldAlert, Star, Trash2 } from 'lucide-react'

// ─── Group Details View ──────────────────────────────────────────────────────

function GroupDetails({ group, allUsers, onUpdate, onDelete, onClose }) {
    const [isAdding, setIsAdding] = useState(false)
    const [selectedNewMembers, setSelectedNewMembers] = useState([])
    
    // Safely extract current user ID from local storage
    const storedUserId = localStorage.getItem('codec_user_id')
    let currentUserId = storedUserId
    if (!currentUserId) {
        const storedUser = localStorage.getItem('codec_user')
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser)
                currentUserId = userObj.id || userObj._id
            } catch (e) {
                console.error("Error parsing stored user")
            }
        }
    }

    // Safety check for group structure
    const isCreator = group?.creator === currentUserId || group?.creator?._id === currentUserId
    const isAdmin = group?.admins?.some(admin => admin === currentUserId || admin?._id === currentUserId)
    const hasPermissions = isCreator || isAdmin

    console.log("Auth Data:", { currentUserId, creatorId: group?.creator?._id || group?.creator, hasPermissions })

    const handleAddMembers = async () => {
        console.log("Adding members to group:", group._id, selectedNewMembers);
        const token = localStorage.getItem('codec_token')
        try {
            // RULE 4: NETWORK REQUIREMENTS (Headers & Payload)
            const res = await fetch(`http://localhost:5050/api/groups/${group._id}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ newMemberIds: selectedNewMembers })
            })
            const data = await res.json()
            if (res.ok) {
                console.log("Successfully added members:", data);
                // RULE 4: STATE UPDATE (Immediate refresh)
                onUpdate(data)
                setIsAdding(false)
                setSelectedNewMembers([])
            } else {
                console.error("Add members failed:", data.message);
                alert(data.message || "Failed to add members");
            }
        } catch (err) {
            console.error("Add members network error:", err)
        }
    }

    const handlePromote = async (userId) => {
        if (!window.confirm("Promote this member to Group Admin?")) return
        console.log("Promoting user to admin:", userId, "in group:", group._id);
        const token = localStorage.getItem('codec_token')
        try {
            // RULE 4: NETWORK REQUIREMENTS (Headers & Payload)
            const res = await fetch(`http://localhost:5050/api/groups/${group._id}/admins`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ userId })
            })
            const data = await res.json()
            if (res.ok) {
                console.log("Successfully promoted to admin:", data);
                // RULE 4: STATE UPDATE (Immediate refresh)
                onUpdate(data)
            } else {
                console.error("Promote admin failed:", data.message);
                alert(data.message || "Failed to promote member");
            }
        } catch (err) {
            console.error("Promote admin network error:", err)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) return
        console.log("Deleting group:", group._id);
        const token = localStorage.getItem('codec_token')
        try {
            // RULE 4: NETWORK REQUIREMENTS (Headers)
            const res = await fetch(`http://localhost:5050/api/groups/${group._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            const data = await res.json()
            if (res.ok) {
                console.log("Group deleted successfully");
                // RULE 4: STATE UPDATE (Immediate removal)
                onDelete(group._id)
                onClose()
            } else {
                console.error("Delete group failed:", data.message);
                alert(data.message || "Failed to delete group");
            }
        } catch (err) {
            console.error("Delete group network error:", err)
        }
    }

    const availableToInvite = allUsers.filter(u =>
        !group.members?.some(m => m._id === u._id)
    )

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(3,3,3,0.95)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={onClose}>
            <div style={{
                width: '90%', maxWidth: 550, background: '#0e0e12', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
                padding: 32, display: 'flex', flexDirection: 'column', gap: 24, maxHeight: '85vh', overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb' }}>{group.name}</h2>
                            {hasPermissions && <span style={{ fontSize: 9, background: 'rgba(129,140,248,0.1)', color: '#a5b4fc', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(129,140,248,0.2)' }}>YOU ARE ADMIN</span>}
                        </div>
                        <p style={{ fontSize: 13, color: '#4b5563' }}>{group.members?.length || 0} members · Created {new Date(group.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {hasPermissions && (
                            <button
                                onClick={handleDelete}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 14px', borderRadius: 10,
                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                    color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            >
                                <Trash2 size={14} /> Delete Group
                            </button>
                        )}
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}><X size={22} /></button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Members</p>
                    {group.members?.map(member => {
                        const isMemberAdmin = group.admins?.some(a => (a._id || a).toString() === member._id)
                        return (
                            <div key={member._id} style={{
                                padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{member.name[0]}</div>
                                    <div>
                                        <p style={{ fontSize: 14, color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {member.name}
                                            {isMemberAdmin && <span style={{ fontSize: 10, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 2 }}><Star size={10} fill="#fbbf24" /> Admin</span>}
                                        </p>
                                        <p style={{ fontSize: 11, color: '#374151' }}>{member.designation} · {member.department}</p>
                                    </div>
                                </div>
                                {hasPermissions && !isMemberAdmin && (
                                    <button
                                        onClick={() => handlePromote(member._id)}
                                        style={{
                                            padding: '6px 12px', borderRadius: 8, background: 'rgba(251,191,36,0.05)',
                                            border: '1px solid rgba(251,191,36,0.1)', color: '#fbbf24', fontSize: 11, cursor: 'pointer'
                                        }}
                                    >Make Admin</button>
                                )}
                            </div>
                        )
                    })}
                </div>

                {hasPermissions && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
                        {!isAdding ? (
                            <button
                                onClick={() => setIsAdding(true)}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', color: '#f3f4f6', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                                }}
                            >+ Add New Members</button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {availableToInvite.length === 0 ? <p style={{ color: '#374151', fontSize: 12 }}>All professors are already members.</p> :
                                        availableToInvite.map(u => (
                                            <div
                                                key={u._id}
                                                onClick={() => setSelectedNewMembers(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id])}
                                                style={{
                                                    padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                                                    background: selectedNewMembers.includes(u._id) ? 'rgba(129,140,248,0.1)' : 'transparent',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                                }}
                                            >
                                                <span style={{ fontSize: 13, color: '#9ca3af' }}>{u.name}</span>
                                                {selectedNewMembers.includes(u._id) && <CheckCircle size={14} color="#a5b4fc" />}
                                            </div>
                                        ))}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setIsAdding(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280', cursor: 'pointer' }}>Cancel</button>
                                    <button
                                        onClick={handleAddMembers}
                                        disabled={selectedNewMembers.length === 0}
                                        style={{ flex: 2, padding: '10px', borderRadius: 10, background: '#f9fafb', color: '#09090b', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                                    >Add {selectedNewMembers.length} Members</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ManageGroups() {
    const [groups, setGroups] = useState([])
    const [allUsers, setAllUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [newGroupName, setNewGroupName] = useState('')
    const [selectedMembers, setSelectedMembers] = useState([])
    const [message, setMessage] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('codec_token')
            try {
                const [groupsRes, usersRes] = await Promise.all([
                    fetch('http://localhost:5050/api/groups', { headers: { Authorization: 'Bearer ' + token } }),
                    fetch('http://localhost:5050/api/users', { headers: { Authorization: 'Bearer ' + token } })
                ])
                if (groupsRes.ok) {
                    const data = await groupsRes.json();
                    console.log("Fetched groups:", data);
                    setGroups(data);
                }
                if (usersRes.ok) {
                    const users = await usersRes.json();
                    setAllUsers(users.filter(u => u._id !== localStorage.getItem('codec_user_id')));
                }
            } catch (err) {
                console.error("Fetch error", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleCreateGroup = async (e) => {
        e.preventDefault()
        if (!newGroupName.trim()) return

        const token = localStorage.getItem('codec_token')
        try {
            const res = await fetch('http://localhost:5050/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ name: newGroupName, memberIds: selectedMembers })
            })
            if (res.ok) {
                const newGroup = await res.json()
                setGroups([newGroup, ...groups])
                setNewGroupName('')
                setSelectedMembers([])
                setShowCreate(false)
                setMessage({ type: 'success', text: 'Group created successfully!' })
                setTimeout(() => setMessage(null), 3000)
            }
        } catch (err) {
            console.error("Create group error", err)
        }
    }

    const toggleMember = (id) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        )
    }

    const updateGroupInList = (updatedGroup) => {
        // RULE 4: STATE UPDATE (Immediate refresh in parent list)
        setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g))
        setSelectedGroup(updatedGroup)
    }

    const removeGroupFromList = (groupId) => {
        // RULE 4: STATE UPDATE (Immediate removal in parent list)
        setGroups(prev => prev.filter(g => g._id !== groupId))
    }

    if (loading) return <div style={{ padding: 40, color: '#4b5563' }}>Loading groups...</div>

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.4px', marginBottom: 6 }}>Custom Groups</h1>
                    <p style={{ fontSize: 13, color: '#4b5563' }}>Create and manage collaborative mini-communities.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#f3f4f6', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                >
                    <Plus size={16} /> Create Group
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '12px 16px', borderRadius: 10, marginBottom: 24,
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    color: '#4ade80', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
                }}>
                    <CheckCircle size={16} /> {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {groups.map(group => (
                    <div
                        key={group._id}
                        onClick={() => setSelectedGroup(group)}
                        style={{
                            padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 16,
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12, background: 'rgba(129,140,248,0.1)',
                                border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Users size={20} color="#a5b4fc" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f3f4f6' }}>{group.name}</h3>
                                <p style={{ fontSize: 11, color: '#4b5563', fontFamily: "'DM Mono',monospace" }}>{group.members?.length || 0} MEMBERS</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {group.members?.slice(0, 5).map(m => (
                                <div key={m._id} style={{
                                    fontSize: 10, color: '#9ca3af', background: 'rgba(255,255,255,0.04)',
                                    padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)'
                                }}>{m.name}</div>
                            ))}
                            {group.members?.length > 5 && (
                                <div style={{ fontSize: 10, color: '#374151', padding: '3px 8px' }}>+{group.members.length - 5} more</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Group Modal */}
            {showCreate && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(3,3,3,0.9)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setShowCreate(false)}>
                    <div style={{
                        width: '90%', maxWidth: 500, background: '#0e0e12', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
                        padding: 32, display: 'flex', flexDirection: 'column', gap: 24
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f9fafb' }}>New Group</h2>
                            <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>Group Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g., Physics Committee 2026"
                                    value={newGroupName}
                                    onChange={e => setNewGroupName(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)', color: '#f3f4f6', fontSize: 14, outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>Add Members</label>
                                <div style={{
                                    maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6,
                                    padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    {allUsers.map(user => (
                                        <div
                                            key={user._id}
                                            onClick={() => toggleMember(user._id)}
                                            style={{
                                                padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                                                background: selectedMembers.includes(user._id) ? 'rgba(129,140,248,0.1)' : 'transparent',
                                                border: selectedMembers.includes(user._id) ? '1px solid rgba(129,140,248,0.2)' : '1px solid transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.1s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{user.name[0]}</div>
                                                <div>
                                                    <p style={{ fontSize: 13, color: selectedMembers.includes(user._id) ? '#a5b4fc' : '#9ca3af' }}>{user.name}</p>
                                                    <p style={{ fontSize: 9, color: '#374151' }}>{user.department}</p>
                                                </div>
                                            </div>
                                            {selectedMembers.includes(user._id) ? <CheckCircle size={14} color="#a5b4fc" /> : <UserPlus size={14} color="#374151" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!newGroupName.trim()}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: 12, marginTop: 10,
                                    background: newGroupName.trim() ? '#f9fafb' : 'rgba(255,255,255,0.03)',
                                    color: newGroupName.trim() ? '#09090b' : '#374151',
                                    fontSize: 14, fontWeight: 700, border: 'none', cursor: newGroupName.trim() ? 'pointer' : 'default', transition: 'all 0.15s'
                                }}
                            >
                                Create Community Group
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Group Details Modal */}
            {selectedGroup && (
                <GroupDetails
                    group={selectedGroup}
                    allUsers={allUsers}
                    onUpdate={updateGroupInList}
                    onDelete={removeGroupFromList}
                    onClose={() => setSelectedGroup(null)}
                />
            )}
        </div>
    )
}
