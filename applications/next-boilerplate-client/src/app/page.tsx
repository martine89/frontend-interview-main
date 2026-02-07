'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import MultiSelectDropdown from '@/components/MultiSelectDropdown'
import { ProductsQueryData } from './app.types'
import { useState } from 'react'

const PRODUCTS_QUERY = gql`
  query Products($first: Int, $after: String, $searchTerm: String) {
    products(first: $first, after: $after, searchTerm: $searchTerm) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        name
      }
    }
  }
`

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const { loading, error, data, fetchMore } = useQuery<ProductsQueryData>(
    PRODUCTS_QUERY,
    {
      variables: { first: 10, searchTerm },
    },
  )

  const handleLoadMore = () => {
    if (!data?.products.pageInfo.hasNextPage) return
    fetchMore({
      variables: {
        first: 10,
        after: data.products.pageInfo.endCursor,
      },
    })
  }

  const placeholder = 'Select Product'

  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="flex sm:items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full h-auto sm:min-h-[480px] sm:min-w-[584px] sm:h-auto sm:w-auto">
        <h1 className="text-2xl font-bold">Products</h1>
        <MultiSelectDropdown
          options={data?.products.nodes}
          placeholder={placeholder}
          itemLabel={{ singular: 'product', plural: 'products' }}
          onLoadMore={handleLoadMore}
          hasMore={data?.products.pageInfo.hasNextPage || false}
          loadingMore={loading}
          onSearch={setSearchTerm}
        />
      </div>
    </div>
  )
}
