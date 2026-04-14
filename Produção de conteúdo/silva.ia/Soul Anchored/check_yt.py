import subprocess
try:
    cmd = "yt-dlp -f 'worstvideo[ext=mp4]/worst' -g 'https://www.youtube.com/watch?v=f1JxtVW4I5U'"
    res = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
    print("SUCCESS:\n", res.decode('utf-8'))
except subprocess.CalledProcessError as e:
    print("FAILED:\n", e.output.decode('utf-8'))
