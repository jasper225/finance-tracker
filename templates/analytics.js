// analytics.js - Add this to your static folder

// Global chart instances to manage updates
let monthlyTrendChart = null;
let categoryPieChart = null;
let budgetComparisonChart = null;

// Initialize all charts
function initializeCharts() {
    createMonthlyTrendChart();
    createCategoryBreakdownChart();
    createBudgetComparisonChart();
}

// Monthly Spending Trends Chart
function createMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    
    const monthlyTotals = calculateMonthlyTotals();
    const monthOrder = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    const orderedData = monthOrder.map(month => ({
        month: month.charAt(0).toUpperCase() + month.slice(1),
        total: monthlyTotals[month] || 0
    }));
    
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
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                point: {
                    hoverBackgroundColor: 'rgb(118, 75, 162)'
                }
            }
        }
    });
}

// Category Breakdown Pie Chart
function createCategoryBreakdownChart() {
    const ctx = document.getElementById('categoryPieChart').getContext('2d');
    
    const categoryTotals = calculateCategoryTotals();
    const colors = generateColors(Object.keys(categoryTotals).length);
    
    if (categoryPieChart) {
        categoryPieChart.destroy();
    }
    
    categoryPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
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
            cutout: '60%',
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

// Budget vs Actual Spending Chart
function createBudgetComparisonChart() {
    const ctx = document.getElementById('budgetComparisonChart').getContext('2d');
    
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
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Calculate monthly totals from expenses data
function calculateMonthlyTotals() {
    const monthlyTotals = {};
    
    for (const [month, monthExpenses] of Object.entries(expenses)) {
        monthlyTotals[month] = Object.values(monthExpenses)
            .reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
    }
    
    return monthlyTotals;
}

// Calculate category totals
function calculateCategoryTotals() {
    const categoryTotals = {};
    
    // Initialize categories
    for (const categoryName of Object.keys(categories)) {
        categoryTotals[categoryName] = 0;
    }
    
    // Add "Uncategorized" for expenses not in any category
    categoryTotals['Uncategorized'] = 0;
    
    // Get all categorized expense names
    const categorizedExpenses = new Set();
    for (const [categoryName, expenseNames] of Object.entries(categories)) {
        for (const expenseName of expenseNames) {
            categorizedExpenses.add(expenseName);
        }
    }
    
    // Calculate totals
    for (const [month, monthExpenses] of Object.entries(expenses)) {
        for (const [expenseName, amount] of Object.entries(monthExpenses)) {
            let foundCategory = false;
            
            // Check which category this expense belongs to
            for (const [categoryName, expenseNames] of Object.entries(categories)) {
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

// Calculate budget comparison data
function calculateBudgetComparison() {
    const monthOrder = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    const monthlyTotals = calculateMonthlyTotals();
    
    const months = [];
    const budgetAmounts = [];
    const actualAmounts = [];
    
    monthOrder.forEach(month => {
        // Only include months that have either expenses or budgets
        if (monthlyTotals[month] > 0 || budgets[month] > 0) {
            months.push(month.charAt(0).toUpperCase() + month.slice(1));
            budgetAmounts.push(parseFloat(budgets[month] || 0));
            actualAmounts.push(monthlyTotals[month] || 0);
        }
    });
    
    return {
        months,
        budgets: budgetAmounts,
        actual: actualAmounts
    };
}

// Generate colors for pie chart
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
    
    // If we need more colors, generate random ones
    while (colors.length < count) {
        const r = Math.floor(Math.random() * 200) + 55;
        const g = Math.floor(Math.random() * 200) + 55;
        const b = Math.floor(Math.random() * 200) + 55;
        colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
    }
    
    return colors.slice(0, count);
}

// Get key analytics insights
function generateInsights() {
    const monthlyTotals = calculateMonthlyTotals();
    const categoryTotals = calculateCategoryTotals();
    
    // Calculate insights
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
}

// Update insights display
function updateInsightsDisplay() {
    const insights = generateInsights();
    
    document.getElementById('totalSpending').textContent = '$' + insights.totalSpending;
    document.getElementById('avgMonthlySpending').textContent = '$' + insights.avgMonthlySpending;
    document.getElementById('highestMonth').textContent = insights.highestSpendingMonth.month + ' ($' + insights.highestSpendingMonth.amount + ')';
    document.getElementById('topCategory').textContent = insights.topSpendingCategory.category + ' ($' + insights.topSpendingCategory.amount + ')';
}

// Refresh all charts (call this when data changes)
function refreshAnalytics() {
    initializeCharts();
    updateInsightsDisplay();
}

// Export analytics data
function exportAnalyticsData() {
    const monthlyTotals = calculateMonthlyTotals();
    const categoryTotals = calculateCategoryTotals();
    const insights = generateInsights();
    
    const analyticsData = {
        monthlyTotals,
        categoryTotals,
        insights,
        exportDate: new Date().toISOString()
    };
    
    // Create downloadable file
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `expense-analytics-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}