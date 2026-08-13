import { useState, useEffect } from 'react';
import {
  Users, Package, ShoppingBag, TrendingUp, Award,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Activity,
  CreditCard, CheckCircle, Clock, BarChart2, MapPin, Tag
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const COLORS = ['#2563eb', '#3b82f6', '#0ea5e9', '#06b6d4', '#6366f1', '#4f46e5', '#1d4ed8', '#1e40af'];

const fmt    = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

const getCategoryColor = (name) => {
  if (!name) return '#2563eb';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 55%)`;
};

const getChartWidth = (data, minWidthPerItem = 45, defaultMinWidth = 280) => {
  if (!data || data.length === 0) return '100%';
  const computedWidth = data.length * minWidthPerItem;
  return computedWidth > defaultMinWidth ? `${computedWidth}px` : '100%';
};

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const num = typeof target === 'number' ? target : 0;
    if (!num) { setVal(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * num));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

function KpiCard({ icon: Icon, label, value, prefix = '', suffix = '', sub, color }) {
  const isNum   = typeof value === 'number';
  const animated = useCountUp(isNum ? value : 0);
  const display  = isNum ? `${prefix}${fmt(animated)}${suffix}` : (value ?? '—');
  return (
    <div className="kpi-card-v3">
      <div className="kpi-body">
        <div className="kpi-info-side">
          <span className="kpi-label-v3">{label}</span>
          <span className="kpi-value-v3">{display}</span>
          {sub && <span className="kpi-sub-v3">{sub}</span>}
        </div>
        <div className="kpi-icon-side" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={22} />
        </div>
      </div>
      <div className="kpi-footer-v3">
        <span className="kpi-link-v3">View Details</span>
        <ArrowUpRight size={12} className="kpi-link-arrow" />
      </div>
    </div>
  );
}

const ChartTip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="ctt-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {currency ? fmtCur(p.value) : fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeRange, setRange]   = useState('monthly');
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Loading analytics…</p>
    </div>
  );

  if (!stats) return (
    <div className="admin-empty">
      <h3>Unable to load dashboard data</h3>
      <p>Please check your connection and try again.</p>
    </div>
  );

  // ── Safe destructure with fallbacks ──────────────────────────────────────
  const os  = stats.orderStatus       || {};
  const ps  = stats.paymentStatus     || {};
  const pms = stats.paymentMethodSplit || {};

  const topProducts      = stats.topProducts      || [];
  const topCustomers     = stats.topCustomers     || [];
  const lowStockProducts = stats.lowStockProducts || [];
  const categoryRevenue  = stats.categoryRevenue  || [];
  const categoryData     = stats.categoryData     || [];
  const userMonthlyData  = stats.userMonthlyData  || [];
  const dailyData        = stats.dailyData        || [];
  const monthlyData      = stats.monthlyData      || [];
  const recentOrders     = stats.recentOrders     || [];
  const recentUsers      = stats.recentUsers      || [];

  const orderStatusData = [
    { name: 'Pending',   value: os.pendingOrders   || 0, fill: '#f59e0b' },
    { name: 'Confirmed', value: os.confirmedOrders || 0, fill: '#3b82f6' },
    { name: 'Shipped',   value: os.shippedOrders   || 0, fill: '#8b5cf6' },
    { name: 'Delivered', value: os.deliveredOrders || 0, fill: '#10b981' },
    { name: 'Cancelled', value: os.cancelledOrders || 0, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const paymentData = [
    { name: 'Verified', value: ps.paymentVerified || 0, fill: '#10b981' },
    { name: 'Pending',  value: ps.paymentPending  || 0, fill: '#f59e0b' },
    { name: 'Failed',   value: ps.paymentFailed   || 0, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const methodData = [
    { name: 'Cash on Delivery', value: pms.codOrders    || 0, fill: '#f59e0b' },
    { name: 'Online',           value: pms.onlineOrders || 0, fill: '#6366f1' },
  ].filter(d => d.value > 0);

  const trendData = activeRange === 'monthly' ? monthlyData : dailyData;
  const trendKey  = activeRange === 'monthly' ? 'month' : 'date';

  const conversionRate = stats.userCount > 0 ? parseFloat(((stats.orderCount / stats.userCount) * 100).toFixed(1)) : 0;
  const activeOrdersCount = (os.pendingOrders || 0) + (os.confirmedOrders || 0) + (os.shippedOrders || 0);
  const cancelRate = stats.orderCount > 0 ? parseFloat(((os.cancelledOrders || 0) / stats.orderCount * 100).toFixed(1)) : 0;
  const lowStockCount = lowStockProducts.length;

  const totalOrderStatus = orderStatusData.reduce((sum, d) => sum + d.value, 0);
  const totalPaymentStatus = paymentData.reduce((sum, d) => sum + d.value, 0);
  const totalPaymentMethod = methodData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="dashboard-v2">

      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Analytics Dashboard</h1>
          <p className="dash-subtitle">Store performance overview</p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-grid">
        <KpiCard icon={Users}         label="Total Users"      value={stats.userCount}     sub={`${stats.userCount} registered`} color="#2563eb" />
        <KpiCard icon={Package}       label="Total Products"   value={stats.productCount}  sub={`${stats.productCount} items`} color="#2563eb" />
        <KpiCard icon={ShoppingBag}    label="Total Orders"     value={stats.orderCount}    sub={`${stats.orderCount} total`} color="#2563eb" />
        <KpiCard icon={TrendingUp}    label="Total Revenue"    value={stats.totalRevenue}  prefix="₹" sub="Verified sales" color="#2563eb" />
        <KpiCard icon={CreditCard}    label="Avg Order Value"  value={stats.avgOrderValue} prefix="₹" sub="Per checkout value" color="#2563eb" />
        <KpiCard icon={Activity}      label="Conversion Rate"  value={conversionRate}      suffix="%" sub="Order-to-user ratio" color="#2563eb" />
        <KpiCard icon={Clock}         label="Active Orders"    value={activeOrdersCount}   sub={`${activeOrdersCount} pending`} color="#2563eb" />
        <KpiCard icon={AlertTriangle}  label="Low Stock Alerts" value={lowStockCount}       sub={`${lowStockCount} items low`} color="#ef4444" />
      </div>

      {/* ── Row 1 ── */}
      <div className="charts-row three-col">
        {/* Recent Orders compact table */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><Clock size={16} /> Recent Orders</h3>
          </div>
          {recentOrders.length > 0 ? (
            <div className="dash-table-wrap compact">
              <table className="admin-table compact">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 5).map((o) => (
                    <tr key={o._id}>
                      <td>
                        <div className="cell-name">{o.userName}</div>
                        <div className="cell-sub">#{(o._id || '').slice(-6).toUpperCase()}</div>
                      </td>
                      <td><strong>{fmtCur(o.grandTotal)}</strong></td>
                      <td>
                        <span className={`status-badge status-order-${o.status}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                          <span className={`status-badge status-method-${o.paymentMethod || 'cod'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                            {o.paymentMethod === 'online' ? 'ONLINE' : 'COD'}
                          </span>
                          <span className={`status-badge status-payment-${o.paymentMethod === 'online' ? 'verified' : o.paymentStatus}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                            {o.paymentMethod === 'online' ? 'verified' : o.paymentStatus}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="admin-empty"><p>No orders yet</p></div>}
        </div>

        {/* Revenue & Orders Trend AreaChart */}
        <div className="section-card">
          <div className="card-header">
            <div>
              <h3 className="card-title"><BarChart2 size={16} /> Revenue &amp; Orders</h3>
              <p className="card-desc">Sales momentum</p>
            </div>
            <div className="range-tabs compact">
              <button className={activeRange === 'monthly' ? 'active' : ''} onClick={() => setRange('monthly')}>6M</button>
              <button className={activeRange === 'daily'   ? 'active' : ''} onClick={() => setRange('daily')}>30D</button>
            </div>
          </div>
          <div className="chart-scroll-container">
            <div style={{ width: getChartWidth(trendData, 30, 280), height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey={trendKey} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis yAxisId="rev" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<ChartTip currency />} />
                  <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={2} fill="url(#gRev)" />
                  <Area yAxisId="ord" type="monotone" dataKey="orders"  name="Orders"  stroke="#10b981" strokeWidth={2} fill="url(#gOrd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Order Status donut */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><ShoppingBag size={16} /> Order Status</h3>
          </div>
          {orderStatusData.length > 0 ? (
            <>
              <div className="donut-chart-container">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={4} dataKey="value">
                      {orderStatusData.map((d, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [fmt(v), n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-text">
                  <span className="dct-val">{totalOrderStatus}</span>
                  <span className="dct-lbl">Orders</span>
                </div>
              </div>
              <div className="donut-legend compact">
                {orderStatusData.slice(0, 3).map((d, i) => (
                  <div key={i} className="dl-item">
                    <span className="dl-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{d.name}</span>
                    <span className="dl-val">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="admin-empty"><p>No orders yet</p></div>}
        </div>
      </div>

      {/* ── Row 2 ── */}
      <div className="charts-row three-col">
        {/* Recent Registrations compact table */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><Users size={16} /> Recent Registrations</h3>
          </div>
          {recentUsers.length > 0 ? (
            <div className="dash-table-wrap compact">
              <table className="admin-table compact">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.slice(0, 5).map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="cell-name">{u.name}</div>
                        <div className="cell-sub">{u.email}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${u.role === 'admin' ? 'status-confirmed' : 'status-shipped'}`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="date-cell">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="admin-empty"><p>No users yet</p></div>}
        </div>

        {/* User Growth wave chart */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><Users size={16} /> User Growth</h3>
            <p className="card-desc">Last 6 Months</p>
          </div>
          <div className="chart-scroll-container">
            <div style={{ width: getChartWidth(userMonthlyData, 45, 280), height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userMonthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="users" name="New Users" stroke="#2563eb" strokeWidth={2} fill="url(#gUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Payment Status donut */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><CreditCard size={16} /> Payment Status</h3>
          </div>
          {paymentData.length > 0 ? (
            <>
              <div className="donut-chart-container">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={4} dataKey="value">
                      {paymentData.map((d, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [fmt(v), n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-text">
                  <span className="dct-val">{totalPaymentStatus}</span>
                  <span className="dct-lbl">Payments</span>
                </div>
              </div>
              <div className="donut-legend compact">
                {paymentData.slice(0, 3).map((d, i) => (
                  <div key={i} className="dl-item">
                    <span className="dl-dot" style={{ background: COLORS[(i + 2) % COLORS.length] }} />
                    <span>{d.name}</span>
                    <span className="dl-val">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="admin-empty"><p>No payment data yet</p></div>}
        </div>
      </div>

      {/* ── Row 3 ── */}
      <div className="charts-row three-col">
        {/* Low Stock Alerts compact list */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><AlertTriangle size={16} /> Low Stock Alerts</h3>
          </div>
          {lowStockProducts.length > 0 ? (
            <div className="stock-list compact">
              {lowStockProducts.slice(0, 5).map((p, i) => {
                const pctVal = Math.min(((p.stock || 0) / 15) * 100, 100);
                const clr    = (p.stock || 0) <= 5 ? '#ef4444' : (p.stock || 0) <= 10 ? '#f59e0b' : '#10b981';
                return (
                  <div key={i} className="stock-item compact">
                    <div className="stock-info">
                      <p className="stock-name">{p.name}</p>
                      <p className="stock-cat">{p.category}</p>
                    </div>
                    <div className="stock-right">
                      <span className="stock-qty" style={{ color: clr }}>{p.stock} left</span>
                      <div className="stock-bar-bg">
                        <div className="stock-bar-fill" style={{ width: `${pctVal}%`, background: clr }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="admin-empty"><p>All products well-stocked</p></div>}
        </div>

        {/* Category Revenue Bar Chart */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><TrendingUp size={16} /> Category Revenue</h3>
          </div>
          {categoryRevenue.length > 0 ? (
            <div className="chart-scroll-container">
              <div style={{ width: getChartWidth(categoryRevenue, 55, 280), height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryRevenue} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => [fmtCur(v), 'Revenue']} />
                    <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                      {categoryRevenue.map((d, i) => (
                        <Cell key={i} fill={getCategoryColor(d.name)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : <div className="admin-empty"><p>No sales data yet</p></div>}
        </div>

        {/* Payment Method Split donut */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><Activity size={16} /> Payment Method</h3>
          </div>
          {methodData.length > 0 ? (
            <>
              <div className="donut-chart-container">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={methodData} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={4} dataKey="value">
                      {methodData.map((d, i) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [fmt(v), n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-text">
                  <span className="dct-val">{totalPaymentMethod}</span>
                  <span className="dct-lbl">Split</span>
                </div>
              </div>
              <div className="donut-legend compact">
                <div className="dl-item">
                  <span className="dl-dot" style={{ background: COLORS[4] }} />
                  <span>COD</span>
                  <span className="dl-val">{pms.codOrders || 0} ({totalPaymentMethod > 0 ? ((pms.codOrders || 0)/totalPaymentMethod*100).toFixed(0) : 0}%)</span>
                </div>
                <div className="dl-item">
                  <span className="dl-dot" style={{ background: COLORS[5] }} />
                  <span>Online</span>
                  <span className="dl-val">{pms.onlineOrders || 0} ({totalPaymentMethod > 0 ? ((pms.onlineOrders || 0)/totalPaymentMethod*100).toFixed(0) : 0}%)</span>
                </div>
              </div>
            </>
          ) : <div className="admin-empty"><p>No orders yet</p></div>}
        </div>
      </div>

      {/* ── Row 4 ── */}
      <div className="charts-row three-col">
        {/* Top Selling Products */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><Award size={16} /> Top Selling Products</h3>
          </div>
          {topProducts.length > 0 ? (
            <div className="rank-list compact">
              {topProducts.slice(0, 5).map((p, i) => (
                <div key={i} className="rank-item compact">
                  <span className="rank-num" style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</span>
                  <div className="rank-info">
                    <p className="rank-name">{p.name}</p>
                    <p className="rank-meta">{p.quantity} sold</p>
                  </div>
                  <span className="rank-val">{fmtCur(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : <div className="admin-empty"><p>No sales data yet</p></div>}
        </div>

        {/* Top Customers */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><Users size={16} /> Top Customers</h3>
          </div>
          {topCustomers.length > 0 ? (
            <div className="rank-list compact">
              {topCustomers.slice(0, 5).map((c, i) => (
                <div key={i} className="rank-item compact">
                  <div className="rank-avatar" style={{ background: COLORS[(i + 3) % COLORS.length] }}>
                    {(c.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="rank-info">
                    <p className="rank-name">{c.name}</p>
                    <p className="rank-meta">{c.orderCount} orders</p>
                  </div>
                  <span className="rank-val">{fmtCur(c.totalSpend)}</span>
                </div>
              ))}
            </div>
          ) : <div className="admin-empty"><p>No sales data yet</p></div>}
        </div>

        {/* Products by Category BarChart */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title"><Package size={16} /> Products by Category</h3>
          </div>
          {categoryData.length > 0 ? (
            <div className="chart-scroll-container">
              <div style={{ width: getChartWidth(categoryData, 55, 280), height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip formatter={(v) => [v, 'Products']} />
                    <Bar dataKey="value" name="Products" radius={[4, 4, 0, 0]}>
                      {categoryData.map((d, i) => (
                        <Cell key={i} fill={getCategoryColor(d.name)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : <div className="admin-empty"><p>No products yet</p></div>}
        </div>
      </div>

    </div>
  );
}
