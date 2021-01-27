function redAlert(msg) {
  body = document.querySelector("body")
  let p = document.createElement("p");
  let text = document.createTextNode(msg);
  p.appendChild(text);
  let div = document.createElement("div");
  div.classList.add("error-bar");
  div.appendChild(p);
  body.appendChild(div);
}
// Select the button that generates a random password
const genButton2 = document.querySelector("#generator2");

const oldData = {};

// rowInEdit will keep track so that only 1 row in edit at one time.
let rowInEdit = false;

function generatePassword2(elm) {
  let password;
  let row = elm.parentElement.parentElement;
  let passFieldInEdit = row.querySelector(".in-edit");
  password = generatePass(18);
  passFieldInEdit.value = password;
}
//Change td to inputs ready for editing
function trToInput(elm) {
  let theInput = document.createElement("input");

  theInput.classList.add("artificial-input");
  theInput.classList.add("no-outline");
  if (elm.querySelector(".password2")) {
    theInput.classList.add("in-edit");
  }

  theInput.value = elm.innerText;

  elm.parentNode.insertBefore(theInput, elm);
  elm.classList.add("is-hidden");
}

//Change inputs back to td
function inputToTd(elm, data) {
  let inputField = elm.parentNode.querySelector(".artificial-input");
  elm.innerHTML = data;
  inputField.remove();
  elm.classList.remove("is-hidden");
}

async function deleteOnClick(elm) {
  //First prompt the user for confirmation of deletion and password

  pw_prompt({
    lm: "Please enter your PassApp password to confirm:",
    callback: async function (password) {
      if (rx === password) {
        let row = elm.parentElement.parentElement;
        let name = row.querySelector("td");
        let entryId = name.getAttribute("data-entry-id");

        //Send the Id to the back
        let response = await fetch("/delete", {
          method: "POST",
          body: JSON.stringify(entryId),
        });
        if (response.status == 200) {
          console.log("Succesfully deleted");
          // Reload the page
          location.reload();
        } else {
          console.log("Error deleting, code not 200");
        }
      } else {
        response = false;
        redAlert("Incorrect password");
      }
    },
  });

  //Get the entry id that needs to be used to delete the entry in DB
}

function cancelOnClick(elm) {
  let row = elm.parentElement.parentElement;
  //In case the cancel is pressed
  let generatorButton = row.querySelector(".generate-button");
  let name = row.querySelector(".name-search");
  let link = row.querySelector(".link-search");
  let username = row.querySelector(".username-td");
  let password = row.querySelector(".password-td");
  let editButton = row.querySelector(".edit-button");
  let delButton = row.querySelector(".delete-button");
  let saveButton = row.querySelector(".save-button");
  let canButton = row.querySelector(".cancel-button");
  //Make all the inputs back "td" with the old values
  //Name
  inputToTd(name, oldData["name"]);
  //Link
  inputToTd(link, oldData["link"]);
  //username
  inputToTd(username, oldData["username"]);
  //password
  inputToTd(password, oldData["password"]);

  //Hide edit and delete buttons and show save and cancel
  editButton.classList.remove("is-hidden");
  delButton.classList.remove("is-hidden");
  saveButton.classList.add("is-hidden");
  canButton.classList.add("is-hidden");
  generatorButton.classList.add("is-hidden");
  row.classList.remove("row-in-edit");

  rowInEdit = false;
}

function editOnClick(elm) {
  if (rowInEdit) {
    redAlert("You can only edit one entry at a time");
    return;
  }

  let row = elm.parentElement.parentElement;

  //Ask fot the password and reveal password
  let passButt = row.querySelector(".reveal-button");
  if (passButt) {
    redAlert("You must reveal the password first before editing the entry");
  } else {
    //Select all the data fields to be changed into inputs.
    let name = row.querySelector(".name-search");
    let link = row.querySelector(".link-search");
    let username = row.querySelector(".username-td");
    let password = row.querySelector(".password-td");
    let editButton = row.querySelector(".edit-button");
    let delButton = row.querySelector(".delete-button");
    let saveButton = row.querySelector(".save-button");
    let canButton = row.querySelector(".cancel-button");
    let genButton = row.querySelector(".generate-button");

    rowInEdit = true;

    //Name
    trToInput(name);
    //Link
    trToInput(link);
    //username
    trToInput(username);
    //password
    trToInput(password);

    row.classList.add("row-in-edit");

    //Hide edit and delete buttons and show save and cancel
    editButton.classList.add("is-hidden");
    delButton.classList.add("is-hidden");
    saveButton.classList.remove("is-hidden");
    canButton.classList.remove("is-hidden");
    genButton.classList.remove("is-hidden");

    //Save the old data in the inputs before adding a event listener

    oldData["name"] = name.innerText.trim();
    oldData["link"] = link.innerText.trim();
    oldData["username"] = username.innerText.trim();
    oldData["password"] = password.innerText.trim();
    //Spaces not allowed in the begining or end of password
  }
}

async function saveOnlclick(elm) {
  rowInEdit = true;
  const dataEdited = {};
  row = elm.parentElement.parentElement;

  //Get the data from the inputs and back it in an object
  let id = row.querySelector(".name-search").getAttribute("data-entry-id");

  let name = row.querySelector(".artificial-input").value;
  inputToTd(row.querySelector(".name-search"), name);

  let link = row.querySelector(".artificial-input").value;
  inputToTd(row.querySelector(".link-search"), link);

  let username = row.querySelector(".artificial-input").value;
  inputToTd(row.querySelector(".username-td"), username);

  let password = crypt.encrypt(row.querySelector(".artificial-input").value);
  inputToTd(
    row.querySelector(".password-td"),
    row.querySelector(".artificial-input").value
  );

  dataEdited["id"] = id;
  dataEdited["name"] = name;
  dataEdited["link"] = link;
  dataEdited["username"] = username;
  dataEdited["hash"] = password;
  let genButton = row.querySelector(".generate-button");
  genButton.classList.add("is-hidden");
  row.classList.remove("row-in-edit");

  let response = await fetch("/edit", {
    method: "POST",
    body: JSON.stringify(dataEdited),
  });

  if (response.status == 200) {
    console.log("succesfull");
    location.reload();
  } else {
    redAlert("Database error");
  }
}
