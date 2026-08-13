import { useState, useEffect } from 'react';
import { MessageSquare, Search, Mail, MailOpen, CheckCircle, Trash2, Calendar, User, Info, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ExcelJS from 'exceljs';
import './AdminLayout.css';

const AdminQueries = () => {
    const { token } = useAuth();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedQuery, setSelectedQuery] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const res = await fetch(`${API_URL}/contact`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setQueries(data);
            }
        } catch (err) {
            console.error('Failed to fetch queries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/contact/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const updated = await res.json();
                setQueries(prev => prev.map(q => q._id === id ? updated : q));
                if (selectedQuery && selectedQuery._id === id) {
                    setSelectedQuery(updated);
                }
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleDeleteQuery = async (id) => {
        if (!window.confirm('Are you sure you want to delete this query?')) return;
        try {
            const res = await fetch(`${API_URL}/contact/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setQueries(prev => prev.filter(q => q._id !== id));
                if (selectedQuery && selectedQuery._id === id) {
                    setSelectedQuery(null);
                }
            }
        } catch (err) {
            console.error('Failed to delete query:', err);
        }
    };

    // Filters & Search
    const filtered = queries.filter(q => {
        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
        const matchesSearch = 
            q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Customer Queries');

        // Setup columns with headers and widths
        worksheet.columns = [
            { header: 'S.No', key: 'sNo', width: 8 },
            { header: 'Status', key: 'status', width: 14 },
            { header: 'Customer Name', key: 'name', width: 22 },
            { header: 'Email Address', key: 'email', width: 28 },
            { header: 'Subject', key: 'subject', width: 32 },
            { header: 'Message Details', key: 'message', width: 55 },
            { header: 'Date Submitted', key: 'date', width: 22 }
        ];

        // Add rows
        filtered.forEach((q, idx) => {
            worksheet.addRow({
                sNo: idx + 1,
                status: q.status.toUpperCase(),
                name: q.name,
                email: q.email,
                subject: q.subject,
                message: q.message,
                date: new Date(q.createdAt).toLocaleString('en-IN')
            });
        });

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF2563EB' } // Brand blue
            };
            cell.font = {
                name: 'Segoe UI',
                size: 11,
                bold: true,
                color: { argb: 'FFFFFFFF' }
            };
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF1E40AF' } },
                left: { style: 'thin', color: { argb: 'FF1E40AF' } },
                bottom: { style: 'thin', color: { argb: 'FF1E40AF' } },
                right: { style: 'thin', color: { argb: 'FF1E40AF' } }
            };
        });

        // Style data rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            row.height = 22;
            const isEven = rowNumber % 2 === 0;

            row.eachCell((cell, colNumber) => {
                cell.font = {
                    name: 'Segoe UI',
                    size: 10
                };
                
                if (colNumber === 1 || colNumber === 2 || colNumber === 7) {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: colNumber === 6 };
                }

                if (isEven) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF8FAFC' } // Slate 50
                    };
                } else {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' }
                    };
                }

                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'customer_queries.xlsx';
        link.click();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'new':
                return <span className="admin-status-badge badge-pending">New</span>;
            case 'read':
                return <span className="admin-status-badge badge-shipped">Read</span>;
            case 'resolved':
                return <span className="admin-status-badge badge-delivered">Resolved</span>;
            default:
                return null;
        }
    };

    if (loading) return <div className="admin-empty"><p>Loading customer queries...</p></div>;

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Customer Queries</h1>
                    <p>Manage and respond to message submissions from the Contact Us page</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="search-bar-wrapper" style={{ flexGrow: 1, position: 'relative', maxWidth: '400px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input
                        type="text"
                        placeholder="Search queries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 16px 10px 36px',
                            border: '1px solid var(--gray-200)',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>
                <div className="filter-tabs" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {['all', 'new', 'read', 'resolved'].map(tab => (
                        <button
                            key={tab}
                            className={`btn ${statusFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setStatusFilter(tab)}
                            style={{ textTransform: 'capitalize', padding: '8px 16px', fontSize: '0.875rem' }}
                        >
                            {tab}
                        </button>
                    ))}
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleExportExcel}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            padding: '8px 16px', 
                            fontSize: '0.875rem', 
                            color: '#10b981', 
                            borderColor: '#10b981', 
                            background: 'rgba(16, 185, 129, 0.05)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <FileSpreadsheet size={16} />
                        <span>Export Excel</span>
                    </button>
                </div>
            </div>

            {/* Queries Table */}
            <div className="admin-table-wrapper">
                {filtered.length === 0 ? (
                    <div className="admin-empty">
                        <MessageSquare size={48} />
                        <h3>No customer queries found</h3>
                        <p>When customers submit messages, they will appear here</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Customer Name</th>
                                <th>Email</th>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((q) => (
                                <tr key={q._id} style={{ fontWeight: q.status === 'new' ? '600' : 'normal', background: q.status === 'new' ? 'rgba(37, 99, 235, 0.02)' : 'none' }}>
                                    <td>{getStatusBadge(q.status)}</td>
                                    <td>{q.name}</td>
                                    <td>{q.email}</td>
                                    <td>{q.subject}</td>
                                    <td>{new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="table-action-btn" 
                                                onClick={() => {
                                                    setSelectedQuery(q);
                                                    if (q.status === 'new') {
                                                        handleUpdateStatus(q._id, 'read');
                                                    }
                                                }}
                                                title="View Message"
                                            >
                                                <Info size={16} />
                                            </button>
                                            {q.status !== 'resolved' ? (
                                                <button 
                                                    className="table-action-btn" 
                                                    style={{ color: 'var(--success)' }}
                                                    onClick={() => handleUpdateStatus(q._id, 'resolved')}
                                                    title="Mark Resolved"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            ) : (
                                                <button 
                                                    className="table-action-btn" 
                                                    style={{ color: 'var(--gray-400)' }}
                                                    onClick={() => handleUpdateStatus(q._id, 'read')}
                                                    title="Mark Unresolved"
                                                >
                                                    <MailOpen size={16} />
                                                </button>
                                            )}
                                            <button 
                                                className="table-action-btn" 
                                                style={{ color: 'var(--danger)' }}
                                                onClick={() => handleDeleteQuery(q._id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Query Modal */}
            {selectedQuery && (
                <div className="admin-modal-overlay" onClick={() => setSelectedQuery(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Query Details</h2>
                            <button className="table-action-btn" onClick={() => setSelectedQuery(null)}>x</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '12px' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: 'var(--gray-500)' }}>Customer Name</h4>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedQuery.name}</p>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: 'var(--gray-500)' }}>Email Address</h4>
                                    <p style={{ margin: 0, color: 'var(--primary-600)' }}><a href={`mailto:${selectedQuery.email}`}>{selectedQuery.email}</a></p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '12px' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: 'var(--gray-500)' }}>Subject</h4>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedQuery.subject}</p>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: 'var(--gray-500)' }}>Submitted At</h4>
                                    <p style={{ margin: 0 }}>{new Date(selectedQuery.createdAt).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: 'var(--gray-500)' }}>Message</h4>
                                <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-line', fontSize: '0.938rem', lineHeight: '1.5', border: '1px solid var(--gray-100)' }}>
                                    {selectedQuery.message}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                {selectedQuery.status !== 'resolved' && (
                                    <button 
                                        className="btn btn-primary" 
                                        style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                                        onClick={() => handleUpdateStatus(selectedQuery._id, 'resolved')}
                                    >
                                        Mark as Resolved
                                    </button>
                                )}
                                <button className="btn btn-secondary" onClick={() => setSelectedQuery(null)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminQueries;
