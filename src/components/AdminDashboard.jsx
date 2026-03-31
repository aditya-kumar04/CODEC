import React, { useState, useEffect } from 'react';
import { Users, FileText, HardDrive, Eye, EyeOff, Trash2, Shield, UserCheck, BarChart3, Download } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  const token = localStorage.getItem('codec_token');

  useEffect(() => {
    if (!token) {
      console.error('No authentication token found');
      setLoading(false);
      return;
    }
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsRes, usersRes, docsRes] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/documents', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!statsRes.ok) {
        console.error('Stats API error:', statsRes.status, statsRes.statusText);
      } else {
        setStats(await statsRes.json());
      }
      
      if (!usersRes.ok) {
        console.error('Users API error:', usersRes.status, usersRes.statusText);
      } else {
        setUsers(await usersRes.json());
      }
      
      if (!docsRes.ok) {
        console.error('Documents API error:', docsRes.status, docsRes.statusText);
        const errorText = await docsRes.text();
        console.error('Error response body:', errorText);
      } else {
        const docsData = await docsRes.json();
        setDocuments(docsData);
      }
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user and all their documents?')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setUsers(users.filter(user => user._id !== userId));
        setDocuments(documents.filter(doc => doc.uploader._id !== userId));
        alert('User deleted successfully');
        fetchAdminData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const deleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setDocuments(documents.filter(doc => doc._id !== docId));
        alert('Document deleted successfully');
        fetchAdminData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  };

  const toggleDocumentVisibility = async (docId) => {
    try {
      const res = await fetch(`/api/admin/documents/${docId}/visibility`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setDocuments(documents.map(doc => 
          doc._id === docId ? { ...doc, isPublic: !doc.isPublic } : doc
        ));
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (res.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-gray-300">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage users, documents, and system settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['stats', 'users', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Users</p>
                    <p className="text-2xl font-semibold text-white">{stats.users.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Admins</p>
                    <p className="text-2xl font-semibold text-white">{stats.users.admins}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-purple-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Professors</p>
                    <p className="text-2xl font-semibold text-white">{stats.users.professors}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-indigo-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Documents</p>
                    <p className="text-2xl font-semibold text-white">{stats.documents.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Public</p>
                    <p className="text-2xl font-semibold text-white">{stats.documents.public}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
                <div className="flex items-center">
                  <EyeOff className="h-8 w-8 text-red-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Private</p>
                    <p className="text-2xl font-semibold text-white">{stats.documents.private}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-orange-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Recent (7 days)</p>
                    <p className="text-2xl font-semibold text-white">{stats.documents.recent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Stats */}
            <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
              <div className="flex items-center mb-4">
                <HardDrive className="h-8 w-8 text-blue-400" />
                <h3 className="ml-4 text-lg font-medium text-white">Storage Usage</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Total Storage Used</p>
                  <p className="text-xl font-semibold text-white">{formatFileSize(stats.storage.totalSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Average File Size</p>
                  <p className="text-xl font-semibold text-white">{formatFileSize(stats.storage.avgSize)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">All Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uploads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Storage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          className={`text-sm px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 ${
                            user.role === 'Admin' 
                              ? 'bg-green-900 text-green-200 border-green-700' 
                              : 'bg-gray-700 text-gray-200 border-gray-600'
                          }`}
                        >
                          <option value="Professor">Professor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.stats.totalUploads} ({user.stats.publicFiles} public)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatFileSize(user.stats.totalSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">All Documents ({documents.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uploader</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Visibility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                        <div className="flex flex-col items-center">
                          <FileText className="h-12 w-12 text-gray-500 mb-3" />
                          <p className="text-lg font-medium mb-1">No documents found</p>
                          <p className="text-sm">Users need to upload documents through their dashboard</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{doc.originalName}</div>
                            <div className="text-sm text-gray-400">{doc.mimeType}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {doc.uploader ? doc.uploader.name : 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {doc.uploader ? doc.uploader.email : 'No email'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatFileSize(doc.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleDocumentVisibility(doc._id)}
                            className={`px-2 py-1 text-xs rounded ${
                              doc.isPublic 
                                ? 'bg-green-900 text-green-200 border border-green-700' 
                                : 'bg-red-900 text-red-200 border border-red-700'
                            }`}
                          >
                            {doc.isPublic ? 'Public' : 'Private'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => deleteDocument(doc._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
