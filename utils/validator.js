export function isValidEmail(email) {
    const emailRegex = /^[A-Za-z]+[A-Za-z]\d{4}@student\.babcock\.edu\.ng$/;
    return emailRegex.test(email);
}

export function isValidMatricNumber(matricNo) {
    const matricRegex = /^\d{2}\/\d{4}$/;
    return matricRegex.test(matricNo);
}
