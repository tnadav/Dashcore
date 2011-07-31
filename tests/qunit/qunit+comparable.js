function removeWhiteSpace(string) {
    return string.replace(/\s/g, '');
}

function comparable(a, b, description) {
	return equals(removeWhiteSpace(a), removeWhiteSpace(b), description)
}