import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import FinanceDashboard from '../../components/finance/FinanceDashboard';
import FeeManager from '../../components/finance/FeeManager';
import ExpenditureManager from '../../components/finance/ExpenditureManager';
import PayrollManager from '../../components/finance/PayrollManager';
import BudgetPlanner from '../../components/finance/BudgetPlanner';
import GeneralLedger from '../../components/finance/GeneralLedger';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupIcon from '@mui/icons-material/Group';
import PieChartIcon from '@mui/icons-material/PieChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

type FinanceTab = 'Dashboard' | 'Fees' | 'Expenditure' | 'Payroll' | 'Budget' | 'Ledger';

export default function FinancePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<FinanceTab>('Dashboard');
    const [stats, setStats] = useState<any>(null);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [payrollEntries, setPayrollEntries] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, accountsRes, expensesRes, payrollRes, staffRes] = await Promise.all([
                fetch('/api/finance/stats'),
                fetch('/api/finance/accounts'),
                fetch('/api/finance/expenses'),
                fetch('/api/finance/payroll?type=entries'),
                fetch('/api/finance/payroll?type=staff')
            ]);

            const [statsData, accountsData, expensesData, payrollData, staffData] = await Promise.all([
                statsRes.json(),
                accountsRes.json(),
                expensesRes.json(),
                payrollRes.json(),
                staffRes.json()
            ]);

            setStats(statsData);
            setAccounts(accountsData);
            setExpenses(expensesData);
            setPayrollEntries(payrollData);
            setStaff(staffData);
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleExpenseAction = async (id: string, action: string) => {
        try {
            await fetch('/api/finance/expenses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action, userId: user?.id, userName: user?.name })
            });
            fetchData();
        } catch (error) {
            console.error('Action failed:', error);
        }
    };

    const handleExpenseRequest = async (formData: any) => {
        try {
            await fetch('/api/finance/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, requestedById: user?.id, requestedByName: user?.name })
            });
            fetchData();
        } catch (error) {
            console.error('Request failed:', error);
        }
    };

    const handlePayrollGenerate = async (month: number, year: number) => {
        try {
            await fetch('/api/finance/payroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, year })
            });
            fetchData();
        } catch (error) {
            console.error('Payroll generation failed:', error);
        }
    };

    const handlePayrollStatus = async (id: string, status: string) => {
        try {
            await fetch('/api/finance/payroll', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            fetchData();
        } catch (error) {
            console.error('Payroll update failed:', error);
        }
    };

    const tabs = [
        { id: 'Dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
        { id: 'Fees', icon: <PaymentIcon />, label: 'Fee Management' },
        { id: 'Expenditure', icon: <AccountBalanceIcon />, label: 'Expenditure' },
        { id: 'Payroll', icon: <GroupIcon />, label: 'Payroll' },
        { id: 'Budget', icon: <PieChartIcon />, label: 'Budgets' },
        { id: 'Ledger', icon: <ReceiptLongIcon />, label: 'General Ledger' },
    ] as const;

    if (loading && !stats) return <div className="loading-screen">Loading Finance System...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AccountBalanceIcon style={{ color: 'var(--accent-blue)' }} /> Financial Management
                    </h1>
                    <p>Ledger-Core School Financial System</p>
                </div>
            </div>

            <div className="finance-tabs-nav" style={{
                display: 'flex',
                gap: 8,
                borderBottom: '1px solid var(--border-color)',
                marginBottom: 24,
                paddingBottom: 4,
                overflowX: 'auto'
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 20px',
                            border: 'none',
                            background: 'transparent',
                            color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                            fontWeight: activeTab === tab.id ? 600 : 500,
                            borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-blue)' : 'transparent'}`,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        {React.cloneElement(tab.icon as React.ReactElement, { style: { fontSize: 20 } })}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="finance-content">
                {activeTab === 'Dashboard' && <FinanceDashboard stats={stats} />}
                {activeTab === 'Fees' && <FeeManager />}
                {activeTab === 'Expenditure' && (
                    <ExpenditureManager
                        expenses={expenses}
                        onAction={handleExpenseAction}
                        onRequest={handleExpenseRequest}
                        user={user}
                    />
                )}
                {activeTab === 'Payroll' && (
                    <PayrollManager
                        staff={staff}
                        payrollEntries={payrollEntries}
                        onGenerate={handlePayrollGenerate}
                        onUpdateStatus={handlePayrollStatus}
                        user={user}
                    />
                )}
                {activeTab === 'Budget' && <BudgetPlanner budgets={stats?.budgets || []} onUpdate={() => fetchData()} />}
                {activeTab === 'Ledger' && <GeneralLedger accounts={accounts} journalEntries={stats?.journalEntries || []} />}
            </div>
        </div>
    );
}
