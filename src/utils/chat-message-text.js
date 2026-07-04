export function messageTextFromAST(ast) {
  return ast
    .map((node) => {
      switch (node.type) {
        case 0: // Text
          return node.content.trim();
        case 3: // CurrentUserHighlight
          return `@${node.content}`;
        case 4: // Mention
          return `@${node.content.recipient}`;
        case 5: // Link
          return node.content.url;
        case 6: // Emote
          return node.content.alt;
        default:
          return '';
      }
    })
    .join(' ');
}
