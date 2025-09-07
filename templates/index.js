        let currentMonth = 'january';
        let expenses = {};
        let categories = {};
        let budgets = {};

        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            loadInitialData();
            updateMonthlySummary();
            loadExpenses();

            if (Object.keys(expenses).length > 0) {
                console.log("Analytics ready to analyze.");
            }
        });

        // Load initial data (you'll need to pass this from your Flask template)
        function loadInitialData() {
            // This would typically be populated by your Flask template
            // For now, we'll load it via AJAX
            loadExpenses();
            loadCategories();
        }

        // Tab switching
        function switchTab(tabName) {
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
            
            // Add active class to selected tab
            event.target.classList.add('active');
            
            // Load data for the selected tab
            if (tabName === 'categories') {
                loadCategories();
            } else if (tabName === 'budgets') {
                loadBudgetStatus();
            } else if (tabName === 'analytics') {
                setTimeout(() => {
                initializeCharts(),
                updateInsightsDisplay()
                }, 100);
            } 
        }

        // Month selection
        function selectMonth(month) {
            currentMonth = month;
            
            // Update active month button
            document.querySelectorAll('.month-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Update current month display
            document.getElementById('currentMonth').textContent = 
                month.charAt(0).toUpperCase() + month.slice(1);
            
            // Reload data for selected month
            loadExpenses();
            updateMonthlySummary();
        }

        // Load expenses for current month
        async function loadExpenses() {
            try {
                const response = await fetch(`/list_expense/${currentMonth}`);
                const monthExpenses = await response.json();
                
                const expensesList = document.getElementById('expensesList');
                
                if (Object.keys(monthExpenses).length === 0) {
                    expensesList.innerHTML = '<div class="loading">No expenses for this month.</div>';
                    return;
                }
                
                expensesList.innerHTML = '';
                
                for (const [name, amount] of Object.entries(monthExpenses)) {
                    const expenseItem = document.createElement('div');
                    expenseItem.className = 'expense-item';
                    expenseItem.innerHTML = `
                        <div class="expense-details">
                            <div class="expense-name">${name}</div>
                            <div class="expense-amount">$${parseFloat(amount).toFixed(2)}</div>
                        </div>
                        <div class="expense-actions">
                            <button onclick="editExpense('${name}', ${amount})" class="btn btn-secondary btn-small">Edit</button>
                            <button onclick="deleteExpense('${name}')" class="btn btn-danger btn-small">Delete</button>
                        </div>
                    `;
                    expensesList.appendChild(expenseItem);
                }
            } catch (error) {
                console.error('Error loading expenses:', error);
                document.getElementById('expensesList').innerHTML = 
                    '<div class="error">Error loading expenses. Please try again.</div>';
            }
        }

        // Load categories
        async function loadCategories() {
            try {
                const response = await fetch(`/list_categories`);
                const categoryData = await response.json();
            
                const categoriesList = document.getElementById('categoriesList');

                if (Object.keys(categoryData).length === 0) {
                    categoriesList.innerHTML = '<div class="loading">No categories created yet.</div>';
                    return;
                }
                

                categoriesList.innerHTML = '';

                for (const [categoryName, expenseList] of Object.entries(categoryData)) {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category-item';
                    categoryItem.innerHTML = `
                        <div class="category-details">
                            <div class="category-name">${categoryName}</div>
                            <div class="expense-list">$${expenseList.length} expenses</div>
                        </div>
                        <div class="expense-actions">
                            <button onclick="viewCategory('${categoryName}')" class="btn btn-secondary btn-small">View</button>
                            <button onclick="deleteCategory('${categoryName}')" class="btn btn-danger btn-small">Delete</button>
                        </div>
                    `;
                    expenseList.appendChild(categoryItem);
                }
            }
            catch (error) {
                console.error('Error loading categories:', error);
                document.getElementById('categoriesList').innerHTML =
                '<div class="error">Error loading categories. Please try again.</div>';
            }
            
        }

        // Update monthly summary
        async function updateMonthlySummary() {
            try {
                const response = await fetch(`/monthly_summary/${currentMonth}`);
                const summary = await response.json();
                
                document.getElementById('monthlyTotal').textContent = 
                    '$' + parseFloat(summary.total || 0).toFixed(2);
                
                // Load budget info
                loadBudgetForMonth(currentMonth);
            } catch (error) {
                console.error('Error loading monthly summary:', error);
                document.getElementById('monthlyTotal').textContent = '$0.00';
            }
        }

        // Load budget for specific month
        async function loadBudgetForMonth(month) {
            try {
                const response = await fetch(`/get_budget/${month}`);
                const budgetData = await response.json();
                
                document.getElementById('monthlyBudget').textContent = 
                    '$' + parseFloat(budgetData.budget || 0).toFixed(2);
                
                // Calculate remaining
                const totalSpent = parseFloat(document.getElementById('monthlyTotal').textContent.replace('$', ''));
                const budget = parseFloat(budgetData.budget || 0);
                const remaining = budget - totalSpent;
                
                document.getElementById('monthlyRemaining').textContent = 
                    '$' + remaining.toFixed(2);
                document.getElementById('monthlyRemaining').style.color = 
                    remaining < 0 ? '#e53e3e' : '#38a169';
            } catch (error) {
                console.error('Error loading budget:', error);
                document.getElementById('monthlyBudget').textContent = '$0.00';
                document.getElementById('monthlyRemaining').textContent = '$0.00';
            }
        }

        // Load budget status
        async function loadBudgetStatus() {
            try {
                const response = await fetch(`/check_budget/${currentMonth}`);
                const status = await response.json();
                
                const budgetStatus = document.getElementById('budgetStatus');
                budgetStatus.innerHTML = `
                    <div class="budget-status">
                        <div class="budget-item">
                            <div class="budget-label">Total Spent</div>
                            <div class="budget-value">$${parseFloat(status.total_spent || 0).toFixed(2)}</div>
                        </div>
                        <div class="budget-item">
                            <div class="budget-label">Budget</div>
                            <div class="budget-value">$${parseFloat(status.budget || 0).toFixed(2)}</div>
                        </div>
                        <div class="budget-item">
                            <div class="budget-label">Remaining</div>
                            <div class="budget-value" style="color: ${status.remaining < 0 ? '#e53e3e' : '#38a169'}">
                                $${parseFloat(status.remaining || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Error loading budget status:', error);
                document.getElementById('budgetStatus').innerHTML = 
                    '<div class="error">Error loading budget status.</div>';
            }
        }

        // Edit expense
        function editExpense(name, currentAmount) {
            const newAmount = prompt(`Edit amount for "${name}":`, currentAmount);
            if (newAmount !== null && !isNaN(newAmount) && newAmount > 0) {
                // Create a form and submit it
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = `/update_expense/${currentMonth}/${encodeURIComponent(name)}`;
                
                const amountInput = document.createElement('input');
                amountInput.type = 'hidden';
                amountInput.name = 'amount';
                amountInput.value = newAmount;
                
                form.appendChild(amountInput);
                document.body.appendChild(form);
                form.submit();
            }
        }

        // Delete expense
        function deleteExpense(name) {
            if (confirm(`Are you sure you want to delete "${name}"?`)) {
                window.location.href = `/delete_expense/${currentMonth}/${encodeURIComponent(name)}`;
            }
        }

        
        // Import data
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

        // Export data
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

        // Clear data
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