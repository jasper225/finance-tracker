import json
import os
import csv

DATA_FILE = "data.json"

def save_data(expenses, categories, budgets, filename=DATA_FILE):
    data = {
        "expenses": expenses,
        "categories": categories,
        "budgets": budgets
    }
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)

def load_data(filename=DATA_FILE):
    if not os.path.exists(filename):
        return {}, {}, {}
    with open(filename, "r") as f:
        data = json.load(f)
    return data.get("expenses", {}), data.get("categories", {}), data.get("budgets", {})

def add_expense(expenses, month, expense, amount):
    month = month.lower()
    if month not in expenses:
        expenses[month] = {}
    expenses[month][expense] = amount

def update_expense(expenses, month, name, new_amount):
    month = month.lower()
    expenses[month][name] = new_amount

def delete_expense(expenses, month, expense):
    month = month.lower()
    if month in expenses and expense in expenses[month]:
        del expenses[month][expense]

def list_expenses(expenses, month=None):
    if month:
        return expenses.get(month.lower(), {})
    return expenses

def monthly_summary(expenses, month):
    month_expenses = expenses.get(month.lower(), {})
    return sum(month_expenses.values())

def add_category(categories, category):
    categories[category] = []

def delete_category(categories, category):
    if category in categories:
        del categories[category]

def add_expense_to_category(categories, category, name):
    if category not in categories:
        categories[category] = []
    
    if name not in categories[category]:
        categories[category].append(name)

def filter_by_category(categories, category):
    if category not in categories:
        return set()
    
    category_items = set(categories[category])

    return category_items

def category_expenses(expenses, categories, category):
    if category not in categories:
        return {}
    
    category_expenses = {}
    expense_names = set(categories[category])

    for month, month_expenses in expenses.items():
        for expense_name, amount in month_expenses.items():
            if expense_name in expense_names:
                if month not in category_expenses:
                    category_expenses[month] = {}
                category_expenses[month][expense_name] = amount
    
    return category_expenses
   
def set_budget(budgets, month, limit):
    budgets[month.lower()] = limit

def adjust_budget(budgets, month, new_budget):
    budgets[month.lower()] = new_budget

def get_budget(budgets, month):
    return budgets.get(month.lower(), None)

def check_budget(expenses, budgets, month):
    total_spent = monthly_summary(expenses, month)
    budget = budgets.get(month.lower(), 0)
    remaining = budget - total_spent

    return {
        "total_spent": total_spent,
        "budget": budget,
        "remaining": remaining
    }

def clear_expenses(expenses, categories, budgets):
    expenses.clear()
    save_data(expenses, categories, budgets)

def clear_categories(expenses, categories, budgets):
    categories.clear()
    save_data(expenses, categories, budgets)

def clear_budgets(expenses, categories, budgets):
    budgets.clear()
    save_data(expenses, categories, budgets)

def clear_all_data(expenses, categories, budgets):
    expenses.clear()
    categories.clear()
    budgets.clear()
    save_data(expenses, categories, budgets)

def import_from_csv(expenses, categories, budgets):
    try:
        with open("expenses.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                month = row["Month"].lower()
                if month not in expenses:
                    expenses[month] = {}
                expenses[month][row["Expense"]] = float(row["Amount"])
    except FileNotFoundError:
        print("expenses.csv not found, skipping...")
    except Exception as e:
        print(f"Error: importing expenses {e}")
    try:
        with open("categories.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                categories[row["Category"]] = row["Expenses"].split(",") if row["Expenses"] else []
    except FileNotFoundError:
        print("categories.csv not found, skipping...")
    except Exception as e:
        print(f"Error: importing categories {e}")
    try:
        with open("budgets.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                budgets[row["Month"].lower()] = float(row["Limit"])
    except FileNotFoundError:
        print("budgets.csv not found, skipping...")
    except Exception as e:
        print(f"Error: importing budgets {e}")

def export_to_csv(expenses, categories, budgets):
    try: 
        with open("expenses.csv", "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Month", "Expense", "Amount"])
            for month, month_expenses in expenses.items():
                for expense, amount in month_expenses.items():
                    writer.writerow([month, expense, amount])
        with open("categories.csv", "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Category", "Expenses"])
            for category, exp_list in categories.items():
                writer.writerow([category, ",".join(exp_list)])
        with open("budgets.csv", "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Month", "Limit"])
            for month, limit in budgets.items():
                writer.writerow([month, limit])
        print("Data exported successfully!")
        return True
    except Exception as e:
        print(f"Error exporting data: {e}")
        return False

