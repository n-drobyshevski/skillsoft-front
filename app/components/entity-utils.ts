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

export const formatProficiencyLevel = (level: string): string => {
    return level.charAt(0) + level.slice(1).toLowerCase().replace("_", " ");
};

export const formatEnumValue = (value: string): string => {
    return value.replace("_", " ");
};