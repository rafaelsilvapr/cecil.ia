"""
YouTube Audio Downloader - Sistema Rousseau

Módulo para download de áudio de vídeos do YouTube.

Implementado sobre o yt-dlp (sucessor mantido do youtube-dl). A versão
anterior usava pytube, que está abandonado e quebra a cada mudança do
YouTube — a interface pública foi mantida igual.
"""

import os
import shutil
import tempfile
import logging

import yt_dlp

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class YouTubeDownloader:
    """Gerencia downloads de áudio do YouTube."""

    def __init__(self, output_dir=None):
        """
        Inicializa o downloader.

        Args:
            output_dir: diretório de saída (padrão: temp)
        """
        if output_dir is None:
            self.output_dir = tempfile.gettempdir()
        else:
            self.output_dir = output_dir

        os.makedirs(self.output_dir, exist_ok=True)

    def is_valid_url(self, url):
        """
        Verifica se a URL é válida do YouTube.

        Args:
            url: str - URL a verificar

        Returns:
            bool
        """
        youtube_patterns = [
            'youtube.com/watch?',
            'youtu.be/',
            'youtube.com/embed/',
            'm.youtube.com/watch?',
            'youtube.com/shorts/'
        ]
        return any(pattern in url for pattern in youtube_patterns)

    def get_video_info(self, url):
        """
        Obtém informações do vídeo sem fazer download.

        Args:
            url: str - URL do YouTube

        Returns:
            dict com 'title', 'duration', 'author', 'thumbnail' ou None se erro
        """
        try:
            opts = {"quiet": True, "no_warnings": True, "skip_download": True}
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)
            return {
                'title': info.get('title'),
                'duration': info.get('duration'),
                'author': info.get('uploader') or info.get('channel'),
                'thumbnail': info.get('thumbnail')
            }
        except Exception as e:
            logger.error(f"Erro ao obter informações: {e}")
            return None

    def download_audio(self, url, filename=None, progress_callback=None):
        """
        Faz download do áudio de um vídeo do YouTube.

        Se o ffmpeg estiver disponível, o áudio é convertido para MP3;
        caso contrário, é salvo no formato nativo (m4a/webm).

        Args:
            url: str - URL do YouTube
            filename: str - nome customizado (opcional)
            progress_callback: função callback para progresso (opcional)
                              recebe o dict de status do yt-dlp
                              (chaves úteis: 'status', 'downloaded_bytes',
                              'total_bytes' ou 'total_bytes_estimate')

        Returns:
            str: caminho do arquivo baixado ou None se erro
        """
        try:
            logger.info(f"Iniciando download: {url}")

            if filename:
                base_filename = os.path.splitext(filename)[0]
            else:
                base_filename = "%(title)s"

            has_ffmpeg = shutil.which("ffmpeg") is not None

            opts = {
                "format": "bestaudio/best",
                "outtmpl": os.path.join(self.output_dir, f"{base_filename}.%(ext)s"),
                "restrictfilenames": True,
                "quiet": True,
                "no_warnings": True,
                "noprogress": True,
                "noplaylist": True,
            }
            if progress_callback:
                opts["progress_hooks"] = [progress_callback]
            if has_ffmpeg:
                opts["postprocessors"] = [{
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }]

            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=True)

            output_path = info.get("requested_downloads", [{}])[0].get("filepath")
            if not output_path:
                output_path = ydl.prepare_filename(info)
                if has_ffmpeg:
                    output_path = os.path.splitext(output_path)[0] + ".mp3"

            logger.info(f"Download concluído: {output_path}")
            return output_path

        except Exception as e:
            logger.error(f"Erro no download: {e}")
            return None

    def download_with_progress(self, url, filename=None):
        """
        Download com callback de progresso integrado.

        Args:
            url: str
            filename: str (opcional)

        Returns:
            tuple: (caminho do arquivo, dicionário com info do vídeo)
        """
        info = self.get_video_info(url)

        if not info:
            return None, None

        def progress(status):
            if status.get("status") != "downloading":
                return
            total = status.get("total_bytes") or status.get("total_bytes_estimate")
            downloaded = status.get("downloaded_bytes")
            if total and downloaded is not None:
                percentage = downloaded / total * 100
                logger.info(f"Progresso: {percentage:.1f}%")

        path = self.download_audio(url, filename, progress_callback=progress)

        return path, info


if __name__ == "__main__":
    print("=== YouTube Audio Downloader ===\n")

    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

    downloader = YouTubeDownloader()

    print("Teste 1: Validação de URL")
    is_valid = downloader.is_valid_url(test_url)
    print(f"  URL válida? {is_valid}\n")

    print("Teste 2: Informações do vídeo")
    info = downloader.get_video_info(test_url)
    if info:
        print(f"  Título: {info['title']}")
        print(f"  Duração: {info['duration']}s")
        print(f"  Autor: {info['author']}\n")
