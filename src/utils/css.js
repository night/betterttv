export function variablesToCSS(selector, variables, important = false) {
  const lines = Object.entries(variables).map(([k, v]) => `${k}: ${v}${important ? ' !important' : ''};`);
  return `${selector} { ${lines.join('\n')} }`;
}
