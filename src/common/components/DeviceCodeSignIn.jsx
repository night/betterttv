import {Anchor, Button, Loader, Text, UnstyledButton} from '@mantine/core';
import {useClipboard} from '@mantine/hooks';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import formatMessage from '@/i18n/index';
import {pollDeviceCodeAndSetCredentials} from '@/utils/auth';
import HTTPError from '@/utils/http-error';
import {requestDeviceCode} from '@/utils/oauth';
import styles from './DeviceCodeSignIn.module.css';

const Status = {
  LOADING: 'loading',
  PENDING: 'pending',
  EXPIRED: 'expired',
  DENIED: 'denied',
  ERROR: 'error',
};

function getErrorStatus(error) {
  const errorCode = error instanceof HTTPError ? error.data?.error : null;

  if (errorCode === 'expired_token') {
    return Status.EXPIRED;
  }

  if (errorCode === 'access_denied') {
    return Status.DENIED;
  }

  return Status.ERROR;
}

function getErrorMessage(status) {
  switch (status) {
    case Status.EXPIRED:
      return formatMessage({defaultMessage: 'Your sign in code expired.'});
    case Status.DENIED:
      return formatMessage({defaultMessage: 'Sign in was denied.'});
    default:
      return formatMessage({defaultMessage: 'Something went wrong while signing in.'});
  }
}

function Code({code, onClick}) {
  return (
    <UnstyledButton className={styles.code} aria-label={code} onClick={onClick}>
      {Array.from(code).map((character, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- a code repeats letters and never reorders
        <span key={index} className={character === '-' ? styles.codeSeparator : styles.codeCharacter}>
          {character}
        </span>
      ))}
    </UnstyledButton>
  );
}

function DeviceCodeSignIn({onSignIn, onCancel}) {
  const [state, setState] = useState({status: Status.LOADING, deviceCode: null});
  const {status, deviceCode} = state;
  const controllerRef = useRef(null);
  const {copied, copy} = useClipboard();
  const handleCopy = useCallback(() => copy(deviceCode?.user_code), [copy, deviceCode]);

  const start = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const {signal} = controller;

    setState({status: Status.LOADING, deviceCode: null});

    try {
      const newDeviceCode = await requestDeviceCode({signal});
      setState({status: Status.PENDING, deviceCode: newDeviceCode});
      await pollDeviceCodeAndSetCredentials({
        signal,
        deviceCode: newDeviceCode.device_code,
        interval: newDeviceCode.interval,
      });
      onSignIn();
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      setState({status: getErrorStatus(error), deviceCode: null});
    }
  }, [onSignIn]);

  useEffect(() => {
    start();
    return () => controllerRef.current?.abort();
  }, [start]);

  if (status === Status.LOADING) {
    return (
      <div className={styles.status}>
        <Loader size="md" />
      </div>
    );
  }

  if (status !== Status.PENDING) {
    return (
      <div className={styles.status}>
        <Text size="lg">{getErrorMessage(status)}</Text>
        <Button size="lg" variant="elevated" color="contrast" onClick={start}>
          {formatMessage({defaultMessage: 'Try Again'})}
        </Button>
      </div>
    );
  }

  const verificationUrl = new URL(deviceCode.verification_uri);

  return (
    <React.Fragment>
      <div className={styles.body}>
        <Code code={deviceCode.user_code} onClick={handleCopy} />
        <Text size="lg">
          {formatMessage(
            {defaultMessage: 'Enter this code at <link>{url}</link>'},
            {
              url: `${verificationUrl.host}${verificationUrl.pathname}`,
              link: (string) => (
                <Anchor key="verificationLink" href={verificationUrl.href} target="_blank" rel="noreferrer">
                  {string}
                </Anchor>
              ),
            }
          )}
        </Text>
      </div>
      <div className={styles.footer}>
        <Button size="lg" variant="elevated" onClick={onCancel}>
          {formatMessage({defaultMessage: 'Cancel'})}
        </Button>
        <Button size="lg" variant="elevated" color="contrast" onClick={handleCopy}>
          {copied ? formatMessage({defaultMessage: 'Copied'}) : formatMessage({defaultMessage: 'Copy'})}
        </Button>
      </div>
    </React.Fragment>
  );
}

export default DeviceCodeSignIn;
