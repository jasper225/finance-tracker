import csv
import json
import os

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

def main():
    expenses, categories, budgets = load_data()
    try:
        while True:
            print("🏦--Expense Tracker--🏦")
            print("1. Manage Expenses")
            print("2. Manage Categories")
            print("3. Manage Budgets")
            print("4. Clear Data")
            print("5. Import/Export Data")
            print("0. Exit")
            try:
                option = int(input("Select a feature to manage:"))
            except ValueError:
                print("Please enter a valid number.")
                continue
            if option == 1:
                while True:
                    print("1. Add Expense")
                    print("2. Update Expense")
                    print("3. Delete Expense")
                    print("4. View Expenses")
                    print("5. View Summary Of Expenses")
                    print("6. View Summary Of Expenses For Specific Month")
                    print("0. Exit")
                    try:
                        expense_option = int(input("Select an option:"))
                    except ValueError:
                        print("Please enter a valid number.")
                        continue
                    if expense_option == 1:
                        add_expense(expenses)
        
                    elif expense_option == 2:
                        update_expense(expenses)
        
                    elif expense_option == 3:
                        delete_expense(expenses)
        
                    elif expense_option == 4:
                        view_expenses(expenses)
        
                    elif expense_option == 5:
                        view_expense_summary(expenses)
        
                    elif expense_option == 6:
                        view_expense_summary_for_month(expenses)
                    elif expense_option == 0:
                        break
                    else:
                        print("Error: Invalid Option")
            elif option == 2:
                while True:
                    print("1. Create Category")
                    print("2. Add To Category")
                    print("3. Filter By Category")
                    print("0. Exit")
                    try:
                        category_option = int(input("Select an option:"))
                    except ValueError:
                        print("Please enter a valid number.")
                        continue
                    if category_option == 1:
                        create_category(categories)
        
                    elif category_option == 2:
                        add_to_category(categories, expenses)
        
                    elif category_option == 3:
                        filter_by_category(expenses, categories)
        
                    elif category_option == 0:
                        break
            elif option == 3:
                while True:
                    try:
                        budget_option = int(input("Select an option:"))
                    except ValueError:
                        print("Please enter a valid number.")
                        continue
                    print("1. Set Budget")
                    print("2. Adjust Budget")
                    print("3. Check Budget")
                    print("0. Exit")    
                    if budget_option == 1:
                        set_budget(expenses, budgets)
                    elif budget_option == 2:
                        adjust_budget(budgets)
                    elif budget_option == 3:
                        check_budget(expenses, budgets)
                    elif budget_option == 0:
                        break
            elif option == 4:
                while True:
                    try:
                        clear_option = int(input("Select an option:"))
                    except ValueError:
                        print("Please enter a valid number.")
                        continue
                    print("1. Clear Expenses")
                    print("2. Clear Categories")
                    print("3. Clear Budgets")
                    print("4. Clear All Data")
                    if clear_option == 1:
                        clear_expenses(expenses)
                    elif clear_option == 2:
                        clear_categories(categories)
                    elif clear_option == 3:
                        clear_budgets(budgets)
                    elif clear_option == 4:
                        clear_all_data(expenses, categories, budgets)
            
            elif option == 5:
                while True:
                    try:
                        data_option = int(input("Select an option: "))
                    except ValueError:
                        print("Please enter a valid number.")
                        continue
                    print("1. Import Data")
                    print("2. Export Data")
                    print("0. Exit")
                    if data_option == 1:
                        import_from_csv(expenses, categories, budgets)
                    elif data_option == 2:
                        export_to_csv(expenses, categories, budgets)
                    elif data_option == 0:
                        break
        
            elif option == 0:
                break
            else:
                print("Invalid option.")

            try:
                option = int(input("Select an option:"))
            except ValueError:
                print("Please enter a valid number.")
                continue
    finally:
        save_data(expenses, categories, budgets)


def add_expense(expenses):
    valid_months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
    ]
    
    month = input("Enter month for expense: ")
    if (month.lower() not in valid_months):
        print("Invalid month")
        return
    name = input("Enter expense name:")
    try:
        amount = float(input("Enter expense cost:"))
    except ValueError:
        print("Invalid amount")
        return
    if month not in expenses:
        expenses[month] = {}
    expenses[month][name] = amount
    print(f"Added {name}: ${amount:.2f} in {month}")

def update_expense(expenses):
    month = input("Enter month").strip().lower()
    if month not in expenses:
        print(f"No expenses recorded for {month}")
        return
    name = input("Enter expense to change")
    if name not in expenses[month]:
        print(f"No expenses recorded with name {name}")
        return
    try:
        new_amount = float(input("Enter new expense amount:"))
    except ValueError:  
        print("Error: Invalid amount")
        return
    
    expenses[month][name] = new_amount
    print(f"Expense {name} updated to {new_amount}")

def delete_expense(expenses):
    month = input("Enter month").strip().lower()
    if month not in expenses:
        print(f"No expenses recorded for {month}")
        return
    name = input("Enter expense to delete")
    if name not in expenses[month]:
        print(f"No expenses recorded with name {name}")
        return
    else:
        del expenses[month][name]
        print(f"Expense {name} removed from {month}")
def view_expenses(expenses):
    if not expenses:
        print("No expenses recorded yet.")
        return
    
    for month, month_expenses in expenses.items():
        print(f"\n{month}:")
        for name, amount in month_expenses.items():
            print(f"{name}: ${amount:.2f}")

def view_expense_summary(expenses):
    if not expenses:
        print("No expenses recorded yet.")
        return
    total = 0

    for month_expenses in expenses.values():
        total += sum(month_expenses.values())
    
    print(f"Total across all months: ${total:.2f}")

def view_expense_summary_for_month(expenses):
    if not expenses:
        print("No expenses recorded yet.")
        return
    month = input("Enter month").strip().lower()
    if month not in expenses:
        print(f"No expenses recorded for {month}")
        return
    
    total = sum(expenses[month].values())

    print(f"Total for {month}: {total:.2f}")

def create_category(categories):
    category = input("Enter category name:")
    if category in categories:
        print(f"Category {category} already exists.")
    else:
        categories[category] = []
        print(f"Category {category} created.")

def add_to_category(categories, expenses):
    category = input("Enter category name:")
    
    if category not in categories:
        print(f"Category {category} not found")
        return
    
    expense = input("Enter expense to be added:")
    
    found = False
    for month_expenses in expenses.values():
        if expense in month_expenses:
            found = True
            break
    
    if not found:
        print(f"Expense {expense} could not be found")
        return
    
    categories[category].append(expense)
    print(f"Expense {expense} added to {category}")

def filter_by_category(expenses, categories):
    category = input("Enter category name:")
    
    if category not in categories:
        print(f"Category {category} not found")
        return 

    expense = categories[category]
    if not expense:
        print(f"No expenses assigned to Category '{expenses}'")
        return
    
    print(f"\nExpenses in category {category}")
    for month, month_expenses in expenses.items():
        for name, amount in month_expenses.items():
            if name in expense:
                print(f"{month.capitalize()}: - {name}: ${amount:.2f}")

def set_budget(expenses, budgets):
    month = input("Enter month: ").lower()
    if month not in expenses:
        print(f"No expenses recorded for {month}")
        return
    try:
        budget = float(input("Enter the desired budget:"))
    except ValueError:
        print("Error: Invalid budget amount.")
        return
    budgets[month] = budget
    print(f"Budget of ${budget:.2f} set for {month}")

def adjust_budget(budgets):
    month = input("Enter month").strip().lower()
    if month not in budgets:
        print(f"No budgets recorded for {month}")
        return
    try:
        new_budget = float(input("Enter new budget: "))
    except ValueError:
        print("Invalid budget amount")
        return
    
    budgets[month] = new_budget
    print(f"Budget for {month} changed to {new_budget:.2f}")

def check_budget(expenses, budgets):
    month = input("Enter month: ").lower()
    if month not in expenses:
        print(f"No expenses recorded for {month}")
        return
    if month not in budgets:
        print(f"No budgets recorded for {month}")
        return
    total_expenses = sum(expenses[month].values())
    budget = budgets[month]

    if total_expenses > budget:
        print(f"Warning: Total expenses for {month} have exceeded the budget: Deficit: ${total_expenses - budget:.2f }")
    
    else:
        print(f"Total expenses for {month} have not exceeded the budget: Remaining: ${budget - total_expenses:.2f }")

def clear_expenses(expenses):
    confirm = input("Are you sure you want to clear data for expenses? (yes/no)").lower()

    if confirm == "yes":
        expenses.clear()
        save_data(expenses)
        print("Expense data cleared.✅")
    else:
        print("Clear cancelled.❌")

def clear_categories(categories):
    confirm = input("Are you sure you want to clear data for categories? (yes/no)").lower()

    if confirm == "yes":
        categories.clear()
        save_data(categories)
        print("Category data cleared.✅")
    else:
        print("Clear cancelled.❌")

def clear_budgets(budgets):
    confirm = input("Are you sure you want to clear data for budgets? (yes/no)").lower()

    if confirm == "yes":
        budgets.clear()
        save_data(budgets)
        print("Budget data cleared.✅")
    else:
        print("Clear cancelled.❌")

def clear_all_data(expenses, categories, budgets):
    confirm = input("Are you sure you want to clear all data? (yes/no)").lower()

    if confirm == "yes":
        expenses.clear()
        categories.clear()
        budgets.clear()
        save_data(expenses, categories, budgets)
        print("All data cleared.✅")
    else:
        print("Clear cancelled.❌")

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
        print("Error: No expenses.csv found")
    try:
        with open("categories.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                categories[row["Category"]] = row["Expenses"].split(";") if row["Expenses"] else []
        print("Categories imported from categories.csv")
    except FileNotFoundError:
        print("Error: No categories.csv found")
    try:
        with open("budgets.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                budgets[row["Month"].lower()] = float(row["Limit"])
        print("Budgets imported from budgets.csv")
    except FileNotFoundError:
        print("Error: No budgets.csv found")

def export_to_csv(expenses, categories, budgets):
    with open("expenses.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Month", "Expense", "Amount"])
        for month, month_expenses in expenses.items():
            for expense, amount in month_expenses.items():
                writer.writerow([month, expense, amount])
    print("Expenses exported to expenses.csv")
    with open("categories.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Categories", "Expenses"])
        for category, exp_list in categories.items():
            writer.writerow([category, ",".join(exp_list)])
    print("Categories exported to categories.csv")
    with open("budgets.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Month", "Limit"])
        for month, limit in budgets.items():
            writer.writerow([month, limit])
    print("Expenses exported to expenses.csv")

if __name__ == "__main__":
    main()