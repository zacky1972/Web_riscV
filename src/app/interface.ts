interface Code {
    content: string;
    error: string;
}
interface Label{
    name: string;
    index: number;
}
interface ConpiledCode{
    content: Array<string>;
    labels: Array<Label>;
}