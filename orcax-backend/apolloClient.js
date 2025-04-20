// apolloClient.js
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://orcax-backend.onrender.com/graphql", // 실제 GraphQL 백엔드 주소로 수정
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
