export function calculateBabyAgeInMonths(
    dateOfBirth: string,
): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let months =
        (today.getFullYear() -
            birthDate.getFullYear()) *
        12 +
        today.getMonth() -
        birthDate.getMonth();

    if (
        today.getDate() <
        birthDate.getDate()
    ) {
        months -= 1;
    }

    return Math.max(months, 0);
}