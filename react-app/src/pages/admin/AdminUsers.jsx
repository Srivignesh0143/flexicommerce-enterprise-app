import { useState, useEffect } from 'react';
import { Users, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../admin/AdminLayout.css';

const AdminUsers = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.recentUsers);
                setStats(data);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="admin-empty"><p>Loading users...</p></div>;

    return (
        <div>
            <div className="admin-page-header">
                <h1>Users</h1>
                <p>View registered customers and user statistics</p>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="stat-card">
                    <div className="stat-card-info">
                        <h3>Total Users</h3>
                        <span className="stat-value">{stats?.userCount || 0}</span>
                    </div>
                    <div className="stat-card-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                        <Users size={24} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-info">
                        <h3>Recent Signups</h3>
                        <span className="stat-value">{users.length}</span>
                    </div>
                    <div className="stat-card-icon" style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                        <Calendar size={24} />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2>Recent Users</h2>
                </div>

                {users.length === 0 ? (
                    <div className="admin-empty">
                        <Users size={48} />
                        <h3>No users registered yet</h3>
                        <p>Users will appear here when they sign up</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Joined Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, idx) => (
                                <tr key={u._id}>
                                    <td>{idx + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
