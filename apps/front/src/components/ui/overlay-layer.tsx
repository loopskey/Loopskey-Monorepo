"use client";

import { createContext, useContext } from "react";

import type { ReactNode } from "react";

export const OVERLAY_LAYER_CLASS = {
  applicationChrome: "z-30",
  navigationBackdrop: "z-40",
  navigation: "z-50",
  floating: "z-[60]",
  modalBackdrop: "z-[80]",
  modal: "z-[90]",
  modalFloating: "z-[100]",
} as const;

const ModalLayerContext = createContext(false);

export const ModalLayerProvider = ({ children }: { children: ReactNode }) => (
  <ModalLayerContext.Provider value>{children}</ModalLayerContext.Provider>
);

export const useFloatingLayerClass = () =>
  useContext(ModalLayerContext)
    ? OVERLAY_LAYER_CLASS.modalFloating
    : OVERLAY_LAYER_CLASS.floating;
