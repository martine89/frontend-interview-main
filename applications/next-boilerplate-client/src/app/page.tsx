'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import MultiSelectDropdown from '@/components/MultiSelectDropdown'
import { ProductsQueryData } from './app.types'

const PRODUCTS_QUERY = gql`
  query Products($first: Int) {
    products(first: $first) {
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
  const { loading, error, data } = useQuery<ProductsQueryData>(PRODUCTS_QUERY, {
    variables: { first: 10 },
  })

  const placeholder = 'Select Product'

  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="flex sm:items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full h-auto sm:min-h-[480px] sm:min-w-[584px] sm:h-auto sm:w-auto">
        <h1 className="text-2xl font-bold">Products</h1>
        {!data || loading ? (
          <p>Loading products...</p>
        ) : (
          <MultiSelectDropdown
            options={data.products.nodes}
            placeholder={placeholder}
            itemLabel={{ singular: 'product', plural: 'products' }}
          />
        )}
      </div>
    </div>
  )
}
