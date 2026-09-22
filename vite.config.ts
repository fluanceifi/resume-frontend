import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // 브라우저 PDF 뷰어는 URL 파일명을 제목으로 노출하므로,
        // 출력 파일명을 portfolio-[hash].pdf 로 정규화한다. (해시는 캐시 무효화용)
        assetFileNames: (info) => {
          const name = info.names?.[0] ?? info.name ?? ''
          if (/portfolio.*\.pdf$/i.test(name)) return 'assets/portfolio-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
