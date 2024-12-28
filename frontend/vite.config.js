import { defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
      },
    },
  },
  define: {
    // Định nghĩa biến `process.env` giả lập
    'process.env': {},
  },
  resolve: {
    alias: {
      // Thêm alias cho process nếu cần
      process: 'process/browser',
    },
  },
});
