type msgType = "cmd" | "wrong" | "res" | "err"

interface Msg {
    content: string;
    type: msgType;
}