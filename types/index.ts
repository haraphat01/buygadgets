export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };
