import csv

def main():
    expenses = {}
    categories = {}
    budgets = {}
    while True:
        print("--Expense Tracker--")
        print("1. Manage Expenses")
        print("2. Manage Categories")
        print("3. Manage Budgets")
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
                print("7. Import From CSV")
                print("8. Export To CSV")
                print("0. Exit")
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
                elif expense_option == 8:
                    export_expenses_to_csv(expenses)
                elif expense_option == 0:
                    break
                else:
                    print("Error: Invalid Option")
                try:
                    expense_option = int(input("Select an option:"))
                except ValueError:
                    print("Please enter a valid number.")
                    continue
        elif option == 2:
            while True:
                print("1. Create Category")
                print("2. Add To Category")
                print("3. Filter By Category")
                print("4. Import From CSV")
                print("5. Export To CSV")
                print("0. Exit")
                if category_option == 1:
                    create_category(categories)
        
                elif category_option == 2:
                    add_to_category(categories, expenses)
        
                elif category_option == 3:
                    filter_by_category(expenses, categories)
        
                elif category_option == 0:
                    break
                try:
                    category_option = int(input("Select an option:"))
                except ValueError:
                    print("Please enter a valid number.")
                    continue
        elif option == 3:
            while True:
                print("1. Set Budget")
                print("2. Adjust Budget")
                print("3. Check Budget")
                print("4. Import From CSV")
                print("5. Export To CSV")
                print("0. Exit")
                if option == 1:
                    set_budget(expenses, budgets)
                elif option == 2:
                    adjust_budget(budgets)
                elif option == 3:
                    check_budget(expenses, budgets)
                elif option == 0:
                    break
                try:
                    option = int(input("Select an option:"))
                except ValueError:
                    print("Please enter a valid number.")
                    continue
        elif option == 0:
            break
        else:
            print("Invalid option.")

        try:
            option = int(input("Select an option:"))
        except ValueError:
            print("Please enter a valid number.")
            continue

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
    
    month = input("Enter month for expense:")
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
    month = input("Enter month")
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
    month = input("Enter month")
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
    month = input("Enter month")
    if month not in expenses:
        print(f"No expenses recorded for {month}")
        return
    
    total = sum(expenses[month].values())

    print(f"Total for {month}: {total:.2f}")

def import_expenses_to_csv(expenses, filename="expenses.csv"):
    try:
        with open(filename, mode="r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                month = row["Month"].lower()

        print(f"Expenses imported from {filename}")
    except FileNotFoundError:
        print(f"Error: File {filename} not found")

def export_expenses_to_csv(expenses, filename="expenses.csv"):
    if not expenses:
        print("No expenses to export")
        return
    
    with open(filename, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Month", "Expense", "Amount"])
    
        for month, month_expenses in expenses.items():
            for name, amount in month_expenses.items():
                writer.writerow([month.capitalize(), name, amount])
    print(f"Expenses exported to {filename}")

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

def import_categories_to_csv(categories, filename="categories.csv"):
    try:
        with open(filename, mode="r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                month = row["Month"].lower()
                try:
                    amount = float(row["Budget"])
                except ValueError:
                    print(f"Skipping invalid budget for {month}")
                    continue
                categories[month] = amount
        print(f"Categories imported from {filename}")
    except FileNotFoundError:
        print(f"Error: File {filename} not found")

def export_categories_to_csv(categories, filename="expenses.csv"):
    if not categories:
        print("No expenses to export")
        return
    
    with open(filename, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Month", "Expense", "Amount"])
    
        for category, expenses in categories.items():
            for name, amount in categories.values():
                writer.writerow([category, name, amount])
    print(f"Categories exported to {filename}")

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
    month = input("Enter month")
    if month not in budgets:
        print(f"No budgets recorded for {month}")
        return
    try:
        new_budget = float(input("Enter new budget: "))
    except ValueError:
        print("Invalid budget amount")
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
        print("Warning: Total expenses for {month} have exceeded the budget: Deficit: ${budget - total_expenses:.2f }")
    
    else:
        print("Total expenses for {month} have not exceeded the budget: Remaining: ${budget - total_expenses:.2f }")

def import_budgets_to_csv(budgets, filename="categories.csv"):
    try:
        with open(filename, mode="r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                month = row["Month"].lower()
                try:
                    amount = float(row["Budget"])
                except ValueError:
                    print(f"Skipping invalid budget for {month}")
                    continue
                budgets[month] = amount
        print(f"Budgets imported from {filename}")
    except FileNotFoundError:
        print(f"Error: File {filename} not found")

def export_budgets_to_csv(budgets, filename="expenses.csv"):
    if not budgets:
        print("No expenses to export")
        return
    
    with open(filename, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Month", "Budget"])
        
        for month, amount in budgets.items():
            writer.writerow([month.capitalize(), amount])
    print(f"Budgets exported to {filename}")
    

if __name__ == "__main__":
    main()