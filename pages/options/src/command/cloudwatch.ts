import { cloudwatchItemStorage, type CloudwatchLogItem } from '@extension/storage';
import type { GetCommandPreviewFunction, ProcessCommandFunction } from './command';

export const getCloudwatchCommandPreview: GetCommandPreviewFunction = (command, jsonData) => {
  if (command.action === 'clear') {
    return { header: 'cloudwatch', description: 'clear all items', isProcessable: true };
  }

  if (command.action === 'import') {
    if (command.type === 'clean') {
      return {
        header: 'cloudwatch',
        description: `clean and import ${jsonData.data.length} items`,
        isProcessable: true,
      };
    }

    return { header: 'cloudwatch', description: `append ${jsonData.data.length} items`, isProcessable: true };
  }

  return { header: 'cloudwatch', description: 'unavailable commandx', isProcessable: false };
};

const clearAllItems = () => {
  cloudwatchItemStorage.clear();
};

const appendItems = (items: CloudwatchLogItem[]) => {
  cloudwatchItemStorage.add(items);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const processCloudwatchCommand: ProcessCommandFunction = (command, jsonData) => {
  try {
    const data = jsonData.data as CloudwatchLogItem[];
    if (command.action === 'clear') {
      clearAllItems();

      return true;
    }

    if (command.action === 'import') {
      if (command.type === 'clean') {
        clearAllItems();
        appendItems(data);

        return true;
      }

      appendItems(data);
      return true;
    }

    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};
