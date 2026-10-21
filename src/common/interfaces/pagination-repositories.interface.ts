export interface IPaginationRepoOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    startDate?: string;
    endDate?: string;
}

export interface IPaginationRepoResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
