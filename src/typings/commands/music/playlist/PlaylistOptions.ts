export default interface PlaylistOptions {
    action: "remove" | "create" | "info" | "switch" | "list";
    name?: string;
}
