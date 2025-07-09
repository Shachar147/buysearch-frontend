export function ucfirst(str: string): string {
    return str.replace(/\b\w/g, c => c.toUpperCase());
}