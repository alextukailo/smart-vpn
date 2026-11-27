import { type IpcMainInvokeEvent } from 'electron';

let trustedWebContentsId: number | null = null;
let trustedRendererUrl: string | null = null;

export const setTrustedRenderer = (
  webContentsId: number,
  rendererUrl: string,
): void => {
  trustedWebContentsId = webContentsId;
  trustedRendererUrl = new URL(rendererUrl).href;
};

export const clearTrustedRenderer = (): void => {
  trustedWebContentsId = null;
  trustedRendererUrl = null;
};

export const validateSender = (
  event: IpcMainInvokeEvent,
): void => {
  const frame = event.senderFrame;

  if (
    !frame ||
    trustedWebContentsId === null ||
    trustedRendererUrl === null ||
    event.sender.id !== trustedWebContentsId ||
    frame !== event.sender.mainFrame
  ) {
    throw new Error('Unauthorized IPC sender');
  }

  if (frame.url !== trustedRendererUrl) {
    throw new Error('Unauthorized renderer URL');
  }
};
