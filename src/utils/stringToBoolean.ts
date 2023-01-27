const stringToBoolean = (string: string): boolean => {
    const stringLowerCase = string.trim().toLowerCase();
    switch (stringLowerCase) {
        case "yes":
        case "ok":
        case "true":
        case "1":
            return true;
        default:
            return false;
    }
};

export default stringToBoolean;
