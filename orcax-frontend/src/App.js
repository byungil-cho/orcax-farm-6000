import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient"; // 👈 위 파일 경로에 맞게 바꿔

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
