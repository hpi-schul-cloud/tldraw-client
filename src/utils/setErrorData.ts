export const setErrorData = (code: number, messageTranslationKey: string) => {
  localStorage.setItem("applicationErrorStatusCode", code.toString());
  localStorage.setItem("applicationErrorTranslationKey", messageTranslationKey);

  if (!import.meta.env.PROD) {
    console.error(`Error code '${code}' - message '${messageTranslationKey}'`);
  }
};
