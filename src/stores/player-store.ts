"use client";

import { create } from "zustand";

import { getDefaultLayoutId, getLayout, getUsableLayouts } from "@/config/layouts";
import {
  assignStreamToSlot,
  buildSlots,
  firstAssignedStream,
  swapSlots as swapSlotValues,
} from "@/lib/player/slots";
import type { ChatTab, LayoutId, PlayerLayoutState } from "@/types/layout";

export const DEFAULT_VOLUME = 0.6;

interface PlayerState extends PlayerLayoutState {
  /** IDs aller aktuell wählbaren Streams (aus der Config). */
  availableIds: string[];
  /** Index des maximierten Slots; null = Grid-Ansicht. */
  maximizedSlot: number | null;
  /** Layout vor dem Maximieren, für die Rückkehr. */
  layoutBeforeMaximize: LayoutId | null;
  /** Wurde der Zustand aus Server bzw. localStorage übernommen? */
  hydrated: boolean;
}

interface PlayerActions {
  initialize(input: {
    availableIds: string[];
    state?: Partial<PlayerLayoutState> | null;
  }): void;
  setLayout(layoutId: LayoutId): void;
  assignStream(slotIndex: number, streamId: string | null): void;
  swapSlots(a: number, b: number): void;
  focusStream(streamId: string): void;
  toggleMute(streamId: string): void;
  setVolume(streamId: string, volume: number): void;
  maximizeSlot(slotIndex: number): void;
  restoreLayout(): void;
  setChatVisible(visible: boolean): void;
  setChatTab(tab: ChatTab): void;
  setTheaterMode(active: boolean): void;
  reset(): void;
}

export type PlayerStore = PlayerState & PlayerActions;

const initialState: PlayerState = {
  layoutId: "quad",
  slots: [],
  focusedStreamId: null,
  volumes: {},
  muted: {},
  chatVisible: true,
  chatTab: "twitch",
  theaterMode: false,
  availableIds: [],
  maximizedSlot: null,
  layoutBeforeMaximize: null,
  hydrated: false,
};

/**
 * Client-State des Players. Hält ausschließlich serialisierbare Werte —
 * Player-Instanzen leben in Refs (docs/08-multistream-player.md, Abschnitt 4).
 */
export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  ...initialState,

  initialize({ availableIds, state }) {
    // Gespeichertes Layout nur übernehmen, wenn es zur aktuellen
    // Fahrerzahl passt — die Config kann sich seit dem letzten Besuch
    // geändert haben.
    const usable = getUsableLayouts(availableIds.length);
    const stored = state?.layoutId;
    const layoutId =
      stored && usable.some((preset) => preset.id === stored)
        ? stored
        : getDefaultLayoutId(availableIds.length);
    const preset = getLayout(layoutId);
    const slots = buildSlots(preset.slots, state?.slots ?? [], availableIds);
    const focused =
      state?.focusedStreamId && slots.includes(state.focusedStreamId)
        ? state.focusedStreamId
        : firstAssignedStream(slots);

    set({
      ...initialState,
      availableIds,
      layoutId,
      slots,
      focusedStreamId: focused,
      volumes: state?.volumes ?? {},
      muted: buildMuteMap(slots, focused),
      chatVisible: state?.chatVisible ?? true,
      chatTab: state?.chatTab ?? "twitch",
      theaterMode: state?.theaterMode ?? false,
      hydrated: true,
    });
  },

  setLayout(layoutId) {
    const { slots, availableIds, focusedStreamId } = get();
    const preset = getLayout(layoutId);
    const nextSlots = buildSlots(preset.slots, slots, availableIds);
    const focused =
      focusedStreamId && nextSlots.includes(focusedStreamId)
        ? focusedStreamId
        : firstAssignedStream(nextSlots);

    set({
      layoutId,
      slots: nextSlots,
      focusedStreamId: focused,
      muted: buildMuteMap(nextSlots, focused),
      maximizedSlot: null,
      layoutBeforeMaximize: null,
    });
  },

  assignStream(slotIndex, streamId) {
    const { slots, focusedStreamId } = get();
    const nextSlots = assignStreamToSlot(slots, slotIndex, streamId);
    const focused =
      focusedStreamId && nextSlots.includes(focusedStreamId)
        ? focusedStreamId
        : firstAssignedStream(nextSlots);

    set({
      slots: nextSlots,
      focusedStreamId: focused,
      muted: buildMuteMap(nextSlots, focused),
    });
  },

  swapSlots(a, b) {
    set({ slots: swapSlotValues(get().slots, a, b) });
  },

  focusStream(streamId) {
    const { slots } = get();

    if (!slots.includes(streamId)) return;

    // Genau ein Stream hat Ton: erst alles stumm, dann den neuen Fokus frei.
    set({ focusedStreamId: streamId, muted: buildMuteMap(slots, streamId) });
  },

  toggleMute(streamId) {
    const { muted, focusedStreamId, slots } = get();
    const isMuted = muted[streamId] ?? streamId !== focusedStreamId;

    if (isMuted) {
      // Ton aktivieren heißt: dieser Stream wird der Fokus-Stream.
      set({ focusedStreamId: streamId, muted: buildMuteMap(slots, streamId) });

      return;
    }

    set({ muted: { ...muted, [streamId]: true } });
  },

  setVolume(streamId, volume) {
    const clamped = Math.min(1, Math.max(0, volume));

    set({ volumes: { ...get().volumes, [streamId]: clamped } });
  },

  maximizeSlot(slotIndex) {
    const { slots, layoutId, maximizedSlot } = get();
    const streamId = slots[slotIndex] ?? null;

    if (!streamId) return;
    if (maximizedSlot === slotIndex) {
      get().restoreLayout();

      return;
    }

    set({
      maximizedSlot: slotIndex,
      layoutBeforeMaximize: layoutId,
      focusedStreamId: streamId,
      muted: buildMuteMap(slots, streamId),
    });
  },

  restoreLayout() {
    set({ maximizedSlot: null, layoutBeforeMaximize: null });
  },

  setChatVisible(visible) {
    set({ chatVisible: visible });
  },

  setChatTab(tab) {
    set({ chatTab: tab });
  },

  setTheaterMode(active) {
    set({ theaterMode: active });
  },

  reset() {
    const { availableIds } = get();

    get().initialize({ availableIds, state: null });
  },
}));

/** Alle Streams stumm außer dem Fokus-Stream. */
function buildMuteMap(
  slots: (string | null)[],
  focusedStreamId: string | null,
): Record<string, boolean> {
  const map: Record<string, boolean> = {};

  for (const slot of slots) {
    if (slot) map[slot] = slot !== focusedStreamId;
  }

  return map;
}

/** Serialisierbarer Teil des Zustands — für Persistenz. */
export function selectPersistable(state: PlayerStore): PlayerLayoutState {
  return {
    layoutId: state.layoutId,
    slots: state.slots,
    focusedStreamId: state.focusedStreamId,
    volumes: state.volumes,
    muted: state.muted,
    chatVisible: state.chatVisible,
    chatTab: state.chatTab,
    theaterMode: state.theaterMode,
  };
}

/** Lautstärke eines Streams mit Standardwert. */
export function selectVolume(state: PlayerStore, streamId: string): number {
  return state.volumes[streamId] ?? DEFAULT_VOLUME;
}

/** Stummschaltung eines Streams; Standard: alles außer Fokus ist stumm. */
export function selectMuted(state: PlayerStore, streamId: string): boolean {
  return state.muted[streamId] ?? streamId !== state.focusedStreamId;
}
