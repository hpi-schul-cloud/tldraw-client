export const validateId = (id: string) => {
  if (!id.match("/^[a-f]{24}$/i")) {
    throw new Error("Wrong ID format");
  }
};
