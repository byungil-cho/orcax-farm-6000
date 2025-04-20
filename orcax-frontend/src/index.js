// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient"; // 👈 경로 맞게 주의

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
