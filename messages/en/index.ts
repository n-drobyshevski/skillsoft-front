/**
 * English locale message aggregator
 *
 * Imports all per-namespace JSON files and merges them into a single
 * messages object. This maintains backward compatibility with the
 * monolithic en.json while enabling per-namespace code splitting.
 */
import common from './common.json';
import navigation from './navigation.json';
import auth from './auth.json';
import validation from './validation.json';
import errors from './errors.json';
import status from './status.json';
import assessment from './assessment.json';
import likert from './likert.json';
import frequency from './frequency.json';
import competency from './competency.json';
import indicator from './indicator.json';
import question from './question.json';
import forms from './forms.json';
import template from './template.json';
import candidate from './candidate.json';
import results from './results.json';
import dashboard from './dashboard.json';
import table from './table.json';
import filter from './filter.json';
import sort from './sort.json';
import time from './time.json';
import confirm from './confirm.json';
import empty from './empty.json';
import settings from './settings.json';
import language from './language.json';
import feedback from './feedback.json';
import validationGuidance from './validationGuidance.json';
import myTests from './myTests.json';
import psychometrics from './psychometrics.json';
import enums from './enums.json';
import help from './help.json';
import metadata from './metadata.json';
import shared from './shared.json';
import users from './users.json';
import teams from './teams.json';
import activity from './activity.json';
import lens from './lens.json';
import profile from './profile.json';
import anonymousTest from './anonymousTest.json';
import landing from './landing.json';
import accessibility from './accessibility.json';
import builder from './builder.json';
import skillMapper from './skillMapper.json';

const messages = {
  common,
  navigation,
  auth,
  validation,
  errors,
  status,
  assessment,
  likert,
  frequency,
  competency,
  indicator,
  question,
  forms,
  template,
  candidate,
  results,
  dashboard,
  table,
  filter,
  sort,
  time,
  confirm,
  empty,
  settings,
  language,
  feedback,
  validationGuidance,
  myTests,
  psychometrics,
  enums,
  help,
  metadata,
  shared,
  users,
  teams,
  activity,
  lens,
  profile,
  anonymousTest,
  landing,
  accessibility,
  builder,
  skillMapper,
} as const;

export default messages;
