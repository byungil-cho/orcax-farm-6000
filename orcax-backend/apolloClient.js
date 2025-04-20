// apolloClient.js
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://orcax-backend.onrender.com/graphql", // 실제 백엔드 GraphQL 주소
  cache: new InMemoryCache({
    typePolicies: {
      OwnerUsage: {
        keyFields: false,
        merge(existing = {}, incoming) {
          return {
            ...existing,
            ...incoming,
            usage: {
              ...existing?.usage,
              ...incoming?.usage,
            },
          };
        },
      },
      BuildPlanUsage: {
        keyFields: false,
      },
    },
  }),
});

export default client;
