export const SelfBotUserLevels = {
  EVERYONE: 0,
  VIP: 1,
  SUBSCRIBER: 2,
  MOD: 3,
};

function normalizeUserLevel(userLevel) {
  if (typeof userLevel === 'string' && /^\d+$/.test(userLevel.trim())) {
    return Number.parseInt(userLevel.trim(), 10);
  }

  if (typeof userLevel === 'number' && Object.values(SelfBotUserLevels).includes(userLevel)) {
    return userLevel;
  }

  return SelfBotUserLevels.EVERYONE;
}

export function computeSelfBotCommands(commandsMap) {
  const computed = [];

  if (commandsMap == null) {
    return computed;
  }

  for (const {command, response, userLevel} of Object.values(commandsMap)) {
    if (command == null || command.trim().length === 0) {
      continue;
    }

    if (response == null || response.trim().length === 0) {
      continue;
    }

    computed.push({
      command: command.trim(),
      response: response.trim(),
      userLevel: normalizeUserLevel(userLevel),
    });
  }

  return computed;
}

export function matchesUserLevel(userLevel, messageObj) {
  const level = normalizeUserLevel(userLevel);

  if (level === SelfBotUserLevels.EVERYONE) {
    return true;
  }

  const isMod = messageObj?.user?.userType === 'mod';
  const isSubscriber = messageObj?.user?.isSubscriber === true;
  const isVip = messageObj?.isVip === true;

  switch (level) {
    case SelfBotUserLevels.MOD:
      return isMod;
    case SelfBotUserLevels.VIP:
      return isVip || isMod;
    case SelfBotUserLevels.SUBSCRIBER:
      return isSubscriber || isVip || isMod;
    default:
      return true;
  }
}

export function matchesCommand({command}, messageText) {
  if (messageText == null) {
    return false;
  }

  const normalizedMessage = messageText.trim();
  const normalizedCommand = command.toLowerCase();
  const lowerMessage = normalizedMessage.toLowerCase();

  return lowerMessage === normalizedCommand || lowerMessage.startsWith(`${normalizedCommand} `);
}
