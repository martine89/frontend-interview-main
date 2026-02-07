'use client'

import { HttpLink } from '@apollo/client'
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs'
function makeClient() {
  const httpLink = new HttpLink({
    uri: 'http://localhost:4000/',
  })

  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            products: {
              keyArgs: ['searchTerm'],
              merge(existing, incoming) {
                return {
                  ...incoming,
                  nodes: [...(existing?.nodes || []), ...incoming.nodes],
                }
              },
            },
          },
        },
      },
    }),
    link: httpLink,
  })
}

export default function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
