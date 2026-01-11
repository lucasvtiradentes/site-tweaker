import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'

export default [
  {
    input: 'src/background/worker.ts',
    output: {
      file: 'dist/worker.js',
      format: 'iife',
    },
    plugins: [
      typescript(),
      copy({
        targets: [
          { src: 'public/*', dest: 'dist' },
          { src: 'public/icons/*', dest: 'dist/icons' },
        ],
      }),
    ],
  },
  {
    input: 'src/popup/popup.ts',
    output: {
      file: 'dist/popup.js',
      format: 'iife',
    },
    plugins: [typescript()],
  },
  {
    input: 'src/editor/editor.ts',
    output: {
      file: 'dist/editor.js',
      format: 'iife',
    },
    plugins: [typescript()],
  },
  {
    input: 'src/content/floating-ui.ts',
    output: {
      file: 'dist/floating-ui.js',
      format: 'iife',
    },
    plugins: [typescript()],
  },
]
