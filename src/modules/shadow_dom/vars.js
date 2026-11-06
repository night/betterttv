// Styles API vars shared across components. Mantine writes these variables inline from its size and
// variant props, so they're set through `vars` rather than overridden in a stylesheet.

// the website's flat buttons, with variant="filled" color="dark.8": 16px sides, and a hover on the
// elevated wash, since filled's darker shade matches the page
export const flatButtonVars = () => ({
  root: {'--button-padding-x': '16px', '--button-hover': 'var(--mantine-color-elevated-hover)'},
});
