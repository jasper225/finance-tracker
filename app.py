import tracker
from flask import Flask, render_template, request, redirect, url_for
from flask_scss import Scss

app = Flask(__name__)

expenses, categories, budgets = tracker.load_data()

def index():
    return render_template("index.html", expenses=expenses, categories=categories, budgets=budgets)

def add_expense():
    month = request.form["month"]
    expense = request.form["expense"]
    amount = float(request.form["amount"])
    tracker.add_expense(expenses, month, expense, amount)
    tracker.save_data(expenses, categories, budgets)
    
    return redirect(url_for("index"))

def update_expense():
    month = request.form["month"]
    expense = request.form["expense"]
    new_amount = float(request.form["amount"])
    tracker.add_expense(expenses, month, expense, new_amount)
    tracker.save_data(expenses, categories, budgets)
    
    return redirect(url_for("index"))
