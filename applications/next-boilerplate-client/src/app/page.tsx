'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import MultiSelectDropdown from '@/components/MultiSelectDropdown'
import {
  ProductsQueryData,
  UsersQueryData,
  PurchasesQueryData,
} from './app.types'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import { useState, useMemo } from 'react'

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

const USERS_QUERY = gql`
  query Users($first: Int, $after: String, $searchTerm: String) {
    users(first: $first, after: $after, searchTerm: $searchTerm) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        firstName
        lastName
      }
    }
  }
`

const PURCHASES_QUERY = gql`
  query Purchases(
    $productIds: [ID]
    $userIds: [ID]
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    purchases(
      productIds: $productIds
      userIds: $userIds
      first: $first
      after: $after
      last: $last
      before: $before
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        date
        user {
          id
          firstName
          lastName
        }
        product {
          id
          name
        }
      }
    }
  }
`

export default function Home() {
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [productSelection, setProductSelection] = useState<string[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userSelection, setUserSelection] = useState<string[]>([])

  const {
    loading: productsLoading,
    error: productsError,
    data: productsData,
    fetchMore: fetchMoreProducts,
  } = useQuery<ProductsQueryData>(PRODUCTS_QUERY, {
    variables: { first: 10, searchTerm: productSearchTerm },
  })

  const {
    loading: usersLoading,
    error: usersError,
    data: usersData,
    fetchMore: fetchMoreUsers,
  } = useQuery<UsersQueryData>(USERS_QUERY, {
    variables: { first: 10, searchTerm: userSearchTerm },
  })

  const handleLoadMoreProducts = () => {
    if (!productsData?.products.pageInfo.hasNextPage) {
      return
    }
    fetchMoreProducts({
      variables: {
        first: 10,
        after: productsData.products.pageInfo.endCursor,
      },
    })
  }

  const handleLoadMoreUsers = () => {
    if (!usersData?.users.pageInfo.hasNextPage) {
      return
    }
    fetchMoreUsers({
      variables: {
        first: 10,
        after: usersData.users.pageInfo.endCursor,
      },
    })
  }

  const [afterCursor, setAfterCursor] = useState<string | undefined>(undefined)
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([])

  const {
    loading: purchasesLoading,
    error: purchasesError,
    data: purchasesData,
  } = useQuery<PurchasesQueryData>(PURCHASES_QUERY, {
    variables: {
      productIds: productSelection.length > 0 ? productSelection : undefined,
      userIds: userSelection.length > 0 ? userSelection : undefined,
      first: 20,
      after: afterCursor,
    },
  })

  const handleNextPage = () => {
    if (!purchasesData?.purchases.pageInfo.hasNextPage) {
      return
    }
    setCursorStack((prev) => [...prev, afterCursor])
    setAfterCursor(purchasesData.purchases.pageInfo.endCursor ?? undefined)
  }

  const handlePrevPage = () => {
    if (cursorStack.length === 0) {
      return
    }
    setAfterCursor(cursorStack[cursorStack.length - 1])
    setCursorStack((s) => s.slice(0, -1))
  }

  const userOptions = useMemo(
    () =>
      usersData?.users.nodes.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      })),
    [usersData],
  )

  const error = productsError || usersError || purchasesError
  if (error) {
    return <p>Error: {error.message}</p>
  }

  return (
    <div className="flex sm:items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full sm:min-h-[480px] h-full sm:min-w-[584px] sm:h-auto sm:w-auto h-[780px]">
        <div className="flex gap-2">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Products</h1>
            <MultiSelectDropdown
              options={productsData?.products.nodes}
              placeholder="Select Product"
              itemLabel={{ singular: 'product', plural: 'products' }}
              onLoadMore={handleLoadMoreProducts}
              hasMore={productsData?.products.pageInfo.hasNextPage || false}
              loadingMore={productsLoading}
              onSearch={setProductSearchTerm}
              onSelection={(ids) => {
                setProductSelection(ids)
                setAfterCursor(undefined)
                setCursorStack([])
              }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Users</h1>
            <MultiSelectDropdown
              options={userOptions}
              placeholder="Select User"
              itemLabel={{ singular: 'user', plural: 'users' }}
              onLoadMore={handleLoadMoreUsers}
              hasMore={usersData?.users.pageInfo.hasNextPage || false}
              loadingMore={usersLoading}
              onSearch={setUserSearchTerm}
              onSelection={(ids) => {
                setUserSelection(ids)
                setAfterCursor(undefined)
                setCursorStack([])
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full col-span-2">
          <h2 className="text-xl font-bold">Purchases</h2>
          {purchasesLoading && (
            <div className="flex items-center justify-center py-4">
              <LoaderCircle className="animate-spin" />
            </div>
          )}
          {purchasesData && purchasesData.purchases.nodes.length === 0 && (
            <p className="text-muted-foreground">No purchases found.</p>
          )}
          {purchasesData && purchasesData.purchases.nodes.length > 0 && (
            <ul className="divide-y grow">
              {purchasesData.purchases.nodes.map((purchase) => (
                <li key={purchase.id} className="py-2 flex">
                  <span className="font-medium w-1/3 grow">
                    {purchase.product.name}
                  </span>
                  <span className="text-muted-foreground w-1/3">
                    {purchase.user.firstName} {purchase.user.lastName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(purchase.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {purchasesData && (
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                size="sm"
                disabled={cursorStack.length === 0}
                onClick={handlePrevPage}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={!purchasesData.purchases.pageInfo.hasNextPage}
                onClick={handleNextPage}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
