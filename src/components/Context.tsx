import { createContext, useContext, ReactNode } from "react";

type ContextProps = {
  children: ReactNode;
  value: any;
};

const Context = createContext<any | undefined>(undefined);

export const ContextProvider = ({ children, value }: ContextProps) => {
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useNewContext = () => {
  const contextValue = useContext(Context);
  if (contextValue === undefined) {
    throw new Error("useNewContext must be used within a ContextProvider");
  }
  return contextValue;
};
