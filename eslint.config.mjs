import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  rules: {
    'jsdoc/no-defaults': 'off',
    'node/prefer-global/process': 'off',
  },
})
