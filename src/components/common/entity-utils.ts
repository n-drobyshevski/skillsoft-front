/**
 * Shared utilities for entity detail pages
 */

export const approvalStatusToColor = (status: string): string => {
    const colors: { [key: string]: string } = {
        DRAFT: "border-gray-500/30 text-gray-400 bg-gray-500/8 dark:text-gray-300",
        PENDING_REVIEW: "border-yellow-500/30 text-yellow-500 bg-yellow-500/8 dark:text-yellow-300",
        APPROVED: "border-emerald-500/30 text-emerald-600 bg-emerald-500/8 dark:text-emerald-300",
        REJECTED: "border-red-500/30 text-red-400 bg-red-500/8 dark:text-red-300",
        ARCHIVED: "border-gray-500/30 text-gray-400 bg-gray-500/8 dark:text-gray-300",
        UNDER_REVISION: "border-blue-500/30 text-blue-600 bg-blue-500/8 dark:text-blue-300",
    };
    return colors[status] ?? colors.DRAFT;
};

export const levelToColor = (level: string): string => {
    const colors: { [key: string]: string } = {
        NOVICE: "border-red-500/30 text-red-400 bg-red-500/8 dark:text-red-300",
        DEVELOPING: "border-orange-500/30 text-orange-500 bg-orange-500/8 dark:text-orange-300",
        PROFICIENT: "border-yellow-500/30 text-yellow-600 bg-yellow-500/8 dark:text-yellow-300",
        ADVANCED: "border-emerald-500/30 text-emerald-600 bg-emerald-500/8 dark:text-emerald-300",
        EXPERT: "border-blue-500/30 text-blue-600 bg-blue-500/8 dark:text-blue-300",
    };
    return colors[level] ?? colors.NOVICE;
};

export const observabilityLevelToColor = (level: string): string => {
    const colors: { [key: string]: string } = {
        DIRECTLY_OBSERVABLE: "border-green-500/30 text-green-600 bg-green-500/8 dark:text-green-300",
        PARTIALLY_OBSERVABLE: "border-blue-500/30 text-blue-600 bg-blue-500/8 dark:text-blue-300",
        INFERRED: "border-purple-500/30 text-purple-600 bg-purple-500/8 dark:text-purple-300",
        SELF_REPORTED: "border-amber-500/30 text-amber-600 bg-amber-500/8 dark:text-amber-300",
        REQUIRES_DOCUMENTATION: "border-gray-500/30 text-gray-600 bg-gray-500/8 dark:text-gray-300",
    };
    return colors[level] ?? colors.DIRECTLY_OBSERVABLE;
};

export const difficultyLevelToColor = (level: string): string => {
    switch (level.toUpperCase()) {
        case 'FOUNDATIONAL':
            return 'border-emerald-500/30 text-emerald-600 bg-emerald-500/8';
        case 'INTERMEDIATE':
            return 'border-yellow-500/30 text-yellow-600 bg-yellow-500/8';
        case 'ADVANCED':
            return 'border-orange-500/30 text-orange-600 bg-orange-500/8';
        case 'SPECIALIZED':
            return 'border-red-500/30 text-red-600 bg-red-500/8';
        default:
            return 'border-blue-500/30 text-blue-600 bg-blue-500/8';
    }
};

export const formatObservabilityLevel = (level: string): string => {
    return level.replace(/_/g, ' ').split(' ').map(word =>
        word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
};

export const formatEnumValue = (value: string): string => {
    return value.replace("_", " ");
};