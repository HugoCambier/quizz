import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

// jsdom has no modal dialogs yet.
HTMLDialogElement.prototype.showModal = function showModal(
  this: HTMLDialogElement,
) {
  this.open = true;
};
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  this.open = false;
  this.dispatchEvent(new Event("close"));
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.location.hash = "";
});
