// Select formular
const formElem = document.querySelector("#formElem");
// Select the button that generates a random password
const genButton = document.querySelector("#generator");
// Select table
const table = document.querySelector("#list-entries");
const tableBody = document.querySelector("tbody");
// Select the password field
const passField = document.querySelector("#password");
//Select the search bar
const search = document.querySelector("#search-bar");
//Select the new-entry button
const newEntry = document.querySelector("#add-entry");
//Select submit button
const submitButton = document.querySelector("#submit");
//Select the edit and delete button
let edits = document.querySelectorAll(".edit-button");

let deleteButtons = document.querySelectorAll(".delete-button");

if (newEntry) {
  newEntry.addEventListener("click", () => {
    formElem.classList.remove("is-hidden");
    genButton.classList.remove("is-hidden");
  });
}

//If we are on the index page where #formElem is.
if (formElem) {
  //When the new entry is submited
  formElem.onsubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    //Select all the input from the user and encrypt the password
    const name = document.querySelector("#name").value;
    const link = document.querySelector("#link").value;
    const username = document.querySelector("#username").value;
    const password = crypt.encrypt(document.querySelector("#password").value);

    //Add everything to data
    data.append("name", name);
    data.append("link", link);
    data.append("username", username);
    data.append("password", password);

    //Send the info to the back-end
    let response = await fetch("/home", {
      method: "POST",
      body: data,
    });

    //Check if the new entry already exist in the DB.
    if (response.status == 409) {
      redAlert("Duplicates not allowed");
    }

    //If everything was fine in Flask clear the inputs
    if (response.status == 202) {
      document.querySelector("#name").value = "";
      document.querySelector("#link").value = "";
      document.querySelector("#username").value = "";
      document.querySelector("#password").value = "";

      // Reload the page after any first entry.
      location.reload();

      //Add the new entry in the view.
      formElem.classList.add("is-hidden");
      genButton.classList.add("is-hidden");
    }
  };
}

//Listen to the "generate" button and generate random password when clicked.
if (genButton) {
  genButton.addEventListener("click", function () {
    let password;
    let passFieldInEdit = document.querySelector("#password");

    password = generatePass(18);
    passFieldInEdit.value = password;
    checkPassField();
  });
}

//Function to run when the password button is clicked
function htmlActivate(elm) {
  let passwordX = crypt.decrypt(elm.querySelector(".is-hidden").innerHTML);

  changeText = () => {
    elm.outerHTML = `<p class="password2">${passwordX}</p>`;
  };
  //Check password
  pw_prompt({
    lm: "Please enter your PassApp password to confirm: ",
    callback: function (password) {
      if (rx === password) {
        response = true;
        changeText();
      } else {
        response = false;
        redAlert("Incorrect password");
      }
    },
  });
  return true;
}

//Create a new <tr> in the table.
function updateTable(name, link, username, password) {
  return `
      <tr>
        <td class="name-search">${name}</td>
        <td> <a class="link-search" target="_blank" href="${link}">${link}</a></td>
        <td><p>${username}</p></td>
        <td class="password-td"><button onclick="htmlActivate(this)">Reveal Password <p class="is-hidden">${password}</p></button> </td>
      </tr>
    `;
}

makeRequests = async (data) => {
  return (response = await fetch("/edit", {
    method: "POST",
    body: JSON.stringify(data),
  }));
};

combineArrays = (first, second) => {
  return first.reduce((acc, val, ind) => {
    acc[val] = second[ind];
    return acc;
  }, {});
};

passField.addEventListener("keyup", checkPassField);

function checkPassField() {
  let input = passField.value;
  console.log(input);
  let msgBox;
  if (msgBox) {
    msgBox.innerHTML = "";
  }
  msgBox = document.querySelector("#passError");
  if (input.slice(0, 1) == " " || input.slice(-1) == " " || input.length < 8) {
    submitButton.disabled = true;
    setTimeout(function () {
      msgBox.innerHTML = `
      <p class="error-p">Password must be at least 8 characters long. Should not begin or end with 'space'.</p>
      `;
    }, 300);
  } else {
    submitButton.disabled = false;
    msgBox.innerHTML = "";
  }
}

function searchFunc() {
  let input, filter, names, nameText, i, linkText;

  input = document.querySelector("#mySearch");
  filter = input.value.toLowerCase();
  body = document.querySelector("tbody");
  names = document.querySelectorAll(".name-search");

  for (i = 0; i < names.length; i++) {
    nameText = names[i].innerHTML;

    if (nameText.toLowerCase().indexOf(filter) > -1) {
      names[i].parentElement.style.display = "";
    } else {
      names[i].parentElement.style.display = "none";
    }
  }
}
