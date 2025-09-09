        // Additional helper functions for form handling and UI interactions
        
        // Form submission handlers with analytics sync
        async function handleExpenseSubmit(event) {
            try {
                const form = event.target;
                const formData = new FormData(form);
                
                // Validate form data
                const name = formData.get('name').trim();
                const amount = parseFloat(formData.get('amount'));
                
                if (!name || amount <= 0) {
                    showToast('Please enter valid expense details', 'error');
                    event.preventDefault();
                    return false;
                }
                
                // Allow form to submit normally, then handle post-submission
                setTimeout(async () => {
                    if (window.app) {
                        await window.app.syncAnalytics();
                        window.app.updateUI();
                    }
                }, 1000);
                
                return true;
            } catch (error) {
                console.error('Error handling expense submit:', error);
                return true; // Allow normal form submission
            }
        }

        async function handleCategorySubmit(event) {
            try {
                const form = event.target;
                const formData = new FormData(form);
                const category = formData.get('category').trim();
                
                if (!category) {
                    showToast('Please enter a category name', 'error');
                    event.preventDefault();
                    return false;
                }
                
                setTimeout(async () => {
                    if (window.app) {
                        await window.app.syncAnalytics();
                        window.app.updateUI();
                    }
                }, 1000);
                
                return true;
            } catch (error) {
                console.error('Error handling category submit:', error);
                return true;
            }
        }

        async function handleBudgetSubmit(event) {
            try {
                const form = event.target;
                const formData = new FormData(form);
                const amount = parseFloat(formData.get('amount'));
                
                if (amount <= 0) {
                    showToast('Please enter a valid budget amount', 'error');
                    event.preventDefault();
                    return false;
                }
                
                setTimeout(async () => {
                    if (window.app) {
                        await window.app.syncAnalytics();
                        window.app.updateUI();
                    }
                }, 1000);
                
                return true;
            } catch (error) {
                console.error('Error handling budget submit:', error);
                return true;
            }
        }

        // Advanced search functionality
        async function performAdvancedSearch() {
            try {
                const searchParams = {
                    query: document.getElementById('searchQuery').value.trim(),
                    category: document.getElementById('searchCategory').value,
                    month: document.getElementById('searchMonth').value,
                    minAmount: document.getElementById('minAmount').value,
                    maxAmount: document.getElementById('maxAmount').value
                };

                showSearchLoading(true);
                
                let results = [];
                if (window.app && typeof window.app.searchExpenses === 'function') {
                    results = await window.app.searchExpenses(
                        searchParams.query,
                        searchParams.category,
                        searchParams.month,
                        searchParams.minAmount,
                        searchParams.maxAmount
                    );
                }

                displaySearchResults(results);
                
            } catch (error) {
                console.error('Search error:', error);
                showToast('Search failed. Please try again.', 'error');
            } finally {
                showSearchLoading(false);
            }
        }

        function displaySearchResults(results) {
            const resultsContainer = document.getElementById('searchResults');
            const resultsList = document.getElementById('searchResultsList');
            
            if (results.length === 0) {
                resultsList.innerHTML = '<p>No expenses found matching your criteria.</p>';
            } else {
                resultsList.innerHTML = results.map(result => `
                    <div class="search-result-item">
                        <div class="result-details">
                            <strong>${escapeHtml(result.expense_name || result.name)}</strong>
                            <span class="result-amount">$${parseFloat(result.amount).toFixed(2)}</span>
                        </div>
                        <div class="result-meta">
                            <span class="result-month">${(result.month || '').charAt(0).toUpperCase() + (result.month || '').slice(1)}</span>
                            <span class="result-category">${escapeHtml(result.category || 'Uncategorized')}</span>
                        </div>
                    </div>
                `).join('');
            }
            
            resultsContainer.style.display = 'block';
        }

        function showSearchLoading(show) {
            const button = document.querySelector('button[onclick="performAdvancedSearch()"]');
            if (button) {
                button.textContent = show ? 'Searching...' : 'Search Expenses';
                button.disabled = show;
            }
        }

        // Manual analytics sync
        async function syncAnalyticsManually() {
            try {
                showToast('Syncing analytics...', 'info');
                
                if (window.app && typeof window.app.syncAnalytics === 'function') {
                    await window.app.syncAnalytics();
                    showToast('Analytics synced successfully!', 'success');
                } else {
                    // Fallback to direct API call
                    const response = await fetch('/sync_analytics');
                    if (response.ok) {
                        showToast('Analytics synced successfully!', 'success');
                    } else {
                        throw new Error('Sync failed');
                    }
                }
            } catch (error) {
                console.error('Analytics sync error:', error);
                showToast('Failed to sync analytics', 'error');
            }
        }

        // Clear analytics cache
        function clearAnalyticsCache() {
            if (confirm('Clear analytics cache? This will force a fresh data reload.')) {
                if (window.analyticsCache) {
                    window.analyticsCache = {
                        trends: null,
                        breakdown: null,
                        insights: null,
                        lastUpdated: null
                    };
                }
                showToast('Analytics cache cleared', 'success');
            }
        }

        // Utility functions
        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            if (!toast) return;
            
            toast.textContent = message;
            toast.className = `toast ${type}`;
            toast.style.display = 'block';
            
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }

        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Populate search category dropdown when page loads
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(populateSearchCategories, 1000);
        });

        async function populateSearchCategories() {
            try {
                const response = await fetch('/list_categories');
                const categories = await response.json();
                const select = document.getElementById('searchCategory');
                
                // Clear existing options (except "All Categories")
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                
                // Add category options
                for (const categoryName of Object.keys(categories || {})) {
                    const option = document.createElement('option');
                    option.value = categoryName;
                    option.textContent = categoryName;
                    select.appendChild(option);
                }
            } catch (error) {
                console.error('Error loading categories for search:', error);
            }
        }