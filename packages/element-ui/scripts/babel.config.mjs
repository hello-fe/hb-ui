
export default {
  presets: [
    ['@vue/app', {
      // 单文件组件需要依赖闭环
      useBuiltIns: false,
    }],
  ],
  plugins: [
    ['@babel/plugin-transform-typescript', { isTSX: true }],
  ],
}
