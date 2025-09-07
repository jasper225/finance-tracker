import tracker
import analytics
from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_scss import Scss

app = Flask(__name__)
Scss(app)

expenses, categories, budgets = tracker.load_data()

@app.route("/")
def index():
    return render_template("index.html", expenses=expenses, categories=categories, budgets=budgets)

@app.route("/sync_analytics")
def sync_analytics():
    try:
        analytics.sync_data_to_analytics(expenses, categories)
    except Exception as e:
        return jsonify({{"error": str(e)}}), 500

@app.route("/analytics/monthly_trends")
def get_monthly_trends():
    try:
        analytics.sync_data_to_analytics(expenses, categories)
        trends = analytics.get_monthly_trends()
        return jsonify(trends)
    except Exception as e:
        return jsonify({{"error": str(e)}}), 500

@app.route("/analytics/category_breakdown")
def get_category_breakdown():
    try:
        analytics.sync_data_to_analytics(expenses, categories)
        category_breakdown = analytics.get_category_breakdown()
        return jsonify(category_breakdown)
    except Exception as e:
        return jsonify({{"error": str(e)}}), 500

@app.route("/analytics/insights")
def get_insights():
    try:
        analytics.sync_data_to_analytics(expenses, categories)
        insights = analytics.get_spending_insights()
        return jsonify(insights)
    except Exception as e:
        return jsonify({{"error": str(e)}}), 500

@app.route("/analytics/category_trends")
def get_category_trends():
    try:
        analytics.sync_data_to_analytics(expenses, categories)
        category_trends = analytics.get_expense_trends_by_category()
        return jsonify(category_trends)
    except Exception as e:
        return jsonify({{"error": str(e)}}), 500

@app.route("/analytics/search_expenses")
def search_expenses():
    try:
        analytics.sync_data_to_analytics(expenses, categories)
        query = request.args.get('query')
        category = request.args.get('category')
        month = request.args.get('month')
        min_amount = request.args.get('min_amount')
        max_amount = request.args.get('max_amount')
        results = analytics.search_expenses(query, category, month, min_amount, max_amount)
        return jsonify(results)
    except Exception as e:
        return jsonify({{"error": str(e)}}), 500

@app.route("/analytics/get_analytics_summary")
def get_analytics_summary():
    try:
        analytics.sync_data_to_analytics(expenses, categories)
        summary = analytics.get_analytics_summary()
    except Exception as e:
        return jsonify({{"error": str(e)}}), 500

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

@app.route("/list_categories")
def list_categories():
    return jsonify(categories or {})

@app.route("/set_budget", methods=["POST"])
def set_budget():
    month = request.form["month"]
    budget = float(request.form["amount"])
    tracker.set_budget(budgets, month, budget)
    tracker.save_data(expenses, categories, budgets)
    
    return redirect(url_for("index"))

@app.route("/adjust_budget/<month>", methods=["POST"]) 
def adjust_budget(month):
    new_budget = float(request.form["budget"])
    tracker.adjust_budget(budgets, month, new_budget)
    tracker.save_data(expenses, categories, budgets)

    return redirect(url_for("index"))

@app.route("/get_budget/<month>")
def get_budget(month):
    budget = tracker.get_budget(budgets, month)
    return jsonify({"month": month, "budget": budget})

@app.route("/check_budget/<month>")
def check_budget(month):
    budget_status = tracker.check_budget(expenses, budgets, month)

    return jsonify(budget_status)

@app.route("/list_budgets")
def list_budgets():
    return jsonify(budgets or {})

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


