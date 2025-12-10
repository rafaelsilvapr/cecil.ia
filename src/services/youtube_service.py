from googleapiclient.discovery import build

def search_video(creds, query):
    """Searches for a video on YouTube related to the query."""
    service = build('youtube', 'v3', credentials=creds)

    request = service.search().list(
        part="snippet",
        maxResults=1,
        q=query,
        type="video",
        videoEmbeddable="true"
    )
    response = request.execute()

    items = response.get('items', [])
    if not items:
        return None

    video = items[0]
    video_title = video['snippet']['title']
    video_id = video['id']['videoId']
    video_url = f"https://www.youtube.com/watch?v={video_id}"

    return {
        'title': video_title,
        'url': video_url
    }
