export const MONTHS = Array.from(
    { length: 12 },
    (_, index) => index + 1,
);

export function getYears(
    maxAge = 5,
): number[] {
    const currentYear = new Date().getFullYear();

    return Array.from(
        { length: maxAge + 1 },
        (_, index) => currentYear - index,
    );
}

export function getDaysInMonth(
    month: number,
    year: number,
): number {
    if (!month || !year) {
        return 31;
    }

    return new Date(
        year,
        month,
        0,
    ).getDate();
}