

// Global chart instances
let monthlyTrendChart = null;
let categoryPieChart = null;
let budgetComparisonChart = null;

// Analytics data cache
let analyticsCache = {
    trends: null,
    breakdown: null,
    insights: null,
    lastUpdated: null
};

// Initialize all charts with backend data
async function initializeCharts() {
    try {
        // Fetch fresh data from backend analytics
        await refreshAnalyticsData();
        
        // Create charts with backend data
        await createMonthlyTrendChart();
        await createCategoryBreakdownChart();
        await createBudgetComparisonChart();
        
    } catch (error) {
        console.error('Error initializing charts:', error);
        showAnalyticsError('Failed to load analytics data');
    }
}

// Refresh analytics data from backend
async function refreshAnalyticsData() {
    try {
        const [trends, breakdown, insights] = await Promise.all([
            fetch('/analytics/monthly_trends').then(r => r.json()),
            fetch('/analytics/category_breakdown').then(r => r.json()),
            fetch('/analytics/insights').then(r => r.json())
        ]);
        
        analyticsCache = {
            trends,
            breakdown,
            insights,
            lastUpdated: new Date()
        };
        
        console.log('Analytics data refreshed from backend');
        return analyticsCache;
        
    } catch (error) {
        console.error('Error refreshing analytics data:', error);
        throw error;
    }
}

// Enhanced Monthly Trends Chart with backend data
async function createMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart');
    if (!ctx) return;
    
    try {
        let monthlyData;
        
        // Use backend data if available, fallback to frontend calculation
        if (analyticsCache.trends && analyticsCache.trends.length > 0) {
            monthlyData = analyticsCache.trends;
        } else {
            // Fallback to frontend calculation
            monthlyData = calculateMonthlyTotalsFromFrontend();
        }
        
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        // Ensure all months are represented
        const orderedData = monthOrder.map(month => {
            const found = monthlyData.find(item => 
                item.month.toLowerCase() === month.toLowerCase()
            );
            return {
                month: month,
                total: found ? found.total : 0
            };
        });
        
        if (monthlyTrendChart) {
            monthlyTrendChart.destroy();
        }
        
        monthlyTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: orderedData.map(item => item.month),
                datasets: [{
                    label: 'Monthly Spending',
                    data: orderedData.map(item => item.total),
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgb(102, 126, 234)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Spending Trends',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Spending: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error creating monthly trend chart:', error);
    }
}

// Enhanced Category Breakdown Chart with backend data
async function createCategoryBreakdownChart() {
    const ctx = document.getElementById('categoryPieChart');
    if (!ctx) return;
    
    try {
        let categoryData;
        
        // Use backend data if available
        if (analyticsCache.breakdown && analyticsCache.breakdown.length > 0) {
            categoryData = analyticsCache.breakdown.reduce((acc, item) => {
                acc[item.category] = item.total;
                return acc;
            }, {});
        } else {
            // Fallback to frontend calculation
            categoryData = calculateCategoryTotalsFromFrontend();
        }
        
        const categories = Object.keys(categoryData);
        const totals = Object.values(categoryData);
        const colors = generateColors(categories.length);
        
        if (categoryPieChart) {
            categoryPieChart.destroy();
        }
        
        categoryPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: totals,
                    backgroundColor: colors,
                    borderColor: '#fff',
                    borderWidth: 3,
                    hoverBorderWidth: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Spending by Category',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
    } catch (error) {
        console.error('Error creating category breakdown chart:', error);
    }
}

// Enhanced Budget Comparison Chart
async function createBudgetComparisonChart() {
    const ctx = document.getElementById('budgetComparisonChart');
    if (!ctx) return;
    
    try {
        const comparisonData = calculateBudgetComparison();
        
        if (budgetComparisonChart) {
            budgetComparisonChart.destroy();
        }
        
        budgetComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: comparisonData.months,
                datasets: [
                    {
                        label: 'Budget',
                        data: comparisonData.budgets,
                        backgroundColor: 'rgba(56, 161, 105, 0.7)',
                        borderColor: 'rgb(56, 161, 105)',
                        borderWidth: 2
                    },
                    {
                        label: 'Actual Spending',
                        data: comparisonData.actual,
                        backgroundColor: 'rgba(229, 62, 62, 0.7)',
                        borderColor: 'rgb(229, 62, 62)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Budget vs Actual Spending',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error creating budget comparison chart:', error);
    }
}

// Fallback calculation methods (for when backend data isn't available)
function calculateMonthlyTotalsFromFrontend() {
    if (!window.expenses) return [];
    
    const monthOrder = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    return monthOrder.map(month => {
        const monthExpenses = window.expenses[month] || {};
        const total = Object.values(monthExpenses)
            .reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
        
        return {
            month: month.charAt(0).toUpperCase() + month.slice(1),
            total: total
        };
    });
}

function calculateCategoryTotalsFromFrontend() {
    if (!window.expenses || !window.categories) return {};
    
    const categoryTotals = {};
    
    // Initialize categories
    for (const categoryName of Object.keys(window.categories)) {
        categoryTotals[categoryName] = 0;
    }
    categoryTotals['Uncategorized'] = 0;
    
    // Calculate totals
    for (const [month, monthExpenses] of Object.entries(window.expenses)) {
        for (const [expenseName, amount] of Object.entries(monthExpenses)) {
            let foundCategory = false;
            
            // Check which category this expense belongs to
            for (const [categoryName, expenseNames] of Object.entries(window.categories)) {
                if (expenseNames.includes(expenseName)) {
                    categoryTotals[categoryName] += parseFloat(amount || 0);
                    foundCategory = true;
                    break;
                }
            }
            
            // If not found in any category, add to uncategorized
            if (!foundCategory) {
                categoryTotals['Uncategorized'] += parseFloat(amount || 0);
            }
        }
    }
    
    // Remove categories with zero spending
    Object.keys(categoryTotals).forEach(category => {
        if (categoryTotals[category] === 0) {
            delete categoryTotals[category];
        }
    });
    
    return categoryTotals;
}

function calculateBudgetComparison() {
    const monthOrder = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    const months = [];
    const budgetAmounts = [];
    const actualAmounts = [];
    
    // Use backend data if available, otherwise frontend calculation
    let monthlyTotals;
    if (analyticsCache.trends && analyticsCache.trends.length > 0) {
        monthlyTotals = analyticsCache.trends.reduce((acc, item) => {
            acc[item.month.toLowerCase()] = item.total;
            return acc;
        }, {});
    } else {
        monthlyTotals = calculateMonthlyTotals();
    }
    
    monthOrder.forEach(month => {
        const spent = monthlyTotals[month] || 0;
        const budget = parseFloat((window.budgets && window.budgets[month]) || 0);
        
        // Only include months that have either expenses or budgets
        if (spent > 0 || budget > 0) {
            months.push(month.charAt(0).toUpperCase() + month.slice(1));
            budgetAmounts.push(budget);
            actualAmounts.push(spent);
        }
    });
    
    return {
        months,
        budgets: budgetAmounts,
        actual: actualAmounts
    };
}

// Legacy function for backward compatibility
function calculateMonthlyTotals() {
    const monthlyTotals = {};
    
    if (!window.expenses) return monthlyTotals;
    
    for (const [month, monthExpenses] of Object.entries(window.expenses)) {
        monthlyTotals[month] = Object.values(monthExpenses)
            .reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
    }
    
    return monthlyTotals;
}

// Generate insights with backend data priority
async function generateInsights() {
    try {
        // Try to get insights from backend first
        if (analyticsCache.insights) {
            return {
                totalSpending: parseFloat(analyticsCache.insights.total_spending || 0).toFixed(2),
                avgMonthlySpending: parseFloat(analyticsCache.insights.avg_monthly_spending || 0).toFixed(2),
                highestSpendingMonth: {
                    month: analyticsCache.insights.highest_spending_month.month || 'None',
                    amount: parseFloat(analyticsCache.insights.highest_spending_month.amount || 0).toFixed(2)
                },
                topSpendingCategory: {
                    category: analyticsCache.insights.top_spending_category.category || 'None',
                    amount: parseFloat(analyticsCache.insights.top_spending_category.amount || 0).toFixed(2)
                }
            };
        }
        
        // Fallback to frontend calculation
        const monthlyTotals = calculateMonthlyTotals();
        const categoryTotals = calculateCategoryTotalsFromFrontend();
        
        const totalSpending = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);
        const avgMonthlySpending = totalSpending / Math.max(Object.keys(monthlyTotals).length, 1);
        
        const highestMonth = Object.entries(monthlyTotals)
            .reduce((max, [month, total]) => total > max.total ? {month, total} : max, 
                    {month: '', total: 0});
        
        const topCategory = Object.entries(categoryTotals)
            .reduce((max, [category, total]) => total > max.total ? {category, total} : max, 
                    {category: '', total: 0});
        
        return {
            totalSpending: totalSpending.toFixed(2),
            avgMonthlySpending: avgMonthlySpending.toFixed(2),
            highestSpendingMonth: {
                month: highestMonth.month.charAt(0).toUpperCase() + highestMonth.month.slice(1),
                amount: highestMonth.total.toFixed(2)
            },
            topSpendingCategory: {
                category: topCategory.category,
                amount: topCategory.total.toFixed(2)
            }
        };
        
    } catch (error) {
        console.error('Error generating insights:', error);
        return getDefaultInsights();
    }
}

// Default insights when data is unavailable
function getDefaultInsights() {
    return {
        totalSpending: '0.00',
        avgMonthlySpending: '0.00',
        highestSpendingMonth: { month: 'None', amount: '0.00' },
        topSpendingCategory: { category: 'None', amount: '0.00' }
    };
}

// Update insights display
async function updateInsightsDisplay() {
    try {
        const insights = await generateInsights();
        
        const elements = {
            totalSpending: document.getElementById('totalSpending'),
            avgMonthlySpending: document.getElementById('avgMonthlySpending'),
            highestMonth: document.getElementById('highestMonth'),
            topCategory: document.getElementById('topCategory')
        };
        
        if (elements.totalSpending) {
            elements.totalSpending.textContent = ' + insights.totalSpending; '
        }
        
        if (elements.avgMonthlySpending) {
            elements.avgMonthlySpending.textContent = ' + insights.avgMonthlySpending; '
        }
        
        if (elements.highestMonth) {
            elements.highestMonth.textContent = 
                `${insights.highestSpendingMonth.month} (${insights.highestSpendingMonth.amount})`;
        }
        
        if (elements.topCategory) {
            elements.topCategory.textContent = 
                `${insights.topSpendingCategory.category} (${insights.topSpendingCategory.amount})`;
        }
        
    } catch (error) {
        console.error('Error updating insights display:', error);
    }
}

// Enhanced refresh function with backend sync
async function refreshAnalytics() {
    try {
        showAnalyticsLoading(true);
        
        // Sync data with backend first
        if (window.app && typeof window.app.syncAnalytics === 'function') {
            await window.app.syncAnalytics();
        }
        
        // Refresh analytics data from backend
        await refreshAnalyticsData();
        
        // Re-initialize all charts and insights
        await initializeCharts();
        await updateInsightsDisplay();
        
    } catch (error) {
        console.error('Error refreshing analytics:', error);
        showAnalyticsError('Failed to refresh analytics data');
    } finally {
        showAnalyticsLoading(false);
    }
}

// Advanced search functionality
async function searchExpenses(searchParams = {}) {
    try {
        if (window.app && typeof window.app.searchExpenses === 'function') {
            return await window.app.searchExpenses(
                searchParams.query,
                searchParams.category,
                searchParams.month,
                searchParams.minAmount,
                searchParams.maxAmount
            );
        } else {
            // Fallback to basic frontend search
            return performBasicSearch(searchParams);
        }
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Basic search fallback for when backend isn't available
function performBasicSearch(searchParams) {
    const results = [];
    const { query, category, month, minAmount, maxAmount } = searchParams;
    
    if (!window.expenses) return results;
    
    for (const [expenseMonth, monthExpenses] of Object.entries(window.expenses)) {
        // Filter by month if specified
        if (month && expenseMonth.toLowerCase() !== month.toLowerCase()) {
            continue;
        }
        
        for (const [expenseName, amount] of Object.entries(monthExpenses)) {
            const expenseAmount = parseFloat(amount);
            
            // Filter by query (expense name)
            if (query && !expenseName.toLowerCase().includes(query.toLowerCase())) {
                continue;
            }
            
            // Filter by amount range
            if (minAmount && expenseAmount < parseFloat(minAmount)) {
                continue;
            }
            if (maxAmount && expenseAmount > parseFloat(maxAmount)) {
                continue;
            }
            
            // Filter by category
            if (category) {
                const expenseCategory = findExpenseCategory(expenseName);
                if (expenseCategory !== category) {
                    continue;
                }
            }
            
            results.push({
                month: expenseMonth,
                expense_name: expenseName,
                amount: expenseAmount,
                category: findExpenseCategory(expenseName) || 'Uncategorized'
            });
        }
    }
    
    return results;
}

// Helper function to find which category an expense belongs to
function findExpenseCategory(expenseName) {
    if (!window.categories) return null;
    
    for (const [categoryName, expenseNames] of Object.entries(window.categories)) {
        if (expenseNames.includes(expenseName)) {
            return categoryName;
        }
    }
    return null;
}

// Enhanced export functionality
async function exportAnalyticsData() {
    try {
        // Try to get comprehensive data from backend
        let exportData;
        
        if (analyticsCache.trends && analyticsCache.breakdown && analyticsCache.insights) {
            exportData = {
                monthlyTrends: analyticsCache.trends,
                categoryBreakdown: analyticsCache.breakdown,
                insights: analyticsCache.insights,
                exportSource: 'backend',
                exportDate: new Date().toISOString()
            };
        } else {
            // Fallback to frontend calculation
            const monthlyTotals = calculateMonthlyTotals();
            const categoryTotals = calculateCategoryTotalsFromFrontend();
            const insights = await generateInsights();
            
            exportData = {
                monthlyTotals,
                categoryTotals,
                insights,
                exportSource: 'frontend',
                exportDate: new Date().toISOString()
            };
        }
        
        // Create downloadable file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `expense-analytics-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        console.log('Analytics data exported successfully');
        
    } catch (error) {
        console.error('Error exporting analytics data:', error);
        alert('Failed to export analytics data. Please try again.');
    }
}

// Utility functions
function generateColors(count) {
    const colors = [
        'rgba(102, 126, 234, 0.8)',   // Blue
        'rgba(229, 62, 62, 0.8)',     // Red
        'rgba(56, 161, 105, 0.8)',    // Green
        'rgba(237, 137, 54, 0.8)',    // Orange
        'rgba(128, 90, 213, 0.8)',    // Purple
        'rgba(45, 55, 72, 0.8)',      // Dark Gray
        'rgba(236, 72, 153, 0.8)',    // Pink
        'rgba(14, 165, 233, 0.8)',    // Sky Blue
        'rgba(34, 197, 94, 0.8)',     // Emerald
        'rgba(251, 191, 36, 0.8)'     // Yellow
    ];
    
    while (colors.length < count) {
        const r = Math.floor(Math.random() * 200) + 55;
        const g = Math.floor(Math.random() * 200) + 55;
        const b = Math.floor(Math.random() * 200) + 55;
        colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
    }
    
    return colors.slice(0, count);
}

function showAnalyticsLoading(show) {
    const loader = document.getElementById('analyticsLoader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
    
    // Disable charts during loading
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.style.opacity = show ? '0.5' : '1';
        container.style.pointerEvents = show ? 'none' : 'auto';
    });
}

function showAnalyticsError(message) {
    console.error('Analytics error:', message);
    
    const errorContainer = document.getElementById('analyticsError');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }
}

// Initialize analytics on window load as fallback
window.addEventListener('load', function() {
    // Only initialize if not already initialized by the main app
    if (!window.app && typeof initializeCharts === 'function') {
        setTimeout(initializeCharts, 500);
    }
});