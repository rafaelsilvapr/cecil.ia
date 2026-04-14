import subprocess
import json
import logging

def check_channel(url):
    print(f"\nVerificando canal: {url}")
    for tab in ["videos", "shorts"]:
        cmd = ["yt-dlp", "--dump-json", "--playlist-end", "5", "--ignore-errors", f"{url}/{tab}"]
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = proc.communicate()
        count = len([x for x in stdout.strip().split('\n') if x])
        print(f" -> {tab}: {count} resultados. Erros(se houver): {stderr[:200].strip()}")

# Leo Fraiman might be @leofraimanoficial or maybe just a specific channel id
check_channel("https://www.youtube.com/@SOSEducacao")
check_channel("https://www.youtube.com/@leofraiman")

