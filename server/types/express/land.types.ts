export type GetLandsQuery = {
  page: number
  limit: number
  status?: string
  recentlyApproved?: boolean
}