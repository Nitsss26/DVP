import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    allowedHosts: [
      'credentialverification-bu.in',
      'www.credentialverification-bu.in'
    ],
    hmr: {
      clientPort: 8080
    }
  },
  // Add this section because your systemd uses 'npm run preview'
  preview: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    allowedHosts: [
      'credentialverification-bu.in',
      'www.credentialverification-bu.in'
    ]
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));