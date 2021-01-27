from cs50 import SQL
from flask import Flask, redirect, url_for, render_template, request, session, flash
from flask_session import Session
from tempfile import mkdtemp
from jinja2 import Template
from helpers import apology, login_required
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash
import json


app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure responses aren't cached


@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


@app.route('/check', methods=["GET", "POST"])
def check_user():
    db = SQL("sqlite:///passwordmanager.db")
    data = request.get_json(force="True")

    user_list = db.execute("SELECT username FROM users")
    users = []
    for row in user_list:
        users.append(row['username'])
    if data in users:
        return "ok", 208
    else:
        return "ok", 200


@app.route('/')
def welcome():
    if 'user_id' in session:
        return redirect("/home")
    else:
        return render_template("welcome.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    db = SQL("sqlite:///passwordmanager.db")

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            flash('Incorrect username or password')
            print("yes")
            return render_template("login.html")

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]
        session["user_pass"] = request.form.get("password")

        # Redirect user to home page
        return redirect("/home")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


# Handle deletion
@app.route('/delete', methods=["GET", "POST"])
@login_required
def delete():
    db = SQL("sqlite:///passwordmanager.db")
    data = request.get_json(force="True")

    db.execute("DELETE FROM data WHERE id = :id", id=data)

    return "ok", 200


# When the fields in the front are edited
@app.route('/edit', methods=["GET", "POST"])
@login_required
def edit():
    db = SQL("sqlite:///passwordmanager.db")

    data = request.get_json(force="True")

    id_entry = data['id']
    name = data['name']
    link = data['link']
    username = data['username']
    password = data['hash']

    db.execute("UPDATE data SET name = :name, link = :link, username = :username, hash = :hash WHERE id = :id",
               name=name, link=link, username=username, hash=password, id=id_entry)

    return "ok", 200


@app.route("/home", methods=["GET", "POST"])
@login_required
def index():

    db = SQL("sqlite:///passwordmanager.db")
    user_id = session["user_id"]

    if request.method == "GET":
        data = db.execute(
            "SELECT * FROM data WHERE user_id=:user_id ORDER BY name", user_id=user_id)
        data_json = data
        password = session["user_pass"]

        return render_template("index.html", dataFromFlask=data_json, dataR=password)

    else:
        # Take care of the new entry
        name = request.form['name']
        link = request.form['link']
        username = request.form['username']
        password = request.form['password']

        data = db.execute(
            "SELECT * FROM data WHERE user_id=:user_id", user_id=user_id)

        for dat in data:
            if name == dat['name'] or link == dat['link']:

                return "duplicate", 409

        db.execute("INSERT INTO data (user_id, name, link, username, hash) VALUES (:user_id, :name, :link, :username, :hash)",
                   user_id=user_id, name=name, link=link, username=username, hash=password)

        return "succes", 202


# Register user
@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    # When requested via GET, sould diplay registration form.
    db = SQL("sqlite:///passwordmanager.db")
    if request.method == "GET":
        return render_template("registration.html")
    else:
        # When form is submitted via POST, insert the new user into users table.
        # Be sure to check for invalit inputs, and to hash the user's password
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")
        if not username or not password:
            return apology("You must enter username and password")

        elif password != confirmation:
            return apology("Password and confirmation are not same")

        userList = db.execute("Select username FROM users")
        for user in userList:
            if username in userList:
                return apology("User name already registered", 888)
        else:
            pHash = generate_password_hash(password, salt_length=12)
            db.execute("INSERT INTO users (username, hash) VALUES (:username, :pHash)",
                       username=username, pHash=pHash)
            return redirect("/login")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()
    session["user_loged"] = 0
    # Redirect user to login form
    return redirect("/login")


def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)

if __name__ == "__main__":
    app.run(debug=True)
