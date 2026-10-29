import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

function copyFolder(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyFolder(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getSourcesDirs(root: string) {
  const srcDataLectures = path.resolve(root, 'src/data/lectures');
  const srcDataRR = path.resolve(root, 'src/data/RR');
  const srcDataExams = path.resolve(root, 'src/data/exams');
  const srcDataExamsClean = path.resolve(root, 'src/data/exams_clean');
  const rootDataLectures = path.resolve(root, 'data/lectures');
  const rootDataRR = path.resolve(root, 'data/RR');
  const rootDataExams = path.resolve(root, 'data/exams');
  const rootDataExamsClean = path.resolve(root, 'data/exams_clean');

  const lecturesDir = fs.existsSync(srcDataLectures)
    ? srcDataLectures
    : fs.existsSync(rootDataLectures)
      ? rootDataLectures
      : null;

  const rrDir = fs.existsSync(srcDataRR)
    ? srcDataRR
    : fs.existsSync(rootDataRR)
      ? rootDataRR
      : null;

  const examsDir = fs.existsSync(srcDataExams)
    ? srcDataExams
    : fs.existsSync(srcDataExamsClean)
      ? srcDataExamsClean
      : fs.existsSync(rootDataExams)
        ? rootDataExams
        : fs.existsSync(rootDataExamsClean)
          ? rootDataExamsClean
          : null;

  return { lecturesDir, rrDir, examsDir };
}

function sourcesPlugin(): Plugin {
  return {
    name: 'sources-plugin',
    // Dev server middleware: serves PDFs directly from data folders without duplication
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        const urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
        const { lecturesDir, rrDir, examsDir } = getSourcesDirs(server.config.root);

        // 1. Lecture routes: /lectures/*
        if (urlPath.startsWith('/lectures/') && lecturesDir) {
          const fileName = urlPath.replace(/^\/lectures\//, '');
          let targetFile = path.join(lecturesDir, fileName);
          if (!fs.existsSync(targetFile)) {
            // Fallback to lectures.pdf if specific deck is not found
            targetFile = path.join(lecturesDir, 'lectures.pdf');
          }
          if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
            fs.createReadStream(targetFile).pipe(res);
            return;
          }
        }

        // 2. RR routes: /RR/* or legacy /Recommended_Readings/*
        if ((urlPath.startsWith('/RR/') || urlPath.startsWith('/Recommended_Readings/')) && rrDir) {
          const fileName = urlPath.replace(/^\/(RR|Recommended_Readings)\//, '');
          const targetFile = path.join(rrDir, fileName);
          if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
            fs.createReadStream(targetFile).pipe(res);
            return;
          }
        }

        // 3. Exams paper routes: /exams/* or legacy /exams_clean/*
        if ((urlPath.startsWith('/exams/') || urlPath.startsWith('/exams_clean/')) && examsDir) {
          const fileName = urlPath.replace(/^\/(exams|exams_clean)\//, '');
          const targetFile = path.join(examsDir, fileName);
          if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
            fs.createReadStream(targetFile).pipe(res);
            return;
          }
        }

        // 4. Legacy /sources/... routes fallback
        if (urlPath.startsWith('/sources/')) {
          const subPath = urlPath.replace(/^\/sources\//, '');
          if (subPath.startsWith('Recommended_Readings/') || subPath.startsWith('RR/')) {
            const fileName = subPath.replace(/^(Recommended_Readings|RR)\//i, '');
            if (rrDir) {
              const target = path.join(rrDir, fileName);
              if (fs.existsSync(target)) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'inline');
                fs.createReadStream(target).pipe(res);
                return;
              }
            }
          } else if (lecturesDir) {
            const fileName = subPath.replace(/^lectures\//i, '');
            let target = path.join(lecturesDir, fileName);
            if (!fs.existsSync(target)) target = path.join(lecturesDir, 'lectures.pdf');
            if (fs.existsSync(target)) {
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'inline');
              fs.createReadStream(target).pipe(res);
              return;
            }
          }
        }

        next();
      });
    },

    // Production build hook: copy source folders ONCE into dist/ without any duplication
    closeBundle() {
      const root = process.cwd();
      const distDir = path.resolve(root, 'dist');
      const { lecturesDir, rrDir, examsDir } = getSourcesDirs(root);

      let lectureCount = 0;
      let rrCount = 0;
      let examsCount = 0;

      // Copy lectures once: src/data/lectures -> dist/lectures
      if (lecturesDir && fs.existsSync(lecturesDir)) {
        const destLectures = path.resolve(distDir, 'lectures');
        copyFolder(lecturesDir, destLectures);
        lectureCount = fs.readdirSync(destLectures).filter((f) => f.toLowerCase().endsWith('.pdf')).length;
      }

      // Copy RR once: src/data/RR -> dist/RR
      if (rrDir && fs.existsSync(rrDir)) {
        const destRR = path.resolve(distDir, 'RR');
        copyFolder(rrDir, destRR);
        rrCount = fs.readdirSync(destRR).filter((f) => f.toLowerCase().endsWith('.pdf')).length;
      }

      // Copy exams once: src/data/exams -> dist/exams
      if (examsDir && fs.existsSync(examsDir)) {
        const destExams = path.resolve(distDir, 'exams');
        copyFolder(examsDir, destExams);
        examsCount = fs.readdirSync(destExams).filter((f) => f.toLowerCase().endsWith('.pdf')).length;
      }

      console.log(`[sources-plugin] Copied sources cleanly to dist: ${lectureCount} lecture(s) -> dist/lectures, ${rrCount} reading(s) -> dist/RR, ${examsCount} exam paper(s) -> dist/exams (0 duplicate files)`);
    },
  };
}

export default defineConfig(() => {
  const { lecturesDir } = getSourcesDirs(path.resolve(__dirname));
  const lectureFiles =
    lecturesDir && fs.existsSync(lecturesDir)
      ? fs.readdirSync(lecturesDir).filter((f) => f.toLowerCase().endsWith('.pdf'))
      : [];

  return {
    define: {
      __LECTURE_FILES__: JSON.stringify(lectureFiles),
    },
    plugins: [react(), tailwindcss(), viteSingleFile(), sourcesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      allowedHosts: true,
    },
  };
});
