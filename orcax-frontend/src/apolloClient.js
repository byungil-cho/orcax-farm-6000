// src/apolloClient.js
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://orcax-backend.onrender.com/graphql", // 너 백엔드 주소
  cache: new InMemoryCache({
    typePolicies: {
      OwnerUsage: {
        keyFields: false,
        merge(existing = {}, incoming) {
          return {
            ...existing,
            ...incoming,
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
