const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);


  if (req.method === "POST" && url.pathname === "/api/cover") {
    try {
      const data = await readBody(req);
      const hasFile = Boolean(data.fileName);
      const hasUrl = Boolean(String(data.sourceUrl || "").trim());
      if (!hasFile && !hasUrl) {
        return sendJson(res, 400, { error: "Bir ses dosyası veya desteklenen kaynak bağlantısı ekle." });
      }
      if (!data.rightsConfirmed) {
        return sendJson(res, 400, { error: "Devam etmek için içeriği kullanma iznine sahip olduğunu doğrulamalısın." });
      }
      if (!process.env.MUSIC_API_URL || !process.env.MUSIC_API_KEY) {
        return sendJson(res, 503, {
          error: "AI cover servisi henüz bağlanmadı.",
          code: "COVER_PROVIDER_NOT_CONFIGURED",
          message: "Cover ekranı hazır. Melodi ve sözleri koruyarak yeniden düzenleme yapabilen, gerekli lisanslara uygun bir AI sağlayıcısı bağlanmalı."
        });
      }
      return sendJson(res, 501, {
        error: "Cover sağlayıcısının entegrasyonu henüz uygulanmadı.",
        code: "COVER_PROVIDER_ADAPTER_PENDING"
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "İstek okunamadı." });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, {
      ok: true,
      app: "Reuvra Music",
      generationProviderConfigured: Boolean(process.env.MUSIC_API_URL && process.env.MUSIC_API_KEY)
    });
  }

  if (req.method === "POST" && url.pathname === "/api/generate") {
    try {
      const data = await readBody(req);
      const prompt = String(data.prompt || "").trim();
      if (!prompt) {
        return sendJson(res, 400, { error: "Lütfen şarkı açıklamasını yaz." });
      }

      // Provider integration will be added after choosing the music-generation API.
      if (!process.env.MUSIC_API_URL || !process.env.MUSIC_API_KEY) {
        return sendJson(res, 503, {
          error: "AI müzik servisi henüz bağlanmadı.",
          code: "MUSIC_PROVIDER_NOT_CONFIGURED",
          message: "Arayüz ve sunucu hazır. Gerçek şarkı üretimi için bir müzik üretim API bağlantısı gerekiyor."
        });
      }

      return sendJson(res, 501, {
        error: "Seçilen müzik sağlayıcısının bağlantısı henüz uygulanmadı.",
        code: "PROVIDER_ADAPTER_PENDING"
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "İstek okunamadı." });
    }
  }

  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(safePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Dosya bulunamadı.");
    }
    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(safePath)] || "application/octet-stream"
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Reuvra Music çalışıyor: http://localhost:${PORT}`);
});
