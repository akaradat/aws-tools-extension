import type { Config } from 'tailwindcss/types/config';

export default {
  theme: {
    extend: {
      width: {
        '128': '32rem',
      },
      height: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
} as Omit<Config, 'content'>;
