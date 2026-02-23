import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import FinanceDashboard from '../../components/finance/FinanceDashboard';
import FeeManager from '../../components/finance/FeeManager';
import ExpenditureManager from '../../components/finance/ExpenditureManager';
import PayrollManager from '../../components/finance/PayrollManager';
import BudgetPlanner from '../../components/finance/BudgetPlanner';
import GeneralLedger from '../../components/finance/GeneralLedger';
import SupplierManager from '../../components/finance/SupplierManager';
import FinancialReports from '../../components/finance/FinancialReports';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupIcon from '@mui/icons-material/Group';
import PieChartIcon from '@mui/icons-material/PieChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

type FinanceTab = 'Dashboard' | 'Fees' | 'Expenditure' | 'Suppliers' | 'Payroll' | 'Budget' | 'Ledger' | 'Reports';

export default function FinancePage() {
    const { user } = useAuth();
    const {
        tryApi, staff, addStaff, updateStaff, deleteStaff,
        expenses, suppliers, accounts, journalEntries,
        refreshData
    } = useSchool();
    const [activeTab, setActiveTab] = useState<FinanceTab>('Dashboard');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async (force = false) => {
        if (!force && stats) return;
        setLoading(true);
        try {
            const statsRes = await tryApi('/api/finance/stats');
            if (statsRes) {
                setStats(await statsRes.json());
            }
        } catch (error) {
            console.error('Error fetching finance stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExpenseAction = async (id: string, action: string) => {
        const apiRes = await tryApi('/api/finance/expenses', {
            method: 'PUT',
            body: JSON.stringify({ id, action })
        });
        if (apiRes) refreshData();
    };

    const handleExpenseRequest = async (formData: any) => {
        const apiRes = await tryApi('/api/finance/expenses', {
            method: 'POST',
            body: JSON.stringify({ ...formData, requestedById: user?.id, requestedByName: user?.name })
        });
        if (apiRes) refreshData();
    };

    const handlePayrollGenerate = async (month: number, year: number) => {
        const apiRes = await tryApi('/api/finance/payroll', {
            method: 'POST',
            body: JSON.stringify({ month, year })
        });
        if (apiRes) refreshData();
    };

    const handlePayrollStatus = async (id: string, status: string) => {
        const apiRes = await tryApi('/api/finance/payroll', {
            method: 'PUT',
            body: JSON.stringify({ id, status })
        });
        if (apiRes) refreshData();
    };

    const tabs = [
        { id: 'Dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
        { id: 'Fees', icon: <PaymentIcon />, label: 'Fee Management' },
        { id: 'Expenditure', icon: <AccountBalanceIcon />, label: 'Expenditure' },
        { id: 'Suppliers', icon: <GroupIcon />, label: 'Suppliers' },
        { id: 'Payroll', icon: <GroupIcon />, label: 'Payroll' },
        { id: 'Budget', icon: <PieChartIcon />, label: 'Budgets' },
        { id: 'Ledger', icon: <ReceiptLongIcon />, label: 'General Ledger' },
        { id: 'Reports', icon: <AssessmentIcon />, label: 'Financial Reports' },
    ] as const;

    const handleBudgetUpdate = async (formData: any) => {
        const apiRes = await tryApi('/api/finance/budgets', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        if (apiRes) refreshData();
    };

    if (loading && !stats) return <div className="loading-screen">Loading Finance System...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AccountBalanceIcon color="primary" /> Financial Management
                    </h1>
                    <p className="page-subtitle">Enterprise Finance & Accounting Module</p>
                </div>
            </div>

            <div className="tab-nav" style={{ overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 8 }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
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
                {activeTab === 'Suppliers' && <SupplierManager />}
                {activeTab === 'Payroll' && (
                    <PayrollManager
                        staff={staff}
                        payrollEntries={stats?.payrollEntries || []}
                        onGenerate={handlePayrollGenerate}
                        onUpdateStatus={handlePayrollStatus}
                        onAddStaff={addStaff}
                        onUpdateStaff={updateStaff}
                        onDeleteStaff={deleteStaff}
                        user={user}
                    />
                )}
                {activeTab === 'Budget' && <BudgetPlanner budgets={stats?.budgets || []} onUpdate={handleBudgetUpdate} />}
                {activeTab === 'Ledger' && <GeneralLedger />}
                {activeTab === 'Reports' && <FinancialReports />}
            </div>
        </div>
    );
}
