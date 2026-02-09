/* eslint-disable */
/**
 * Generated server utilities — STUB FILE.
 *
 * Run `npx convex dev` to regenerate with full type safety.
 *
 * @module
 */

import type {
  QueryBuilder,
  MutationBuilder,
  ActionBuilder,
  HttpActionBuilder,
} from "convex/server";
import type { DataModel } from "./dataModel";

export const query = ((builder: any) => builder) as QueryBuilder<DataModel, "public">;
export const mutation = ((builder: any) => builder) as MutationBuilder<DataModel, "public">;
export const action = ((builder: any) => builder) as ActionBuilder<DataModel, "public">;
export const internalQuery = ((builder: any) => builder) as QueryBuilder<DataModel, "internal">;
export const internalMutation = ((builder: any) => builder) as MutationBuilder<DataModel, "internal">;
export const internalAction = ((builder: any) => builder) as ActionBuilder<DataModel, "internal">;
export const httpAction = ((builder: any) => builder) as HttpActionBuilder;
