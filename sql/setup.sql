CREATE DATABASE IF NOT EXISTS botdata;

-- money/currency

CREATE TABLE IF NOT EXISTS coins (
  serverid char(32) NOT NULL,
  userid char(32) NOT NULL,
  amount real
)

CREATE TABLE IF NOT EXISTS coinRewards (
  serverid char(32) NOT NULL,
  roleid char(32) NOT NULL,
  amount real
)

CREATE TABLE IF NOT EXISTS economyConfigs (
  serverid char(32) PRIMARY KEY,
  eco_name text,
  eco_on boolean DEFAULT FALSE,
  daily real,
  daily_on boolean DEFAULT FALSE,
  rewards_on boolean DEFAULT FALSE,
  chat real,
  chat_on boolean DEFAULT FALSE
)

-- custom commands

CREATE TABLE IF NOT EXISTS commands (
  serverid char(32) NOT NULL,
  name text,
  creator char(32),
  response text
)

-- detects

CREATE TABLE IF NOT EXISTS inviteFilters (
  serverid char(32) PRIMARY KEY,
  filter boolean DEFAULT FALSE
)

CREATE TABLE IF NOT EXISTS triggers (
  serverid char(32) NOT NULL,
  creatorid char(32),
  name text NOT NULL,
  response text,
  filters text[]
)

-- levels

CREATE TABLE IF NOT EXISTS levels (
  serverid char(32) NOT NULL,
  userid char(32) NOT NULL,
  xp float8 DEFAULT 0,
  level float8 DEFAULT 0,
  rewards_on boolean DEFAULT FALSE
)

CREATE TABLE IF NOT EXISTS levelRewards (
  serverid char(32) NOT NULL,
  roleid char(32) NOT NULL,
  level_earn smallint
)

-- moderation

CREATE TABLE IF NOT EXISTS mods (
  serverid char(32) PRIMARY KEY,
  moderator char(32),
  administrator char(32),
  logs char(32),
  latestCase integer
)

-- mutes

CREATE TABLE IF NOT EXISTS mutes (
  serverid char(32) PRIMARY KEY,
  muteRoleID char(32)
)

CREATE TABLE IF NOT EXISTS activeMutes (
  serverid char(32) NOT NULL,
  userid char(32) NOT NULL,
  timestamp char(100),
  permanent boolean DEFAULT FALSE
)

-- permissions

CREATE TABLE IF NOT EXISTS perms (
  serverid char(32) NOT NULL,
  id char(32) NOT NULL, -- user, channel or role id
  type char(10) NOT NULL,
  command text NOT NULL,
  is_custom boolean DEFAULT FALSE,
  extra text, -- 'subcommands'
  negated boolean DEFAULT FALSE
)

-- prefix

CREATE TABLE IF NOT EXISTS prefixes (
  serverid char(32) PRIMARY KEY,
  prefix text
)

-- punishments/cases

CREATE TABLE IF NOT EXISTS punishments (
  serverid char(32) NOT NULL,
  type char(50) NOT NULL,
  moderatorid char(32) NOT NULL,
  reason text,
  duration char(100),
  messageid char(32),
  case integer,
  thumbnail text,
  time timestamp DEFAULT now()::time
)

-- role-related stuff

CREATE TABLE IF NOT EXISTS autoroles (
  serverid char(32) NOT NULL,
  autoroleid char(32)
)

CREATE TABLE IF NOT EXISTS selfroles (
  serverid char(32) NOT NULL,
  selfroleid char(32),
  filters text[]
)

-- starboard

CREATE TABLE IF NOT EXISTS starboards (
  serverid char(32) PRIMARY KEY,
  channelid char(32),
  filters text[]
)

-- verification system

CREATE TABLE IF NOT EXISTS verifications (
  serverid char(32) PRIMARY KEY,
  channelid char(32) NOT NULL UNIQUE,
  roleid char(32) NOT NULL,
  message text,
  verif_on boolean DEFAULT FALSE
)

-- warns

CREATE TABLE IF NOT EXISTS warns (
  serverid char(32) NOT NULL,
  userid char(32) NOT NULL,
  warn text,
  moderatorid char(32),
  warnedat timestamp DEFAULT now()::time
)

CREATE TABLE IF NOT EXISTS warnSteps (
  serverid char(32) NOT NULL,
  amount integer NOT NULL,
  punishment text NOT NULL,
  duration char(100)
)

-- welcome/farewell messages

CREATE TABLE IF NOT EXISTS welcomes (
  serverid char(32) PRIMARY KEY,
  welcome text,
  welcome_channel char(32), -- id
  farewell text,
  farewell_channel char(32) -- also id
)
