"use client";

import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/** False during the server render and hydration, true once running on the client. */
export const useHydrated = () => useSyncExternalStore(subscribeNever, () => true, () => false);
