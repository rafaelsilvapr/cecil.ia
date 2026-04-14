import requests

urls = [
    "https://www.youtube.com/@redepedagogica",
    "https://www.youtube.com/@socorromeufilhonaoestuda",
    "https://www.youtube.com/@MrNapoles",
    "https://www.youtube.com/@NotSoWimpyTeacher",
    "https://www.youtube.com/@DiogoAlmeidaOficial",
    "https://www.youtube.com/@leofraimanoficial",
    "https://www.youtube.com/channel/UC3txF9dXx7xaoXjddU_1Xaw"
]

for url in urls:
    r = requests.get(url)
    print(f"{url}: {r.status_code}")
