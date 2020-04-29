import React, { useState, useEffect, createContext, useContext } from "react";

import { initializeApp, app as firebaseApp } from "firebase/app";

type FirebaseApp = firebaseApp.App;

interface IFirebaseContext {
  app?: FirebaseApp;
}

interface FirebaseContextProviderProps {
  initParams: { options: object; name?: string };
}

const firebaseContext = createContext<IFirebaseContext>(null as any);

const FirebaseContextProvider: React.FC<FirebaseContextProviderProps> = (
  props
) => {
  const [contextValue, setContextValue] = useState<IFirebaseContext>({});

  useEffect(() => {
    const { options, name } = props.initParams;

    const app = initializeApp(options, name);
    setContextValue((prev) => ({
      ...prev,
      app,
    }));
  }, []);

  return (
    <firebaseContext.Provider value={contextValue}>
      {props.children}
    </firebaseContext.Provider>
  );
};

const useFirebase = () => {
  const { app } = useContext(firebaseContext);

  return {
    app,
  };
};

export default useFirebase;
export { FirebaseContextProvider };
