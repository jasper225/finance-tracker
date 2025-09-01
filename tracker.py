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
    print("Data saved successfully.")

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

def add_category(categories, category, expense_list=None):
    categories[category] = expense_list or []

def delete_category(categories, category):
    if category in categories:
        del categories[category]

def set_budget(budgets, month, limit):
    budgets[month.lower()] = limit

def get_budget(budgets, month):
    return budgets.get(month.lower(), None)

def clear_expenses(expenses):
    expenses.clear()
    save_data(expenses)

def clear_categories(categories):
    categories.clear()
    save_data(categories)

def clear_budgets(budgets):
    budgets.clear()
    save_data(budgets)

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
        print("Expenses imported from expenses.csv")
    except FileNotFoundError:
        pass
    try:
        with open("categories.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                categories[row["Category"]] = row["Expenses"].split(";") if row["Expenses"] else []
        print("Categories imported from categories.csv")
    except FileNotFoundError:
        pass
    try:
        with open("budgets.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                budgets[row["Month"].lower()] = float(row["Limit"])
        print("Budgets imported from budgets.csv")
    except FileNotFoundError:
        pass

def export_to_csv(expenses, categories, budgets):
    with open("expenses.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Month", "Expense", "Amount"])
        for month, month_expenses in expenses.items():
            for expense, amount in month_expenses.items():
                writer.writerow([month, expense, amount])
    with open("categories.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Categories", "Expenses"])
        for category, exp_list in categories.items():
            writer.writerow([category, ",".join(exp_list)])
    with open("budgets.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Month", "Limit"])
        for month, limit in budgets.items():
            writer.writerow([month, limit])



