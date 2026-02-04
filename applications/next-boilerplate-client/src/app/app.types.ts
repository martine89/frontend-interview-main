export interface Product {
  id: string
  name: string
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

interface MultiSelectOption {
  id: string
  name: string
}

export interface MultiSelectDropdownProps {
  options: MultiSelectOption[]
  placeholder?: string
  itemLabel?: { singular: string; plural: string }
  onChange?: (selectedIds: string[]) => void
}
