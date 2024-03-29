export const setErrorData = (code: number, messageTranslationKey: string) => {
  localStorage.setItem("applicationErrorStatusCode", code.toString());
  localStorage.setItem("applicationErrorTranslationKey", messageTranslationKey);
  localStorage.setItem("applicationErrorTldraw", "true");

  if (!import.meta.env.PROD) {
    console.error(`Error code '${code}' - message '${messageTranslationKey}'`);
  }
};

export const clearErrorData = () => {
  localStorage.removeItem("applicationErrorStatusCode");
  localStorage.removeItem("applicationErrorTranslationKey");
  localStorage.removeItem("applicationErrorTldraw");
};
