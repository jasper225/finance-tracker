// Enhanced ExpenseApp class with analytics integration
class ExpenseApp {
    constructor() {
        this.state = {
            expenses: {},
            categories: {},
            budgets: {},
            currentMonth: 'january',
            loading: false,
            analyticsReady: false
        };
        
        this.analyticsEndpoints = {
            sync: '/sync_analytics',
            trends: '/analytics/monthly_trends',
            breakdown: '/analytics/category_breakdown',
            insights: '/analytics/insights',
            categoryTrends: '/analytics/category_trends',
            search: '/analytics/search_expenses',
            summary: '/analytics/get_analytics_summary'
        };
    }
    
    // Initialize the application
    async init() {
        await this.loadAllData();
        await this.syncAnalytics();
        this.setupEventListeners();
        this.updateUI();
    }
    
    // Load all data from backend
    async loadAllData() {
        if (this.state.loading) return;
        
        this.state.loading = true;
        this.showGlobalLoading(true);
        
        try {
            // Use your existing endpoints to load data
            const [expensesRes, categoriesRes, budgetsRes] = await Promise.all([
                this.fetchMonthExpenses('january'), // Start with January
                fetch('/list_categories'),
                fetch('/list_budgets')
            ]);
            
            // Load all months for complete analytics
            const allMonths = ['january', 'february', 'march', 'april', 'may', 'june',
                             'july', 'august', 'september', 'october', 'november', 'december'];
            
            const monthlyData = await Promise.all(
                allMonths.map(async (month) => {
                    try {
                        const response = await fetch(`/list_expense/${month}`);
                        const data = await response.json();
                        return { [month]: data };
                    } catch (error) {
                        console.warn(`Failed to load ${month} expenses:`, error);
                        return { [month]: {} };
                    }
                })
            );
            
            // Merge monthly data
            this.state.expenses = monthlyData.reduce((acc, monthData) => {
                return { ...acc, ...monthData };
            }, {});
            
            this.state.categories = await categoriesRes.json();
            this.state.budgets = await budgetsRes.json();
            
            console.log('All data loaded:', {
                expenses: Object.keys(this.state.expenses).length + ' months',
                categories: Object.keys(this.state.categories).length + ' categories',
                budgets: Object.keys(this.state.budgets).length + ' budgets'
            });
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load application data');
        } finally {
            this.state.loading = false;
            this.showGlobalLoading(false);
        }
    }
    
    // Sync data with analytics backend
    async syncAnalytics() {
        try {
            console.log('Syncing data to analytics...');
            const response = await fetch(this.analyticsEndpoints.sync);
            
            if (!response.ok) {
                throw new Error(`Analytics sync failed: ${response.status}`);
            }
            
            this.state.analyticsReady = true;
            console.log('Analytics sync completed');
            
            // Update analytics if tab is active
            if (this.isAnalyticsTabActive()) {
                await this.loadAnalyticsData();
            }
            
        } catch (error) {
            console.error('Analytics sync error:', error);
            this.state.analyticsReady = false;
        }
    }
    
    // Load analytics data from backend
    async loadAnalyticsData() {
        if (!this.state.analyticsReady) {
            await this.syncAnalytics();
        }
        
        try {
            const [trends, breakdown, insights] = await Promise.all([
                fetch(this.analyticsEndpoints.trends).then(r => r.json()),
                fetch(this.analyticsEndpoints.breakdown).then(r => r.json()),
                fetch(this.analyticsEndpoints.insights).then(r => r.json())
            ]);
            
            // Update global variables for analytics.js compatibility
            window.expenses = this.state.expenses;
            window.categories = this.state.categories;
            window.budgets = this.state.budgets;
            
            // Initialize charts with backend data
            this.initializeAnalyticsCharts({ trends, breakdown, insights });
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
            this.showAnalyticsError();
        }
    }
    
    // Initialize charts with data from analytics backend
    initializeAnalyticsCharts(analyticsData) {
        try {
            // Call your existing analytics functions
            if (typeof initializeCharts === 'function') {
                initializeCharts();
            }
            
            // Update insights with backend data
            this.updateInsightsFromBackend(analyticsData.insights);
            
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }
    
    // Update insights display with backend data
    updateInsightsFromBackend(insights) {
        try {
            document.getElementById('totalSpending').textContent = 
                '$' + parseFloat(insights.total_spending || 0).toFixed(2);
            document.getElementById('avgMonthlySpending').textContent = 
                '$' + parseFloat(insights.avg_monthly_spending || 0).toFixed(2);
            
            const highestMonth = insights.highest_spending_month;
            document.getElementById('highestMonth').textContent = 
                `${highestMonth.month} ($${parseFloat(highestMonth.amount || 0).toFixed(2)})`;
            
            const topCategory = insights.top_spending_category;
            document.getElementById('topCategory').textContent = 
                `${topCategory.category} ($${parseFloat(topCategory.amount || 0).toFixed(2)})`;
                
        } catch (error) {
            console.error('Error updating insights:', error);
        }
    }
    
    // Enhanced expense operations with analytics sync
    async addExpense(month, name, amount) {
        try {
            const formData = new FormData();
            formData.append('month', month);
            formData.append('name', name);
            formData.append('amount', amount);
            
            const response = await fetch('/add_expense', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                // Reload data and sync analytics
                await this.loadMonthData(month);
                await this.syncAnalytics();
                this.updateUI();
            }
            
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    }
    
    async updateExpense(month, name, newAmount) {
        try {
            const formData = new FormData();
            formData.append('amount', newAmount);
            
            const response = await fetch(`/update_expense/${month}/${encodeURIComponent(name)}`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                await this.loadMonthData(month);
                await this.syncAnalytics();
                this.updateUI();
            }
            
        } catch (error) {
            console.error('Error updating expense:', error);
        }
    }
    
    async deleteExpense(month, name) {
        try {
            const response = await fetch(`/delete_expense/${month}/${encodeURIComponent(name)}`);
            
            if (response.ok) {
                await this.loadMonthData(month);
                await this.syncAnalytics();
                this.updateUI();
            }
            
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    }
    
    // Load specific month data
    async loadMonthData(month) {
        try {
            const response = await fetch(`/list_expense/${month}`);
            const monthData = await response.json();
            this.state.expenses[month] = monthData;
        } catch (error) {
            console.error(`Error loading ${month} data:`, error);
        }
    }
    
    // Analytics search functionality
    async searchExpenses(query, category, month, minAmount, maxAmount) {
        if (!this.state.analyticsReady) {
            await this.syncAnalytics();
        }
        
        try {
            const params = new URLSearchParams();
            if (query) params.append('query', query);
            if (category) params.append('category', category);
            if (month) params.append('month', month);
            if (minAmount) params.append('min_amount', minAmount);
            if (maxAmount) params.append('max_amount', maxAmount);
            
            const response = await fetch(`${this.analyticsEndpoints.search}?${params}`);
            return await response.json();
            
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }
    
    // UI Management
    async switchTab(tabName, element) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab content
        document.getElementById(tabName + '-tab').classList.add('active');
        element.classList.add('active');
        
        // Load tab-specific data
        switch (tabName) {
            case 'categories':
                await this.loadCategories();
                break;
            case 'budgets':
                await this.loadBudgetStatus();
                break;
            case 'analytics':
                await this.loadAnalyticsData();
                break;
            default:
                this.updateExpensesList();
        }
    }
    
    selectMonth(month, element) {
        this.state.currentMonth = month;
        
        // Update active month button
        document.querySelectorAll('.month-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        element.classList.add('active');
        
        // Update current month display
        document.getElementById('currentMonth').textContent = 
            month.charAt(0).toUpperCase() + month.slice(1);
        
        // Update UI for selected month
        this.updateExpensesList();
        this.updateMonthlySummary();
    }
    
    // UI Helper Methods
    updateUI() {
        this.updateExpensesList();
        this.updateMonthlySummary();
        
        if (this.isAnalyticsTabActive()) {
            this.loadAnalyticsData();
        }
    }
    
    updateExpensesList() {
        const currentExpenses = this.state.expenses[this.state.currentMonth] || {};
        const expensesList = document.getElementById('expensesList');
        
        if (Object.keys(currentExpenses).length === 0) {
            expensesList.innerHTML = '<div class="loading">No expenses for this month.</div>';
            return;
        }
        
        expensesList.innerHTML = '';
        
        for (const [name, amount] of Object.entries(currentExpenses)) {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            
            // Create elements safely to prevent XSS
            const expenseDetails = document.createElement('div');
            expenseDetails.className = 'expense-details';
            
            const expenseName = document.createElement('div');
            expenseName.className = 'expense-name';
            expenseName.textContent = name;
            
            const expenseAmount = document.createElement('div');
            expenseAmount.className = 'expense-amount';
            expenseAmount.textContent = '$' + parseFloat(amount).toFixed(2);
            
            const expenseActions = document.createElement('div');
            expenseActions.className = 'expense-actions';
            expenseActions.innerHTML = `
                <button onclick="app.editExpense('${name}', ${amount})" class="btn btn-secondary btn-small">Edit</button>
                <button onclick="app.deleteExpenseWithConfirm('${name}')" class="btn btn-danger btn-small">Delete</button>
            `;
            
            expenseDetails.appendChild(expenseName);
            expenseDetails.appendChild(expenseAmount);
            expenseItem.appendChild(expenseDetails);
            expenseItem.appendChild(expenseActions);
            
            expensesList.appendChild(expenseItem);
        }
    }
    
    async updateMonthlySummary() {
        try {
            const response = await fetch(`/monthly_summary/${this.state.currentMonth}`);
            const summary = await response.json();
            
            document.getElementById('monthlyTotal').textContent = 
                '$' + parseFloat(summary.total || 0).toFixed(2);
            
            await this.loadBudgetForMonth(this.state.currentMonth);
        } catch (error) {
            console.error('Error loading monthly summary:', error);
        }
    }
    
    async loadBudgetForMonth(month) {
        try {
            const response = await fetch(`/get_budget/${month}`);
            const budgetData = await response.json();
            
            document.getElementById('monthlyBudget').textContent = 
                '$' + parseFloat(budgetData.budget || 0).toFixed(2);
            
            const totalSpent = parseFloat(document.getElementById('monthlyTotal').textContent.replace('$', ''));
            const budget = parseFloat(budgetData.budget || 0);
            const remaining = budget - totalSpent;
            
            document.getElementById('monthlyRemaining').textContent = '$' + remaining.toFixed(2);
            document.getElementById('monthlyRemaining').style.color = remaining < 0 ? '#e53e3e' : '#38a169';
        } catch (error) {
            console.error('Error loading budget:', error);
        }
    }
    
    // Utility Methods
    isAnalyticsTabActive() {
        return document.getElementById('analytics-tab').classList.contains('active');
    }
    
    showGlobalLoading(show) {
        // Implement global loading indicator
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }
    
    showError(message) {
        console.error(message);
        // Implement user-friendly error display
    }
    
    showAnalyticsError() {
        const analyticsContainer = document.getElementById('analytics-tab');
        if (analyticsContainer) {
            analyticsContainer.innerHTML = '<div class="error">Unable to load analytics data. Please try refreshing.</div>';
        }
    }
    
    // User interaction methods
    editExpense(name, currentAmount) {
        const newAmount = prompt(`Edit amount for "${name}":`, currentAmount);
        if (newAmount !== null && !isNaN(newAmount) && parseFloat(newAmount) > 0) {
            this.updateExpense(this.state.currentMonth, name, newAmount);
        }
    }
    
    deleteExpenseWithConfirm(name) {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            this.deleteExpense(this.state.currentMonth, name);
        }
    }
    
    setupEventListeners() {
        // Add any global event listeners here
        window.addEventListener('beforeunload', () => {
            // Cleanup if needed
        });
    }
}

// Initialize the application
const app = new ExpenseApp();

document.addEventListener('DOMContentLoaded', function() {
    app.init();
});

// Global functions for HTML onclick handlers (backward compatibility)
function switchTab(tabName, element) {
    app.switchTab(tabName, element);
}

function selectMonth(month, element) {
    app.selectMonth(month, element);
}

// Export/Import functions
async function importData() {
    try {
        const response = await fetch('/import_from_csv');
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please try again.');
    }
}


async function exportData() {
    try {
        const response = await fetch('/export_to_csv');
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data. Please try again.');
    }
}

function clearData(type) {
    let message = '';
    let endpoint = '';
    
    switch(type) {
        case 'expenses':
            message = 'Are you sure you want to clear all expenses?';
            endpoint = '/clear_expenses';
            break;
        case 'categories':
            message = 'Are you sure you want to clear all categories?';
            endpoint = '/clear_categories';
            break;
        case 'budgets':
            message = 'Are you sure you want to clear all budgets?';
            endpoint = '/clear_budgets';
            break;
        case 'all':
            message = 'Are you sure you want to clear ALL data? This cannot be undone!';
            endpoint = '/clear_all_data';
            break;
    }
    
    if (confirm(message)) {
        window.location.href = endpoint;
    }
}