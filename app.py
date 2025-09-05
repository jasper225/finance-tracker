import tracker
from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_scss import Scss

app = Flask(__name__)
Scss(app)

expenses, categories, budgets = tracker.load_data()

@app.route("/")
def index():
    return render_template("index.html", expenses=expenses, categories=categories, budgets=budgets)

@app.route("/add_expense", methods=["POST"])
def add_expense():
    month = request.form["month"]
    name = request.form["name"]
    amount = float(request.form["amount"])
    tracker.add_expense(expenses, month, name, amount)
    tracker.save_data(expenses, categories, budgets)
    
    return redirect(url_for("index"))

@app.route("/update_expense/<month>/<name>", methods=["POST"])
def update_expense(month, name):
    new_amount = float(request.form["amount"])
    tracker.update_expense(expenses, month, name, new_amount)
    tracker.save_data(expenses, categories, budgets)
    
    return redirect(url_for("index"))

@app.route("/delete_expense/<month>/<name>")
def delete_expense(month, name):
    tracker.delete_expense(expenses, month, name)
    tracker.save_data(expenses, categories, budgets)
    
    return redirect(url_for("index"))

@app.route("/list_expense/<month>")
def list_expenses(month):
    month_expenses = tracker.list_expenses(expenses, month)
    
    return jsonify(month_expenses)

@app.route("/monthly_summary/<month>")
def monthly_summary(month):
    total = tracker.monthly_summary(expenses, month)

    return jsonify({"month": month,
                   "total": total})

@app.route("/add_category", methods=["POST"])
def add_category():
    category = request.form["category"]
    tracker.add_category(categories, category)
    tracker.save_data(expenses, categories, budgets)
    
    return redirect(url_for("index"))

@app.route("/add_expense_to_category/<category>/<name>")
def add_expense_to_category(category, name):
    tracker.add_expense_to_category(categories, category, name)
    tracker.save_data(expenses, categories, budgets)
    
    return redirect(url_for("index"))

@app.route("/delete_category/<category>")
def delete_category(category):
    tracker.delete_category(categories, category)
    tracker.save_data(expenses, categories, budgets)

    return redirect(url_for("index"))

@app.route("/category_expenses/<category>")
def category_expenses(category):
    category_expenses = tracker.category_expenses(expenses, categories, category)
    
    return jsonify(category_expenses)

@app.route("/set_budget", methods=["POST"])
def set_budget():
    month = request.form["month"]
    budget = float(request.form["amount"])
    tracker.set_budget(budgets, month, budget)
    tracker.save_data(expenses, categories, budgets)
    
    return redirect(url_for("index"))

@app.route("/adjust_budget/<month>/<budget>", methods=["POST"]) 
def adjust_budget(month):
    new_budget = float(request.form["budget"])
    tracker.adjust_budget(budgets, month, new_budget)
    tracker.save_data(expenses, categories, budgets)

    return redirect(url_for("index"))

@app.route("/get_budget/<month>/<budget>")
def get_budget(month, budget):
    tracker.get_budget(budgets, month, budget)
    tracker.save_data(expenses, categories, budgets)

    return jsonify({"month": month, "budget": budget})

@app.route("/check_budget/<month>")
def check_budget(month):
    budget_status = tracker.check_budget(budgets, month)

    return jsonify(budget_status)


@app.route("/clear_expenses")
def clear_expenses():
    tracker.clear_expenses(expenses)
    tracker.save_data(expenses, categories, budgets)

    return redirect(url_for("index"))

@app.route("/clear_categories")
def clear_categories():
    tracker.clear_categories(categories)
    tracker.save_data(expenses, categories, budgets)

    return redirect(url_for("index"))

@app.route("/clear_budgets")
def clear_budgets():
    tracker.clear_budgets(budgets)
    tracker.save_data(expenses, categories, budgets)

    return redirect(url_for("index"))

@app.route("/clear_all_data")
def clear_all():
    tracker.clear_all_data(expenses, categories, budgets)
    tracker.save_data(expenses, categories, budgets)

    return redirect(url_for("index"))

@app.route("/import_from_csv")
def import_data():
    tracker.import_from_csv(expenses, categories, budgets)
    tracker.save_data(expenses, categories, budgets)

    return redirect(url_for("index"))

@app.route("/export_to_csv")
def export_data():
    tracker.export_to_csv(expenses, categories, budgets)

    return jsonify({"message": "Data exported successfully!"})



if __name__ == "__main__":
    app.run(debug=True)


