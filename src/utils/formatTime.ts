const formatTime = (seconds: number) => {
    seconds = Math.floor(seconds);
    const second = seconds % 60;
    const minute = Math.floor(seconds / 60) % 60;
    const hour = Math.floor(seconds / 60 / 60) % 24;
    const day = Math.floor(seconds / 60 / 60 / 24);

    const container: string[] = [];
    if (day > 0) {
        container.push(`${day}d`);
    }
    if (hour > 0) {
        container.push(`${hour}h`);
    }
    if (minute > 0) {
        container.push(`${minute}m`);
    }
    if (second > 0) {
        container.push(`${second}s`);
    }

    if (container.length === 0) {
        container.push("0s");
    }

    return container.join(" ");
};

export default formatTime;
