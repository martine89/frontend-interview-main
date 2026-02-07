export interface Product {
  id: string
  name: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
}

export interface UsersQueryData {
  users: {
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string | null
      endCursor: string | null
    }
    nodes: User[]
  }
}

export interface ProductsQueryData {
  products: {
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string | null
      endCursor: string | null
    }
    nodes: Product[]
  }
}

export interface Purchase {
  id: string
  date: string
  user: User & { profilePictureUrl: string }
  product: Product & { imageUrl: string }
}

export interface PurchasesQueryData {
  purchases: {
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string | null
      endCursor: string | null
    }
    nodes: Purchase[]
  }
}

interface MultiSelectOption {
  id: string
  name: string
}

export interface MultiSelectDropdownProps {
  options?: MultiSelectOption[]
  placeholder?: string
  itemLabel?: { singular: string; plural: string }
  onLoadMore: () => void
  hasMore: boolean
  loadingMore: boolean
  onSearch: (term: string) => void
  onSelection: (selectedIds: string[]) => void
}
