const svgoConfig = {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // レスポンシブ崩れ防止
          removeViewBox: false,
        },
      },
    },
  ],
};

export default svgoConfig;
