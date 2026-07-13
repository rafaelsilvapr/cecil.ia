"""
YouTube Audio Downloader - Sistema Rousseau

Módulo para download de áudio de vídeos do YouTube.
"""

from pytube import YouTube
import os
import tempfile
import logging

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
            'm.youtube.com/watch?'
        ]
        return any(pattern in url for pattern in youtube_patterns)

    def get_video_info(self, url):
        """
        Obtém informações do vídeo sem fazer download.

        Args:
            url: str - URL do YouTube

        Returns:
            dict com 'title', 'duration', 'author' ou None se erro
        """
        try:
            yt = YouTube(url)
            return {
                'title': yt.title,
                'duration': yt.length,
                'author': yt.author,
                'thumbnail': yt.thumbnail_url
            }
        except Exception as e:
            logger.error(f"Erro ao obter informações: {e}")
            return None

    def download_audio(self, url, filename=None, progress_callback=None):
        """
        Faz download do áudio de um vídeo do YouTube.

        Args:
            url: str - URL do YouTube
            filename: str - nome customizado (opcional)
            progress_callback: função callback para progresso (opcional)
                              recebe (stream, chunk, bytes_remaining)

        Returns:
            str: caminho do arquivo baixado ou None se erro
        """
        try:
            logger.info(f"Iniciando download: {url}")

            yt = YouTube(url, on_progress_callback=progress_callback)

            audio_stream = yt.streams.filter(only_audio=True).first()

            if not audio_stream:
                logger.error("Nenhum stream de áudio encontrado")
                return None

            if filename:
                base_filename = os.path.splitext(filename)[0]
            else:
                base_filename = yt.title

            safe_filename = "".join(c for c in base_filename if c.isalnum() or c in (' ', '-', '_'))
            safe_filename = safe_filename.strip()

            logger.info(f"Baixando áudio: {safe_filename}")
            output_path = audio_stream.download(
                output_path=self.output_dir,
                filename=f"{safe_filename}.mp3"
            )

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

        def progress(stream, chunk, bytes_remaining):
            total = stream.filesize
            downloaded = total - bytes_remaining
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
