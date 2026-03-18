"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/store/store";
import { hydrateAuth } from "@/store/authSlice";

const AuthHydrator = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  return children;
};

const ReduxProvider = ({ children }) => (
  <Provider store={store}>
    <AuthHydrator>{children}</AuthHydrator>
  </Provider>
);

export default ReduxProvider;
