function generatePass(length) {
  let numbers = "";

  for (let i = 0; i < length; i++) {
    // Generate a number from 33 to 126 (0 - 93) + 33
    let nr = Math.floor(Math.random() * 93) + 33;
    // Spaces not allowed
    if (String.fromCharCode(nr) !== " ") {
      numbers += String.fromCharCode(nr);
    } else {
      numbers += String.fromCharCode(nr + 1);
    }
  }

  return numbers;
}
