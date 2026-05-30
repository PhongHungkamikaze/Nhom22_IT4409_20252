export function normalizePaginated(data) {
    if (data?.results) {
        return { items: data.results, total: data.count };
    }
    if (Array.isArray(data)) {
        return { items: data, total: data.length };
    }
    return { items: [], total: 0 };
}
