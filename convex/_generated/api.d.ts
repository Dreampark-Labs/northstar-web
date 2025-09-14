/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as assignments from "../assignments.js";
import type * as courseDetails from "../courseDetails.js";
import type * as courses from "../courses.js";
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as lib_pii from "../lib/pii.js";
import type * as lib_privacy from "../lib/privacy.js";
import type * as lib_users from "../lib/users.js";
import type * as lib_validation from "../lib/validation.js";
import type * as migrate from "../migrate.js";
import type * as seed from "../seed.js";
import type * as terms from "../terms.js";
import type * as userClassMetrics from "../userClassMetrics.js";
import type * as userSettings from "../userSettings.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  assignments: typeof assignments;
  courseDetails: typeof courseDetails;
  courses: typeof courses;
  events: typeof events;
  files: typeof files;
  "lib/pii": typeof lib_pii;
  "lib/privacy": typeof lib_privacy;
  "lib/users": typeof lib_users;
  "lib/validation": typeof lib_validation;
  migrate: typeof migrate;
  seed: typeof seed;
  terms: typeof terms;
  userClassMetrics: typeof userClassMetrics;
  userSettings: typeof userSettings;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
