export const makeRegex = (value: string) => ({
    $regex: value,
    $options: 'i',
});