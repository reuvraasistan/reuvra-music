const form = document.getElementById("musicForm");
const promptInput = document.getElementById("prompt");
const charCount = document.getElementById("charCount");
const lyricsInput = document.getElementById("lyrics");
const notice = document.getElementById("notice");
const generateBtn = document.getElementById("generateBtn");
const audioPlayer = document.getElementById("audioPlayer");
const trackList = document.getElementById("trackList");
const emptyState = document.getElementById("emptyState");
const libraryCount = document.getElementById("libraryCount");

promptInput.addEventListener("input", () => {
  charCount.textContent = `${promptInput.value.length} / 1200`;
});

document.querySelectorAll('input[name="lyricsMode"]').forEach(input => {
  input.addEventListener("change", () => {
    lyricsInput.classList.toggle("hidden", input.value !== "custom" || !input.checked);
  });
});

function showNotice(message, type = "info") {
  notice.textContent = message;
  notice.className = `notice ${type}`;
}

async function checkServer() {
  const status = document.getElementById("serviceStatus");
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    status.textContent = data.ok ? "Sunucu hazır" : "Sunucu kontrol edilmeli";
    document.querySelector(".status-dot").style.background = data.ok ? "#77936d" : "#d6a34a";
  } catch {
    status.textContent = "Sunucuya ulaşılamıyor";
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const lyricsMode = document.querySelector('input[name="lyricsMode"]:checked').value;
  const payload = {
    prompt: promptInput.value.trim(),
    genre: document.getElementById("genre").value,
    vocal: document.getElementById("vocal").value,
    mood: document.getElementById("mood").value,
    lyricsMode,
    lyrics: lyricsMode === "custom" ? lyricsInput.value.trim() : ""
  };

  if (!payload.prompt) {
    showNotice("Önce nasıl bir şarkı istediğini tarif et.", "error");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Bağlantı kontrol ediliyor…";
  showNotice("Üretim servisi kontrol ediliyor. Bu başlangıç sürümünde henüz bir AI müzik sağlayıcısı bağlanmadı.");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.error || "Şarkı oluşturulamadı.");
    showNotice("İstek alındı.", "success");
  } catch (error) {
    showNotice(`${error.message} API bağlantısını tamamladığımızda burada gerçek şarkı üretimi başlayacak.`, "error");
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>✦</span> Şarkı oluştur <span class="arrow">→</span>';
  }
});

function scrollToCreator() {
  document.getElementById("create").scrollIntoView({ behavior: "smooth" });
  promptInput.focus({ preventScroll: true });
}
document.getElementById("newProjectBtn").addEventListener("click", scrollToCreator);
document.getElementById("emptyCreateBtn").addEventListener("click", scrollToCreator);
document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

checkServer();


const coverFile = document.getElementById("coverFile");
const coverFileName = document.getElementById("coverFileName");
const coverNotice = document.getElementById("coverNotice");
const coverBtn = document.getElementById("coverBtn");

coverFile.addEventListener("change", () => {
  coverFileName.textContent = coverFile.files[0]?.name || "Dosya seçilmedi";
});

function showCoverNotice(message, type = "info") {
  coverNotice.textContent = message;
  coverNotice.className = `notice ${type}`;
}

coverBtn.addEventListener("click", async () => {
  const file = coverFile.files[0];
  const sourceUrl = document.getElementById("coverUrl").value.trim();
  const rightsConfirmed = document.getElementById("rightsConfirm").checked;

  if (!file && !sourceUrl) {
    showCoverNotice("Önce bir ses dosyası veya desteklenen kaynak bağlantısı ekle.", "error");
    return;
  }
  if (!rightsConfirmed) {
    showCoverNotice("Devam etmek için bu içeriği kullanma hakkın veya gerekli iznin olduğunu doğrulamalısın.", "error");
    return;
  }

  coverBtn.disabled = true;
  coverBtn.textContent = "Bağlantı kontrol ediliyor…";
  try {
    // Only metadata is sent in this starter. Binary upload and provider-specific
    // source import will be implemented with the selected licensed provider.
    const response = await fetch("/api/cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file?.name || "",
        sourceUrl,
        genre: document.getElementById("coverGenre").value,
        vocal: document.getElementById("coverVocal").value,
        mood: document.getElementById("coverMood").value,
        preserveLyrics: true,
        preserveMelody: true,
        rightsConfirmed
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.error || "Cover oluşturulamadı.");
    showCoverNotice("Cover isteği alındı.", "success");
  } catch (error) {
    showCoverNotice(`${error.message} Uyumlu AI cover servisini bağladığımızda gerçek üretim etkinleşecek.`, "error");
  } finally {
    coverBtn.disabled = false;
    coverBtn.innerHTML = '<span>♫</span> Cover oluştur <span class="arrow">→</span>';
  }
});
