import sqlite3
from datetime import datetime
import json

def setup_analytics_db():
    """Create analytics database and tables"""
    conn = sqlite3.connect('analytics.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS expense_analytics (
            id INTEGER PRIMARY KEY,
            month TEXT,
            expense_name TEXT,
            amount REAL,
            category TEXT,
            date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    return conn

def sync_data_to_analytics(expenses, categories):
    """Copy JSON data to SQL for analytics"""
    conn = setup_analytics_db()
    
    # Clear existing data to avoid duplicates
    conn.execute('DELETE FROM expense_analytics')
    
    # Find which category each expense belongs to
    expense_to_category = {}
    for category_name, expense_list in categories.items():
        for expense_name in expense_list:
            expense_to_category[expense_name] = category_name
    
    # Insert expenses into analytics DB
    for month, month_expenses in expenses.items():
        for expense_name, amount in month_expenses.items():
            category = expense_to_category.get(expense_name, 'Uncategorized')
            
            conn.execute('''
                INSERT INTO expense_analytics (month, expense_name, amount, category)
                VALUES (?, ?, ?, ?)
            ''', (month, expense_name, float(amount), category))
    
    conn.commit()
    conn.close()
    print(f"Synced {sum(len(month_expenses) for month_expenses in expenses.values())} expenses to analytics DB")

def get_monthly_trends():
    """Get monthly spending trends from analytics DB"""
    conn = sqlite3.connect('analytics.db')
    cursor = conn.execute('''
        SELECT month, SUM(amount) as total
        FROM expense_analytics
        GROUP BY month
        ORDER BY 
            CASE month
                WHEN 'january' THEN 1
                WHEN 'february' THEN 2
                WHEN 'march' THEN 3
                WHEN 'april' THEN 4
                WHEN 'may' THEN 5
                WHEN 'june' THEN 6
                WHEN 'july' THEN 7
                WHEN 'august' THEN 8
                WHEN 'september' THEN 9
                WHEN 'october' THEN 10
                WHEN 'november' THEN 11
                WHEN 'december' THEN 12
            END
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
    return [{"month": row[0], "total": row[1]} for row in results]

def get_category_breakdown():
    """Get spending breakdown by category"""
    conn = sqlite3.connect('analytics.db')
    cursor = conn.execute('''
        SELECT category, SUM(amount) as total
        FROM expense_analytics
        GROUP BY category
        ORDER BY total DESC
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
    return [{"category": row[0], "total": row[1]} for row in results]

def get_spending_insights():
    """Get key spending insights"""
    conn = sqlite3.connect('analytics.db')
    
    # Total spending
    cursor = conn.execute('SELECT SUM(amount) FROM expense_analytics')
    total_spending = cursor.fetchone()[0] or 0
    
    # Average monthly spending
    cursor = conn.execute('SELECT COUNT(DISTINCT month) FROM expense_analytics')
    month_count = cursor.fetchone()[0] or 1
    avg_monthly = total_spending / month_count
    
    # Highest spending month
    cursor = conn.execute('''
        SELECT month, SUM(amount) as total
        FROM expense_analytics
        GROUP BY month
        ORDER BY total DESC
        LIMIT 1
    ''')
    highest_month_row = cursor.fetchone()
    highest_month = {
        "month": highest_month_row[0] if highest_month_row else "None",
        "amount": highest_month_row[1] if highest_month_row else 0
    }
    
    # Top spending category
    cursor = conn.execute('''
        SELECT category, SUM(amount) as total
        FROM expense_analytics
        GROUP BY category
        ORDER BY total DESC
        LIMIT 1
    ''')
    top_category_row = cursor.fetchone()
    top_category = {
        "category": top_category_row[0] if top_category_row else "None",
        "amount": top_category_row[1] if top_category_row else 0
    }
    
    conn.close()
    
    return {
        "total_spending": total_spending,
        "avg_monthly_spending": avg_monthly,
        "highest_spending_month": highest_month,
        "top_spending_category": top_category
    }

def get_expense_trends_by_category(category=None):
    """Get expense trends for a specific category or all categories"""
    conn = sqlite3.connect('analytics.db')
    
    if category:
        cursor = conn.execute('''
            SELECT month, SUM(amount) as total
            FROM expense_analytics
            WHERE category = ?
            GROUP BY month
            ORDER BY 
                CASE month
                    WHEN 'january' THEN 1
                    WHEN 'february' THEN 2
                    WHEN 'march' THEN 3
                    WHEN 'april' THEN 4
                    WHEN 'may' THEN 5
                    WHEN 'june' THEN 6
                    WHEN 'july' THEN 7
                    WHEN 'august' THEN 8
                    WHEN 'september' THEN 9
                    WHEN 'october' THEN 10
                    WHEN 'november' THEN 11
                    WHEN 'december' THEN 12
                END
        ''', (category,))
    else:
        cursor = conn.execute('''
            SELECT category, month, SUM(amount) as total
            FROM expense_analytics
            GROUP BY category, month
            ORDER BY category, 
                CASE month
                    WHEN 'january' THEN 1
                    WHEN 'february' THEN 2
                    WHEN 'march' THEN 3
                    WHEN 'april' THEN 4
                    WHEN 'may' THEN 5
                    WHEN 'june' THEN 6
                    WHEN 'july' THEN 7
                    WHEN 'august' THEN 8
                    WHEN 'september' THEN 9
                    WHEN 'october' THEN 10
                    WHEN 'november' THEN 11
                    WHEN 'december' THEN 12
                END
        ''')
    
    results = cursor.fetchall()
    conn.close()
    
    if category:
        return [{"month": row[0], "total": row[1]} for row in results]
    else:
        return [{"category": row[0], "month": row[1], "total": row[2]} for row in results]

def search_expenses(query=None, category=None, month=None, min_amount=None, max_amount=None):
    """Advanced expense search with filters"""
    conn = sqlite3.connect('analytics.db')
    
    sql = 'SELECT * FROM expense_analytics WHERE 1=1'
    params = []
    
    if query:
        sql += ' AND expense_name LIKE ?'
        params.append(f'%{query}%')
    
    if category:
        sql += ' AND category = ?'
        params.append(category)
    
    if month:
        sql += ' AND month = ?'
        params.append(month)
    
    if min_amount is not None:
        sql += ' AND amount >= ?'
        params.append(min_amount)
    
    if max_amount is not None:
        sql += ' AND amount <= ?'
        params.append(max_amount)
    
    sql += ' ORDER BY date_added DESC'
    
    cursor = conn.execute(sql, params)
    results = cursor.fetchall()
    conn.close()
    
    return [{
        "id": row[0],
        "month": row[1],
        "expense_name": row[2],
        "amount": row[3],
        "category": row[4],
        "date_added": row[5]
    } for row in results]

def get_analytics_summary():
    """Get a comprehensive analytics summary"""
    return {
        "monthly_trends": get_monthly_trends(),
        "category_breakdown": get_category_breakdown(),
        "insights": get_spending_insights()
    }