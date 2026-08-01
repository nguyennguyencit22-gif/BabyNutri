import type { BabyAge } from '../types/profile/babyAge';

export function calculateBabyAgeInMonths(
    dateOfBirth: string,
): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    if (Number.isNaN(birthDate.getTime())) {
        return 0;
    }

    let months =
        (today.getFullYear() - birthDate.getFullYear()) * 12 +
        today.getMonth() -
        birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) {
        months -= 1;
    }

    return Math.max(months, 0);
}

export function getBabyAge(
    dateOfBirth: string,
): BabyAge {
    const totalMonths =
        calculateBabyAgeInMonths(dateOfBirth);

    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    const isInMonthStage = totalMonths <= 36;

    let display: string;

    if (isInMonthStage) {
        display =
            totalMonths === 1
                ? '1 month'
                : `${totalMonths} months`;
    } else {
        display =
            years === 1
                ? '1 year'
                : `${years} years`;
    }

    return {
        totalMonths,
        years,
        remainingMonths,
        display,
        isInMonthStage,
    };
}