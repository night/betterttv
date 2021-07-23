import React, {useState} from 'react';

export default function Preview({...restProps}) {
  const [emote, setEmote] = useState(null);

  if (!emote) return null;

  return (
    <div {...restProps}>
      <img alt={emote.name} src={emote.images['1x']} />
      <p>{emote.code}</p>
    </div>
  );
}
