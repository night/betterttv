// Hugeicons Pro (solid rounded) icon set. This is the default icon source.
//
// At build time, if the `@hugeicons-pro/core-solid-rounded` optional dependency is not
// installed (e.g. a contributor without a Pro license, or CI without the registry token),
// webpack swaps this module for ./index.fontawesome.js via NormalModuleReplacementPlugin.
// Both modules expose the same exports, so the rest of the codebase is source-agnostic.
//
// Exports keep the `fa*` names the codebase already used to minimize churn; each maps to
// the closest Hugeicons solid equivalent.
//
// The Pro package is an optional dependency, so it may be unresolved at lint/build time (e.g.
// CI without the registry token); webpack swaps this module for the Font Awesome fallback then.
import {
  Airplane01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowTurnBackwardIcon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
  BasketballIcon,
  BotIcon,
  BubbleChatIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Compass01Icon,
  CrownIcon,
  Delete02Icon,
  DiamondIcon,
  FavouriteIcon,
  Flag02Icon,
  GiftIcon,
  GraduationScrollIcon,
  GridIcon,
  HeartbreakIcon,
  HighlighterIcon,
  IceCream01Icon,
  Idea01Icon,
  IncognitoIcon,
  KeyboardIcon,
  Layout01Icon,
  Leaf01Icon,
  LiveStreaming01Icon,
  LockIcon,
  Mail01Icon,
  Menu01Icon,
  MessageCancel01Icon,
  Package01Icon,
  PaintBoardIcon,
  PaintBrush01Icon,
  PlayCircleIcon,
  Settings01Icon,
  ShieldIcon,
  SidebarLeftIcon,
  SmileIcon,
  SparklesIcon,
  SplitIcon,
  SquareUnlock01Icon,
  StarIcon,
  TwitchIcon,
  UnavailableIcon,
  UserGroupIcon,
  UserIcon,
  UserSettings01Icon,
  VideoIcon,
  WinkIcon,
  YoutubeIcon,
  // eslint-disable-next-line import/no-unresolved
} from '@hugeicons-pro/core-solid-rounded';

export const faLock = LockIcon;
export const faUnlock = SquareUnlock01Icon;
export const faArrowUp = ArrowUp01Icon;
export const faArrowDown = ArrowDown01Icon;
export const faArrowTurnDown = ArrowTurnBackwardIcon;
export const faArrowLeft = ArrowLeft01Icon;
export const faTrash = Delete02Icon;
export const faCog = Settings01Icon;
export const faScroll = GraduationScrollIcon;
export const faUser = UserIcon;
export const faUserGear = UserSettings01Icon;
export const faClose = Cancel01Icon;
export const faPaintBrush = PaintBrush01Icon;
export const faCheckCircle = CheckmarkCircle02Icon;
export const faBars = Menu01Icon;
export const faStar = StarIcon;
export const faSmileWink = WinkIcon;
export const faLeaf = Leaf01Icon;
export const faIceCream = IceCream01Icon;
export const faBasketballBall = BasketballIcon;
export const faPlane = Airplane01Icon;
export const faBox = Package01Icon;
export const faHeart = FavouriteIcon;
export const faHeartBroken = HeartbreakIcon;
export const faFlag = Flag02Icon;
export const faClock = Clock01Icon;
export const faLightbulb = Idea01Icon;
export const faTwitch = TwitchIcon;
export const faYoutube = YoutubeIcon;

// Per-setting icons used by the settings side navigation.
export const faFaceSmile = SmileIcon;
export const faPalette = PaintBoardIcon;
export const faBorderAll = GridIcon;
export const faWandMagicSparkles = SparklesIcon;
export const faTowerBroadcast = LiveStreaming01Icon;
export const faEnvelope = Mail01Icon;
export const faKeyboard = KeyboardIcon;
export const faTableColumns = SplitIcon;
export const faComment = BubbleChatIcon;
export const faList = SidebarLeftIcon;
export const faGem = DiamondIcon;
export const faUsers = UserGroupIcon;
export const faCrown = CrownIcon;
export const faCompass = Compass01Icon;
export const faVideo = VideoIcon;
export const faShieldHalved = ShieldIcon;
export const faHighlighter = HighlighterIcon;
export const faCommentSlash = MessageCancel01Icon;
export const faTableCells = Layout01Icon;
export const faBan = UnavailableIcon;
export const faArrowsUpDown = ArrowUpDownIcon;
export const faUserSecret = IncognitoIcon;
export const faCirclePlay = PlayCircleIcon;
export const faGift = GiftIcon;
export const faRobot = BotIcon;
