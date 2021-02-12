//Save user's password in rx and use it as the encryption key.

const rx = clmT;
let crypt = {
  secret: rx,
  encrypt: function (clear) {
    // encrypt() : encrypt the given clear text

    let cipher = CryptoJS.AES.encrypt(clear, crypt.secret);
    cipher = cipher.toString();
    return cipher;
  },

  decrypt: function (cipher) {
    // decrypt() : decrypt the given cipher text

    let decipher = CryptoJS.AES.decrypt(cipher, crypt.secret);
    decipher = decipher.toString(CryptoJS.enc.Utf8);
    return decipher;
  },
};
