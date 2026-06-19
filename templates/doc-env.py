#!/usr/bin/env python3
"""doc-env - DOCS 모드 cross-platform 헬퍼 (Windows/macOS/Linux).

한 곳에 모은 OS 분기: soffice/chrome 경로, 한글 폰트, 변환 래퍼, eastAsia/registerFont.
형식별 reference는 세부 OS 경로를 직접 적지 않고 여기로 위임한다.

CLI:
  python doc-env.py soffice-convert <src> <fmt> [outdir]   # 예: ... report.docx pdf out/
  python doc-env.py chrome-pdf <html> <out.pdf>
  python doc-env.py pandoc <src> <out> [extra]             # md<->office (예: in.md out.docx)
  python doc-env.py font                                   # 한글 TTF 경로 + 폰트명 출력
"""
from __future__ import annotations
import os
import sys
import shutil
import subprocess
from pathlib import Path

WIN = sys.platform.startswith("win")
MAC = sys.platform == "darwin"


# ---- 실행 파일 경로 탐지 ----------------------------------------------------

def find_soffice() -> str | None:
    """LibreOffice soffice 실행 파일. 환경변수 SOFFICE > PATH > 관례적 설치 경로."""
    env = os.environ.get("SOFFICE")
    cands = [env] if env else []
    cands += ["soffice", "soffice.com", "libreoffice"]
    if MAC:
        cands.append("/Applications/LibreOffice.app/Contents/MacOS/soffice")
        cands.append("/opt/homebrew/bin/soffice")
    elif WIN:
        cands += [
            r"C:\Program Files\LibreOffice\program\soffice.com",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.com",
        ]
    else:
        cands += ["/usr/bin/soffice", "/usr/bin/libreoffice"]
    return _first_runnable(cands)


def find_chrome() -> str | None:
    """Chrome/Chromium 실행 파일 (headless PDF용)."""
    env = os.environ.get("CHROME")
    cands = [env] if env else []
    if MAC:
        cands += [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
        ]
    elif WIN:
        cands += [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        ]
    cands += ["google-chrome", "chromium", "chromium-browser", "chrome"]
    return _first_runnable(cands)


def find_pandoc() -> str | None:
    """pandoc 실행 파일 (Markdown <-> office 변환). 환경변수 PANDOC > PATH > 관례 경로."""
    env = os.environ.get("PANDOC")
    cands = [env] if env else []
    cands += ["pandoc"]
    if WIN:
        cands += [
            r"C:\Program Files\Pandoc\pandoc.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Pandoc\pandoc.exe"),
        ]
    return _first_runnable(cands)


def _first_runnable(cands) -> str | None:
    for c in cands:
        if not c:
            continue
        if os.path.isabs(c) and os.path.exists(c):
            return c
        found = shutil.which(c)
        if found:
            return found
    return None


# ---- 한글 폰트 -------------------------------------------------------------

def korean_ttf_path() -> str | None:
    """ReportLab 등 TTF 등록용 한글 폰트 파일 경로. 첫 번째 존재 파일."""
    if WIN:
        cands = [r"C:\Windows\Fonts\malgun.ttf", r"C:\Windows\Fonts\NanumGothic.ttf",
                 r"C:\Windows\Fonts\gulim.ttc"]
    elif MAC:
        cands = ["/System/Library/Fonts/Supplemental/AppleGothic.ttf",
                 "/Library/Fonts/NanumGothic.ttf",
                 "/System/Library/Fonts/AppleSDGothicNeo.ttc"]
    else:
        cands = ["/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
                 "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"]
    return next((p for p in cands if os.path.exists(p)), None)


def korean_font_name() -> str:
    """docx/pptx에 박을 한글 폰트 이름 (협업 호환 우선)."""
    if WIN:
        return "Malgun Gothic"
    if MAC:
        return "AppleGothic"
    return "NanumGothic"


def set_docx_eastasia(doc, name: str | None = None):
    """python-docx Normal 스타일에 한글(w:eastAsia) 폰트 지정. doc를 그대로 반환."""
    from docx.oxml.ns import qn
    name = name or korean_font_name()
    st = doc.styles["Normal"]
    st.font.name = name
    st.element.rPr.rFonts.set(qn("w:eastAsia"), name)
    return doc


def register_reportlab_korean(font_name: str = "KO") -> bool:
    """ReportLab에 한글 TTF 등록. 성공하면 True. .ttc는 subfontIndex=0."""
    path = korean_ttf_path()
    if not path:
        return False
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    kw = {"subfontIndex": 0} if path.lower().endswith(".ttc") else {}
    pdfmetrics.registerFont(TTFont(font_name, path, **kw))
    return True


# ---- 변환 래퍼 -------------------------------------------------------------

def soffice_convert(src: str, fmt: str = "pdf", outdir: str = ".") -> str:
    """LibreOffice headless 변환. 산출 경로 반환. 실패 시 RuntimeError.
    주의: .hwpx 입력은 H2Orestart 확장 설치가 필요(미설치 시 'source file could not be loaded')."""
    soffice = find_soffice()
    if not soffice:
        raise RuntimeError("LibreOffice(soffice) 없음 - 설치하거나 원본 + 수동 변환 안내")
    os.makedirs(outdir, exist_ok=True)
    r = subprocess.run([soffice, "--headless", "--convert-to", fmt, "--outdir", outdir, src],
                       capture_output=True, text=True)
    out = os.path.join(outdir, os.path.splitext(os.path.basename(src))[0] + "." + fmt.split(":")[0])
    if r.returncode != 0 or not os.path.exists(out):
        raise RuntimeError(f"soffice 변환 실패: {r.stdout.strip()} {r.stderr.strip()}")
    return out


def chrome_to_pdf(html_path: str, pdf_path: str) -> str:
    """HTML -> PDF (Chrome headless). H2Orestart/Java 불필요. 산출 경로 반환."""
    chrome = find_chrome()
    if not chrome:
        raise RuntimeError("Chrome/Chromium 없음 - WeasyPrint 또는 수동 인쇄 안내")
    url = Path(html_path).resolve().as_uri()  # file:/// URI - 윈도우 역슬래시/공백 경로까지 정확
    r = subprocess.run([chrome, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                        f"--print-to-pdf={pdf_path}", url], capture_output=True, text=True)
    if not os.path.exists(pdf_path):
        raise RuntimeError(f"chrome PDF 실패: {r.stderr.strip()}")
    return pdf_path


def pandoc_convert(src: str, out: str, extra: list[str] | None = None) -> str:
    """pandoc 변환 (md->docx/pptx, docx->md 등). 산출 경로 반환. 실패 시 RuntimeError.
    pandoc 부재 시: MD->PDF는 chrome_to_pdf(HTML 경유)로 폴백, MD->docx/pptx는 pandoc 설치 필요(위조 금지)."""
    pandoc = find_pandoc()
    if not pandoc:
        raise RuntimeError("pandoc 없음 - MD<->office는 pandoc 설치 권장(MD->PDF는 chrome 폴백 가능)")
    r = subprocess.run([pandoc, src, "-o", out] + (extra or []), capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(out):
        raise RuntimeError(f"pandoc 변환 실패: {r.stdout.strip()} {r.stderr.strip()}")
    return out


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(2)
    cmd = args[0]
    if cmd == "soffice-convert":
        print(soffice_convert(args[1], args[2] if len(args) > 2 else "pdf",
                              args[3] if len(args) > 3 else "."))
    elif cmd == "chrome-pdf":
        print(chrome_to_pdf(args[1], args[2]))
    elif cmd == "pandoc":
        print(pandoc_convert(args[1], args[2], args[3:] or None))
    elif cmd == "font":
        print("ttf:", korean_ttf_path())
        print("name:", korean_font_name())
    else:
        print(__doc__)
        sys.exit(2)
