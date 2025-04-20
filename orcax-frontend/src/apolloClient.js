// apolloClient.js

import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://orcax-backend.onrender.com/graphql", // 👈 여기에 네 백엔드 GraphQL 주소 정확하게
  cache: new InMemoryCache({
    typePolicies: {
      OwnerUsage: {
        keyFields: false,
      },
      BuildPlanUsage: {
        keyFields: false,
      },
    },
  }),
});

export default client;
