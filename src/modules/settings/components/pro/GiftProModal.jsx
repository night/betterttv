import {Button, TextInput} from '@mantine/core';
import {modals} from '@mantine/modals';
import {ChevronRight} from 'lucide-react';
import React, {useCallback, useState} from 'react';
import {openModal} from '@/common/utils/modal';
import {ExternalLinks} from '@/constants';
import formatMessage from '@/i18n/index';
import styles from './GiftProModal.module.css';

const USERNAME_PLACEHOLDER = formatMessage({defaultMessage: 'Twitch username'});
const INPUT_CLASS_NAMES = {input: styles.input};

// how the name reads in a Twitch URL, however it was pasted in
function normalizeUsername(username) {
  return username.trim().replace(/^@/, '').toLowerCase();
}

function GiftProForm({onClose}) {
  const [username, setUsername] = useState('');
  const recipient = normalizeUsername(username);

  const handleChange = useCallback(({currentTarget}) => setUsername(currentTarget.value), []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (recipient === '') {
        return;
      }

      window.open(`${ExternalLinks.PRO}?gift=${encodeURIComponent(recipient)}`, '_blank', 'noopener,noreferrer');
      onClose();
    },
    [recipient, onClose]
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.body}>
        <TextInput
          data-autofocus
          size="lg"
          classNames={INPUT_CLASS_NAMES}
          aria-label={USERNAME_PLACEHOLDER}
          leftSection="@"
          placeholder={USERNAME_PLACEHOLDER}
          value={username}
          onChange={handleChange}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <div className={styles.actions}>
        <Button size="lg" onClick={onClose}>
          {formatMessage({defaultMessage: 'Cancel'})}
        </Button>
        <Button
          type="submit"
          size="lg"
          color="contrast"
          disabled={recipient === ''}
          rightSection={<ChevronRight size={16} />}>
          {formatMessage({defaultMessage: 'Continue'})}
        </Button>
      </div>
    </form>
  );
}

export default function openGiftProModal() {
  function handleClose() {
    modals.close(modalId);
  }

  const modalId = openModal({
    title: formatMessage({defaultMessage: 'Gift Pro'}),
    // the website's width for forms; rem so it isn't scaled, on Twitch's 10px root
    size: '48rem',
    description: <GiftProForm onClose={handleClose} />,
  });
  return modalId;
}
