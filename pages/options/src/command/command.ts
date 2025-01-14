/* eslint-disable @typescript-eslint/no-explicit-any */
export type CommandInfo = {
  type: string;
  action: string;
  detail: string;
};

export type GetCommandPreviewFunction = (
  command: CommandInfo,
  jsonData: any,
) => { header: string; description: string; isProcessable: boolean };

export type ProcessCommandFunction = (command: CommandInfo, jsonData: any) => boolean;
