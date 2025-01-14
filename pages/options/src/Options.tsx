/* eslint-disable tailwindcss/no-custom-classname */
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { useState } from 'react';
import type { CommandInfo } from './command';
import { getCloudwatchCommandPreview, processCloudwatchCommand } from './command';

const Options = () => {
  const [commandHeader, setCommandHeader] = useState<string>('');
  const [commandDesc, setCommandDesc] = useState<string>('');
  const [commandInfo, setCommandInfo] = useState<CommandInfo>();
  const [commandData, setCommandData] = useState();
  const [isProcessable, setIsProcessable] = useState<boolean>(false);

  const clear = () => {
    setCommandHeader('');
    setCommandDesc('');
    setCommandInfo(undefined);
    setCommandData(undefined);
    setIsProcessable(false);

    const fileInput = document.getElementById('file_input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async e => {
      const content = e.target?.result as string;
      const commandJsonData = JSON.parse(content);

      if (!commandJsonData.command) {
        setCommandHeader('unknown command');
        setCommandDesc('');
        setIsProcessable(false);
        return;
      }

      const commandStr = commandJsonData.command;

      const [commandType = '', commandAction = '', commandDetail = ''] = commandStr.split(':');

      const _commandInfo: CommandInfo = {
        type: commandType,
        action: commandAction,
        detail: commandDetail,
      };

      setCommandInfo(_commandInfo);

      // TODO: update to SOLID
      if (commandType === 'cloudwatch') {
        const preview = getCloudwatchCommandPreview(_commandInfo, commandJsonData);
        console.log(preview);
        setCommandHeader(preview.header);
        setCommandDesc(preview.description);
        setIsProcessable(preview.isProcessable);
        setCommandData(commandJsonData);

        return;
      }

      setCommandHeader(commandType);
      setCommandDesc('unavailable command');
      setIsProcessable(false);

      return;
    };

    reader.readAsText(file);
  };

  const onProcess = () => {
    console.log({
      commandInfo,
      commandData,
    });
    if (!commandInfo || !commandInfo.type) {
      return;
    }

    if (commandInfo.type === 'cloudwatch') {
      const result = processCloudwatchCommand(commandInfo, commandData);
      if (result) {
        alert('Success');
        clear();

        return;
      }

      alert('Failed');
      clear();

      return;
    }
  };

  return (
    <div className="flex size-full h-svh flex-col items-center justify-center">
      <div className="w-128">
        <label className="mb-2 block text-sm font-medium" htmlFor="file_input">
          Upload command file
        </label>
        <input
          className="block w-full cursor-pointer border border-gray-300 text-sm "
          id="file_input"
          type="file"
          accept=".json"
          onChange={onFileChange}
        />
      </div>

      {commandHeader && (
        <>
          <div className="mt-4">
            <div className="flex flex-col items-center justify-center text-lg">
              <b className="uppercase">{commandHeader}</b>
              <span>{commandDesc}</span>
            </div>
          </div>

          {isProcessable && (
            <button
              className="mt-4 rounded border border-orange-500 bg-white px-4 py-2 font-bold text-orange-500 hover:cursor-pointer hover:bg-orange-700 hover:text-white"
              onClick={onProcess}>
              PROCESS
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div> Loading ... </div>), <div> Error Occur </div>);
