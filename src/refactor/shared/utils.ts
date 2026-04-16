export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str?.slice(1);
}

export const dataValuesToOptions = (values: string[]) =>
  [...new Set(values)]
    .filter(Boolean)
    .sort()
    .map(value => ({ label: capitalize(value), value: value }));