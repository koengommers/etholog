/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrder: ["^[./]"],
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};

export default config;
