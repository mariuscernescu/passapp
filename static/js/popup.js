//Code by Zach Saucier
// https://stackoverflow.com/questions/9554987/how-can-i-hide-the-password-entered-via-a-javascript-dialog-prompt
//Create a pop up for password

let promptCount = 0;
window.pw_prompt = function(options) {
    let lm = options.lm || "Password:",
        bm = options.bm || "SUBMIT";
    if(!options.callback) { 
        alert("No callback function provided! Please provide one.") 
    };
                   
    let prompt = document.createElement("div");
    prompt.className = "pw_prompt";
    
    let submit = function() {
        options.callback(input.value);
        document.body.removeChild(prompt);
    };

    let label = document.createElement("label");
    label.textContent = lm;
    label.for = "pw_prompt_input" + (++promptCount);
    prompt.appendChild(label);

    let input = document.createElement("input");
    input.classList.add("no-outline");
    input.id = "pw_prompt_input" + (promptCount);
    input.type = "password";
    input.addEventListener("keyup", function(e) {
        if (e.keyCode == 13) submit();
    }, false);
    prompt.appendChild(input);

    let button = document.createElement("button");
    button.textContent = bm;
    button.addEventListener("click", submit, false);
    prompt.appendChild(button);

    document.body.appendChild(prompt);
};

